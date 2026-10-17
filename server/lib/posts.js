const crypto = require('crypto');
const path = require('path');

const VALID_POST_TYPES = ['memory', 'safety', 'accessibility', 'heritage'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['pending', 'reviewing', 'resolved'];
const DEFAULT_CATEGORY = {
  memory: 'story',
  heritage: 'landmark',
  safety: 'other',
  accessibility: 'other',
};

function getStorageBaseUrl() {
  const root = (process.env.SUPABASE_URL || '').trim();
  if (!root) return '';
  return `${root.replace(/\/$/, '')}/storage/v1/object/public/community-post-images/`;
}

function extractPublicUrl(storagePath) {
  if (!storagePath) return '';
  const baseUrl = getStorageBaseUrl();
  if (!baseUrl) return storagePath;
  return `${baseUrl}${encodeURI(storagePath.replace(/^\/+/, ''))}`;
}

function normalizePhotoUrls(input = {}) {
  const urls = [];

  const addValue = (value) => {
    if (typeof value === 'string' && value.trim()) urls.push(value.trim());
  };

  const hasStructuredPhotoList = Array.isArray(input.photo_urls) || Array.isArray(input.photos) || Array.isArray(input.post_images);

  if (Array.isArray(input.photo_urls)) input.photo_urls.forEach(addValue);
  if (Array.isArray(input.photos)) input.photos.forEach(addValue);
  if (Array.isArray(input.post_images)) {
    input.post_images.forEach((img) => {
      if (!img) return;
      if (typeof img === 'string') addValue(img);
      if (img.storage_url) addValue(img.storage_url);
      if (img.storage_path) addValue(extractPublicUrl(img.storage_path));
    });
  }

  if (!hasStructuredPhotoList && input.photo) addValue(input.photo);

  const unique = [];
  for (const value of urls) {
    if (!unique.includes(value)) unique.push(value);
  }
  return unique;
}

function buildStoragePath(postId, fileName) {
  const safeName = String(fileName || 'upload')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'upload';
  const ext = path.extname(safeName) || '.jpg';
  const cleanBase = path.basename(safeName, ext).slice(0, 40) || 'upload';
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `posts/${postId}/${unique}-${cleanBase}${ext}`.toLowerCase();
}

function validatePostInput(input = {}) {
  const rawType = String(input.type ?? input.postType ?? '').trim();
  const type = rawType;
  if (!VALID_POST_TYPES.includes(type)) {
    throw new Error('type must be one of: ' + VALID_POST_TYPES.join(', '));
  }

  const title = String(input.title ?? '').trim();
  if (!title) throw new Error('title is required');
  if (title.length > 120) throw new Error('title must be 120 characters or fewer');

  const description = String(input.description ?? '').trim();
  if (description.length > 2000) {
    throw new Error('description must be 2000 characters or fewer');
  }

  const latitude = Number(input.latitude ?? input.lat ?? NaN);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('latitude must be between -90 and 90');
  }

  const longitude = Number(input.longitude ?? input.lng ?? NaN);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('longitude must be between -180 and 180');
  }

  const category = String(input.category ?? DEFAULT_CATEGORY[type] ?? 'other').trim() || 'other';

  let severity = input.severity ?? null;
  if (severity !== null && severity !== undefined) {
    severity = String(severity).trim().toLowerCase();
    if (!VALID_SEVERITIES.includes(severity)) {
      throw new Error('severity must be low, medium, or high');
    }
  }
  if ((type === 'memory' || type === 'heritage') && severity) {
    severity = null;
  }

  const status = String(input.status ?? 'pending').trim().toLowerCase();
  const normalizedStatus = status === 'open' ? 'pending' : status === 'in-progress' ? 'reviewing' : status;
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error('status must be pending, reviewing, or resolved');
  }

  return {
    type,
    title,
    description,
    latitude,
    longitude,
    category,
    severity: severity || null,
    status: normalizedStatus,
  };
}

function normalizePostRecord(input = {}) {
  const validated = validatePostInput(input);
  const photoUrls = normalizePhotoUrls(input);

  const dateValue = input.created_at || input.createdAt || new Date().toISOString();
  const author = String(input.author ?? 'Community member').trim() || 'Community member';
  const dateLabel = String(input.date_label ?? input.dateLabel ?? '').trim();

  return {
    id: input.id || null,
    type: validated.type,
    title: validated.title,
    description: validated.description,
    category: validated.category,
    latitude: validated.latitude,
    longitude: validated.longitude,
    lat: validated.latitude,
    lng: validated.longitude,
    severity: validated.severity,
    status: validated.status,
    author,
    date_label: dateLabel,
    dateLabel,
    created_at: dateValue,
    createdAt: dateValue,
    updated_at: input.updated_at || input.updatedAt || dateValue,
    updatedAt: input.updated_at || input.updatedAt || dateValue,
    user_id: input.user_id ?? null,
    photo: photoUrls[0] || input.photo || null,
    photo_url: photoUrls[0] || input.photo || null,
    photos: photoUrls,
    photo_urls: photoUrls,
  };
}

module.exports = {
  VALID_POST_TYPES,
  VALID_SEVERITIES,
  VALID_STATUSES,
  DEFAULT_CATEGORY,
  buildStoragePath,
  validatePostInput,
  normalizePostRecord,
  extractPublicUrl,
};
