// Roots & Routes data layer.
//
// Two backends, same API:
//   1. LOCAL  — a JSON file in server/data/markers.json. Works out of the box.
//   2. SUPABASE — used automatically when VITE_SUPABASE_URL and
//               SUPABASE_SERVICE_ROLE_KEY are set in the project-root .env.
//               Run the SQL schema in server/db/supabase-posts-schema.sql once.

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const {
  VALID_POST_TYPES,
  VALID_SEVERITIES,
  VALID_STATUSES,
  DEFAULT_CATEGORY,
  validatePostInput,
  normalizePostRecord,
  buildStoragePath,
} = require('./posts');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'markers.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const IMAGE_BUCKET = 'community-post-images';

function publicImageUrl(storagePath) {
  return `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${IMAGE_BUCKET}/${storagePath}`;
}

async function getUploadBuffer(file) {
  if (file.buffer) return file.buffer;
  if (file.path) return fs.promises.readFile(file.path);
  throw new Error('Uploaded image has no readable file data');
}

let supabase = null;
if (useSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[db] Using Supabase backend');
} else {
  console.log('[db] Using local JSON backend (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to switch)');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const VALID_TYPES = [...VALID_POST_TYPES];
const VALID_STATUS = ['pending', 'reviewing', 'resolved'];
const VALID_SEVERITY = [...VALID_SEVERITIES];
const LEGACY_STATUS_MAP = { open: 'pending', 'in-progress': 'reviewing', resolved: 'resolved' };
const LEGACY_STATUS_REVERSE = { pending: 'open', reviewing: 'in-progress', resolved: 'resolved' };
const LEGACY_SEVERITY = ['low', 'medium', 'high'];

let localMarkers = [];
function loadLocal() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      localMarkers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('[db] Could not read local database, starting empty:', err.message);
    localMarkers = [];
  }
}
function saveLocal() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(localMarkers, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}
loadLocal();

function normalizeStatus(value, fallback = 'pending') {
  const raw = String(value ?? fallback).trim().toLowerCase();
  return LEGACY_STATUS_MAP[raw] || (VALID_STATUS.includes(raw) ? raw : fallback);
}

function toLegacyStatus(value) {
  return LEGACY_STATUS_REVERSE[String(value || 'pending').trim().toLowerCase()] || 'open';
}

function normalizeRecord(input) {
  const raw = normalizePostRecord(input);
  return {
    ...raw,
    status: VALID_STATUS.includes(raw.status) ? raw.status : 'pending',
    severity: raw.severity && VALID_SEVERITIES.includes(raw.severity) ? raw.severity : null,
    photo: raw.photo || null,
    photos: raw.photo_urls || [],
  };
}

function mapRowToMarker(row) {
  const photos = Array.isArray(row.photo_urls) ? row.photo_urls : (Array.isArray(row.photos) ? row.photos : []);
  const primary = row.photo || photos[0] || null;
  const status = toLegacyStatus(row.status || 'pending');
  const severity = row.severity && VALID_SEVERITY.includes(row.severity) ? row.severity : null;
  return {
    id: row.id,
    type: row.type,
    category: row.category || DEFAULT_CATEGORY[row.type] || 'other',
    title: row.title,
    description: row.description || '',
    lat: Number(row.latitude ?? row.lat ?? 0),
    lng: Number(row.longitude ?? row.lng ?? 0),
    severity,
    status,
    photo: primary,
    photos,
    author: row.author || 'Community member',
    dateLabel: row.date_label || row.dateLabel || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    userId: row.user_id || row.userId || null,
  };
}

