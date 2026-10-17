// Roots & Routes API server.
//   npm run dev   (root)  → runs this with --watch plus the Vite client
//   npm start     (root)  → serves the built client + API from one port

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const db = require('./lib/db');
const sheets = require('./lib/sheets');
const { requireAuth, canDeletePost } = require('./lib/auth');

const PORT = Number(process.env.PORT || 4000);
const app = express();

db.ensureUploadsDir();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------- static files
app.use('/uploads', express.static(db.UPLOADS_DIR));

// ---------------------------------------------------------------- photo upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, db.UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
});

app.post('/api/upload', requireAuth, upload.array('photos', 10), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No image files provided' });
  const urls = req.files.map((file) => '/uploads/' + file.filename);
  res.json({ urls, url: urls[0] || null });
});

app.post('/api/posts', requireAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.user_id = req.user.id;
    payload.author = req.user.name;
    if (payload.latitude === undefined && payload.lat !== undefined) payload.latitude = payload.lat;
    if (payload.longitude === undefined && payload.lng !== undefined) payload.longitude = payload.lng;
    if (payload.status === undefined) payload.status = 'pending';
    if (payload.photos && typeof payload.photos === 'string') payload.photos = [payload.photos];
    if (payload.photo && typeof payload.photo === 'string') payload.photo = payload.photo;
    if (payload.type === 'safety' || payload.type === 'accessibility') {
      payload.severity = payload.severity || 'medium';
    }
    const post = await db.createPost(payload, req.files || []);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not create post' });
  } finally {
    for (const file of req.files || []) {
      try {
        await fs.promises.unlink(file.path);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('[uploads] Could not remove temporary file:', err.message);
        }
      }
    }
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.listPosts({ type: req.query.type });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/posts/:id', async (req, res) => {
  try {
    const post = await db.updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name },
    role: req.user.role,
    provider: req.user.provider,
  });
});

async function handlePostDelete(req, res) {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!canDeletePost(req.user, post)) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }
    const removed = await db.deletePost(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Post not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not delete post' });
  }
}

app.delete('/api/posts/:id', requireAuth, handlePostDelete);

// ---------------------------------------------------------------- app config
app.get('/api/config', (_req, res) => {
  res.json({
    center: {
      lat: Number(process.env.MAP_CENTER_LAT || 18.5204),
      lng: Number(process.env.MAP_CENTER_LNG || 73.8567),
    },
    zoom: Number(process.env.MAP_ZOOM || 13),
    googleFormUrl: process.env.GOOGLE_FORM_URL || '',
  });
});

const geocodeCache = new Map();
let lastGeocodeRequestAt = 0;

app.get('/api/geocode', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query || query.length > 200) {
    return res.status(400).json({ error: 'Enter a location name (up to 200 characters).' });
  }

  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) return res.json(geocodeCache.get(cacheKey));

  try {
    const requestSlotAt = Math.max(Date.now(), lastGeocodeRequestAt + 1000);
    const waitMs = requestSlotAt - Date.now();
    lastGeocodeRequestAt = requestSlotAt;
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('q', query);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RootsAndRoutes/1.0 (community map location search)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`Location search service returned HTTP ${response.status}`);
    }

    const results = await response.json();
    if (!results.length) return res.status(404).json({ error: 'Location not found' });

    const result = {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
      name: results[0].display_name,
    };
    if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
      throw new Error('Location search returned invalid coordinates');
    }
    geocodeCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[geocode] Location search failed:', err.message);
    res.status(502).json({ error: 'Location search is temporarily unavailable. Please try again.' });
  }
});

// ---------------------------------------------------------------- markers API
app.get('/api/markers', async (req, res) => {
  try {
    const markers = await db.listMarkers({ type: req.query.type });
    res.json(markers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/markers', requireAuth, async (req, res) => {
  try {
    const marker = await db.createMarker({
      ...req.body,
      user_id: req.user.id,
      author: req.user.name,
    });
    res.status(201).json(marker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/markers/:id', async (req, res) => {
  try {
    const marker = await db.updateMarker(req.params.id, req.body);
    if (!marker) return res.status(404).json({ error: 'Marker not found' });
    res.json(marker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/markers/:id', requireAuth, handlePostDelete);

// ---------------------------------------------------------------- stats & sheets
app.get('/api/stats', async (_req, res) => {
  try {
    res.json(await db.getStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export.csv', async (_req, res) => {
  try {
    const markers = await db.listMarkers();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="civicpulse-markers.csv"');
    res.send('\uFEFF' + sheets.toCsv(markers)); // BOM so Excel/Sheets reads UTF-8
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sync-sheets', async (_req, res) => {
  try {
    const markers = await db.listMarkers();
    res.json(await sheets.syncToSheet(markers));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------- serve client (prod)
const CLIENT_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
  console.log('[server] Serving built client from frontend/dist');
} else {
  console.log('[server] No frontend build found — run `npm run build` to serve the UI from this port, or use the dev server.');
}

// ---------------------------------------------------------------- boot
app.listen(PORT, () => {
  console.log(`[server] Roots & Routes API listening on http://localhost:${PORT}`);
  console.log(`[server] Backend: ${db.useSupabase ? 'Supabase' : 'local JSON (server/data/markers.json)'}`);
});
