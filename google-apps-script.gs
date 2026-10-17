/**
 * Roots & Routes → Google Sheets sync.
 *
 * Setup:
 *   1. Create a Google Sheet with a header row matching the CSV headers:
 *      Type, Category, Title, Description, Latitude, Longitude, Severity,
 *      Status, Photo URL, Author, Date label, Created at
 *   2. In the Sheet: Extensions → Apps Script, paste this file, save.
 *   3. Deploy → New deployment → Web app:
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   4. Copy the Web app URL into server/.env as GOOGLE_SHEETS_WEBHOOK_URL.
 *
 * The "Sync to Google Sheets" button in the app POSTs { rows: [...] } here and
 * every row is appended to the sheet. Rows that arrive via a linked Google Form
 * land in the same sheet and can be imported back into the map manually.
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const rows = payload.rows || [];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Type', 'Category', 'Title', 'Description', 'Latitude', 'Longitude',
        'Severity', 'Status', 'Photo URL', 'Author', 'Date label', 'Created at',
      ]);
    }

    for (const row of rows) {
      sheet.appendRow(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, appended: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