function markerToSb(m) {
  const normalized = normalizeRecord({
    ...m,
    latitude: m.latitude ?? m.lat,
    longitude: m.longitude ?? m.lng,
    title: m.title,
    description: m.description,
    type: m.type,
    category: m.category,
    status: normalizeStatus(m.status, 'pending'),
    severity: m.severity,
    photos: Array.isArray(m.photos) ? m.photos : m.photo ? [m.photo] : [],
    photo: m.photo || null,
  });

  return {
    id: m.id || uid(),
    type: normalized.type,
    category: normalized.category,
    title: normalized.title,
    description: normalized.description,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    severity: normalized.severity,
    status: normalized.status,
    user_id: m.userId || null,
    author: m.author || 'Community member',
    date_label: m.dateLabel || '',
    created_at: m.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function markerFromPost(post) {
  return mapRowToMarker(post);
}

async function listPosts({ type } = {}) {
  if (useSupabase) {
    let query = supabase.from('posts').select('*, post_images(*)').order('created_at', { ascending: false });
    if (type && VALID_TYPES.includes(type)) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw new Error('Supabase posts query failed: ' + error.message);
    return (data || []).map((row) => {
      const photoUrls = (row.post_images || [])
        .map((img) => img.storage_path ? publicImageUrl(img.storage_path) : img.storage_url)
        .filter(Boolean);
      return mapRowToMarker({ ...row, photo_urls: photoUrls, photos: photoUrls });
    });
  }

  let rows = localMarkers.map((row) => markerFromPost({ ...row, latitude: row.lat, longitude: row.lng, created_at: row.createdAt, photo_urls: row.photos || (row.photo ? [row.photo] : []) }));
  if (type && VALID_TYPES.includes(type)) rows = rows.filter((m) => m.type === type);
  return rows;
}

async function listMarkers({ type } = {}) {
  return listPosts({ type });
}

async function createPost(input, files = []) {
  const normalized = normalizeRecord(input);
  const base = {
    type: normalized.type,
    title: normalized.title,
    description: normalized.description,
    category: normalized.category,
    latitude: Number(normalized.latitude),
    longitude: Number(normalized.longitude),
    severity: normalized.severity,
    status: normalized.status,
    user_id: input.user_id || null,
    author: input.author || 'Community member',
    date_label: input.date_label || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (useSupabase) {
    if (typeof input.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)) {
      base.id = input.id;
    }
    const uploadedImages = [];
    let createdPostId = null;

    try {
      const { data, error } = await supabase.from('posts').insert(base).select().single();
      if (error) throw new Error('Post creation failed: ' + error.message);
      createdPostId = data.id;

      for (const file of files || []) {
        if (!file || !file.originalname) continue;
        const storagePath = buildStoragePath(data.id, file.originalname);
        const fileBuffer = await getUploadBuffer(file);
        const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(storagePath, fileBuffer, {
          upsert: false,
          contentType: file.mimetype || file.type || 'application/octet-stream',
        });
        if (uploadError) {
          throw new Error('Image upload failed: ' + uploadError.message);
        }
        uploadedImages.push(storagePath);
        const { error: insertError } = await supabase.from('post_images').insert({
          post_id: data.id,
          storage_path: storagePath,
          display_order: uploadedImages.length,
        });
        if (insertError) throw new Error('Image metadata insert failed: ' + insertError.message);
      }

      const finalRecord = await getPostById(data.id);
      const photoUrls = uploadedImages.map(publicImageUrl);
      return finalRecord || mapRowToMarker({ ...data, photo_urls: photoUrls, photos: photoUrls });
    } catch (err) {
      if (uploadedImages.length > 0) {
        const { error: cleanupError } = await supabase.storage.from(IMAGE_BUCKET).remove(uploadedImages);
        if (cleanupError) console.error('[db] Could not clean up failed post image uploads:', cleanupError.message);
      }
      if (createdPostId) {
        const { error: cleanupError } = await supabase.from('posts').delete().eq('id', createdPostId);
        if (cleanupError) console.error('[db] Could not remove incomplete post after image upload failure:', cleanupError.message);
      }
      throw err;
    }
  }

  const postId = input.id || uid();
  const marker = {
    id: postId,
    type: base.type,
    category: base.category,
    title: base.title,
    description: base.description,
    lat: base.latitude,
    lng: base.longitude,
    severity: base.severity,
    status: toLegacyStatus(base.status),
    photo: input.photo || (Array.isArray(input.photos) ? input.photos[0] : null),
    photos: Array.isArray(input.photos) ? input.photos : (input.photo ? [input.photo] : []),
    author: base.author,
    dateLabel: base.date_label,
    createdAt: base.created_at,
    userId: base.user_id,
  };
  localMarkers.unshift(marker);
  saveLocal();
  return marker;
}

async function createMarker(input) {
  return createPost(input);
}

async function getPostById(id) {
  if (useSupabase) {
    const { data, error } = await supabase.from('posts').select('*, post_images(*)').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Supabase post lookup failed: ' + error.message);
    }
    const photoUrls = (data.post_images || [])
      .map((img) => img.storage_path ? publicImageUrl(img.storage_path) : img.storage_url)
      .filter(Boolean);
    return mapRowToMarker({ ...data, photo_urls: photoUrls, photos: photoUrls });
  }
  return listMarkers().then((rows) => rows.find((m) => m.id === id) || null);
}

async function updatePost(id, patch) {
  const updates = {};
  if (patch.title !== undefined) updates.title = String(patch.title).trim();
  if (patch.description !== undefined) updates.description = String(patch.description).trim();
  if (patch.category !== undefined) updates.category = String(patch.category).trim();
  if (patch.status !== undefined) updates.status = normalizeStatus(patch.status, 'pending');
  if (patch.severity !== undefined) updates.severity = patch.severity ? String(patch.severity).trim().toLowerCase() : null;
  if (patch.latitude !== undefined || patch.lat !== undefined) updates.latitude = Number(patch.latitude ?? patch.lat);
  if (patch.longitude !== undefined || patch.lng !== undefined) updates.longitude = Number(patch.longitude ?? patch.lng);

  if (useSupabase) {
    const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select('*, post_images(*)').single();
    if (error) throw new Error('Supabase post update failed: ' + error.message);
    const photoUrls = (data.post_images || [])
      .map((img) => img.storage_path ? publicImageUrl(img.storage_path) : img.storage_url)
      .filter(Boolean);
    return mapRowToMarker({ ...data, photo_urls: photoUrls, photos: photoUrls });
  }

  const idx = localMarkers.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  for (const key of ['title', 'description', 'category', 'status', 'severity', 'lat', 'lng']) {
    if (patch[key] !== undefined) localMarkers[idx][key] = patch[key];
  }
  saveLocal();
  return localMarkers[idx];
}

async function updateMarker(id, patch) {
  return updatePost(id, patch);
}

async function deletePost(id) {
  if (useSupabase) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw new Error('Supabase post delete failed: ' + error.message);
    return true;
  }
  const before = localMarkers.length;
  localMarkers = localMarkers.filter((m) => m.id !== id);
  saveLocal();
  return localMarkers.length < before;
}

