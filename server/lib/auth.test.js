const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAdminEmails, isAdminEmail, canDeletePost } = require('./auth');

test('admin email allowlist is comma-separated and case-insensitive', () => {
  const admins = parseAdminEmails(' Admin@example.com, owner@example.com ,,');
  assert.equal(isAdminEmail('ADMIN@example.com', admins), true);
  assert.equal(isAdminEmail('person@example.com', admins), false);
});

test('users can delete their own posts and admins can delete any post', () => {
  const post = { userId: 'owner-id' };
  assert.equal(canDeletePost({ id: 'owner-id', role: 'user' }, post), true);
  assert.equal(canDeletePost({ id: 'other-id', role: 'user' }, post), false);
  assert.equal(canDeletePost({ id: 'admin-id', role: 'admin' }, post), true);
  assert.equal(canDeletePost(null, post), false);
});
