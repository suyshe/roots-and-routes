// Shared date/format helpers.

export function timeAgo(iso) {
  if (!iso) return '';
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(secs) || secs < 0) return prettyDate(iso);
  if (secs < 3600) return 'just now';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  if (secs < 604800) return Math.floor(secs / 86400) + 'd ago';
  return prettyDate(iso);
}

export function prettyDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function coords(lat, lng, digits = 5) {
  return `${Number(lat).toFixed(digits)}, ${Number(lng).toFixed(digits)}`;
}