async function deleteMarker(id) {
  return deletePost(id);
}

async function uploadPostImages(postId, files, options = {}) {
  if (!useSupabase) {
    return { uploaded: [], count: 0 };
  }
  const uploaded = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const storagePath = buildStoragePath(postId, file.originalname || `image-${i + 1}`);
    const fileBuffer = await getUploadBuffer(file);
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(storagePath, fileBuffer, {
      upsert: false,
      contentType: file.mimetype || file.type || 'application/octet-stream',
    });
    if (error) throw new Error('Image upload failed: ' + error.message);
    const { error: insertError } = await supabase.from('post_images').insert({
      post_id: postId,
      storage_path: storagePath,
      display_order: i + (options.startIndex || 0),
    });
    if (insertError) throw new Error('Image metadata insert failed: ' + insertError.message);
    uploaded.push(storagePath);
  }
  return { uploaded, count: uploaded.length };
}

async function deletePostImage(id) {
  if (!useSupabase) return true;
  const { data, error } = await supabase.from('post_images').select('storage_path').eq('id', id).single();
  if (error) throw new Error('Image lookup failed: ' + error.message);
  const { error: deleteError } = await supabase.storage.from('community-post-images').remove([data.storage_path]);
  if (deleteError) throw new Error('Image delete failed: ' + deleteError.message);
  const { error: rowError } = await supabase.from('post_images').delete().eq('id', id);
  if (rowError) throw new Error('Image metadata delete failed: ' + rowError.message);
  return true;
}

async function getStats() {
  const markers = await listMarkers();
  const stats = { total: markers.length, memory: 0, heritage: 0, safety: 0, accessibility: 0 };
  for (const m of markers) stats[m.type] = (stats[m.type] || 0) + 1;
  return stats;
}

async function count() {
  if (useSupabase) {
    const { count, error } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    if (error) throw new Error('Supabase count failed: ' + error.message);
    return count;
  }
  return localMarkers.length;
}

async function seedIfEmpty() {
  if ((await count()) > 0) return false;
  const seed = require('./seedData');
  let inserted = 0;
  for (const item of seed) {
    await createMarker(item);
    inserted += 1;
  }
  console.log(`[db] Seeded ${inserted} sample markers into ${useSupabase ? 'Supabase' : 'local JSON'}`);
  return true;
}

function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

module.exports = {
  listMarkers,
  listPosts,
  createMarker,
  createPost,
  getPostById,
  updateMarker,
  updatePost,
  deleteMarker,
  deletePost,
  uploadPostImages,
  deletePostImage,
  getStats,
  seedIfEmpty,
  ensureUploadsDir,
  useSupabase,
  UPLOADS_DIR,
  VALID_TYPES,
  VALID_STATUS,
  VALID_SEVERITY: VALID_SEVERITIES,
};
