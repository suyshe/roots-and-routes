const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePostInput, buildStoragePath, normalizePostRecord } = require('./posts');

test('validatePostInput rejects invalid type and coordinates', () => {
  assert.throws(() => validatePostInput({ type: 'blog', title: 'Hello', latitude: 10, longitude: 20 }), /type/i);
  assert.throws(() => validatePostInput({ type: 'memory', title: 'Hello', latitude: 91, longitude: 20 }), /latitude/i);
  assert.throws(() => validatePostInput({ type: 'memory', title: 'Hello', latitude: 10, longitude: 181 }), /longitude/i);
});

test('normalizePostRecord converts front-end fields to canonical post values', () => {
  const record = normalizePostRecord({
    type: 'memory',
    title: 'Old lane',
    description: 'A story',
    latitude: 18.5,
    longitude: 73.8,
    category: 'tradition',
    severity: 'medium',
    status: 'pending',
    photo: 'https://example.com/old.jpg',
    photos: ['https://example.com/one.jpg', 'https://example.com/two.jpg'],
  });

  assert.equal(record.type, 'memory');
  assert.equal(record.latitude, 18.5);
  assert.equal(record.longitude, 73.8);
  assert.equal(record.severity, null);
  assert.equal(record.status, 'pending');
  assert.deepEqual(record.photo_urls, ['https://example.com/one.jpg', 'https://example.com/two.jpg']);
});

test('legacy status values are accepted and mapped to the new post model', () => {
  const record = normalizePostRecord({
    type: 'safety',
    title: 'Broken signal',
    latitude: 10,
    longitude: 20,
    status: 'in-progress',
    severity: 'high',
  });

  assert.equal(record.status, 'reviewing');
  assert.equal(record.severity, 'high');
});

test('buildStoragePath produces unique per-post file paths', () => {
  const first = buildStoragePath('123e4567-e89b-12d3-a456-426614174000', 'photo.jpg');
  const second = buildStoragePath('123e4567-e89b-12d3-a456-426614174000', 'photo.jpg');
  assert.match(first, /^posts\/123e4567-e89b-12d3-a456-426614174000\//);
  assert.notEqual(first, second);
});
