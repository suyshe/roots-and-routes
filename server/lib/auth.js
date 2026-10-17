const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

const authClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function parseAdminEmails(value = '') {
  return new Set(
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminEmail(email, adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS || '')) {
  return Boolean(email && adminEmails.has(email.trim().toLowerCase()));
}

function canDeletePost(user, post) {
  return Boolean(user && post && (user.role === 'admin' || user.id === post.userId));
}

async function requireAuth(req, res, next) {
  if (!authClient) {
    return res.status(503).json({
      error: 'Google sign-in is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY on the server.',
    });
  }

  const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ error: 'Sign in with Google to continue.' });

  try {
    const { data, error } = await authClient.auth.getUser(match[1]);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Your sign-in has expired. Please sign in again.' });
    }

    const email = data.user.email || '';
    req.user = {
      id: data.user.id,
      email,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email,
      role: isAdminEmail(email) ? 'admin' : 'user',
      provider: data.user.app_metadata?.provider || 'Google',
    };
    return next();
  } catch (error) {
    console.error('[auth] Could not verify Supabase access token:', error.message);
    return res.status(503).json({ error: 'Sign-in verification is temporarily unavailable.' });
  }
}

module.exports = { requireAuth, parseAdminEmails, isAdminEmail, canDeletePost };
