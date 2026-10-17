// Roots & Routes — Google Sheets helpers.
//
// 1. CSV export — GET /api/export.csv returns every marker as a CSV that can be
//    imported straight into Google Sheets (File → Import).
//
// 2. Live sync — POST /api/sync-sheets pushes markers to a Google Sheets
//    spreadsheet via the Apps Script in google-apps-script.gs. Deploy that script
//    as a Web App, copy its URL into GOOGLE_SHEETS_WEBHOOK_URL, and the
//    "Sync to Google Sheets" button will work from the app.

const HEADERS = [
  'Type',
  'Category',
  'Title',
  'Description',
  'Latitude',
  'Longitude',
  'Severity',
  'Status',
  'Photo URL',
  'Author',
  'Date label',
  'Created at',
];

function toRow(m) {
  return [
    m.type,
    m.category,
    m.title,
    m.description,
    m.lat,
    m.lng,
    m.severity || '',
    m.status || '',
    m.photo || '',
    m.author || '',
    m.dateLabel || '',
    m.createdAt || '',
  ];
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(markers) {
  const lines = [HEADERS.map(csvEscape).join(',')];
  for (const m of markers) lines.push(toRow(m).map(csvEscape).join(','));
  return lines.join('\r\n');
}

async function syncToSheet(markers) {
  const url = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
  if (!url) {
    return {
      ok: false,
      message: 'GOOGLE_SHEETS_WEBHOOK_URL is not configured. See README → Google Sheets setup.',
    };
  }
  const payload = { rows: markers.map(toRow) };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let body = text;
    try { body = JSON.parse(text); } catch { /* keep raw text */ }
    return res.ok
      ? { ok: true, message: `Synced ${payload.rows.length} markers to Google Sheets.`, response: body }
      : { ok: false, message: `Sheets webhook responded ${res.status}.`, response: body };
  } catch (err) {
    return { ok: false, message: 'Could not reach the Sheets webhook: ' + err.message };
  }
}

module.exports = { toCsv, syncToSheet, HEADERS };
