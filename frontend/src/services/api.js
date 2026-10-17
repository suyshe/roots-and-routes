import { supabase } from './supabase.js';

let demo = false;
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const isDemo = () => demo;

async function request(url, options = {}) {
  let res;
  try {
    const headers = new Headers(options.headers || {});
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  } catch (err) {
    demo = true;
    throw new Error('Backend unreachable');
  }
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'object' && data.error ? data.error : data || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const DEFAULT_CONFIG = {
  center: { lat: 18.5204, lng: 73.8567 },
  zoom: 13,
  googleFormUrl: '',
};

export const api = {
  currentUser: () => request('/api/auth/me'),

  config: async () => {
    try {
      return await request('/api/config');
    } catch {
      demo = true;
      return DEFAULT_CONFIG;
    }
  },

  markers: () => request('/api/markers'),

  posts: () => request('/api/posts'),

  geocode: (query) => request(`/api/geocode?q=${encodeURIComponent(query)}`),

  createPost: (body, files = []) => {
    const fd = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => fd.append(key, item));
      } else {
        fd.append(key, value);
      }
    });
    files.forEach((file) => fd.append('photos', file));
    return request('/api/posts', { method: 'POST', body: fd });
  },

  createMarker: (body) => {
    const { files = [], ...rest } = body || {};
    if (files.length > 0) {
      const fd = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((item) => fd.append(key, item));
        } else {
          fd.append(key, value);
        }
      });
      files.forEach((file) => fd.append('photos', file));
      return request('/api/posts', { method: 'POST', body: fd });
    }
    return request('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    });
  },

  updateMarker: (id, patch) =>
    request(`/api/markers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),

  deleteMarker: (id) => request(`/api/markers/${id}`, { method: 'DELETE' }),

  stats: () => request('/api/stats'),

  uploadPhoto: async (file) => {
    const fd = new FormData();
    fd.append('photos', file);
    return request('/api/upload', { method: 'POST', body: fd });
  },

  uploadPhotos: async (files) => {
    const fd = new FormData();
    files.forEach((file) => fd.append('photos', file));
    return request('/api/upload', { method: 'POST', body: fd });
  },

  syncSheets: () => request('/api/sync-sheets', { method: 'POST' }),
};
