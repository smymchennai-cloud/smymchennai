/**
 * Bulandi — Event Registration sheet proxy (CORS-safe fetch for the React site)
 *
 * --- If you see: “You do not have permission to call UrlFetchApp.fetch” / external_request ---
 * 1. Apps Script → Project Settings (gear) → turn ON “Show appsscript.json manifest file in editor”.
 * 2. Open the appsscript.json file in the left file list. Set oauthScopes to include EXACTLY:
 *        "https://www.googleapis.com/auth/script.external_request"
 *    (Copy the whole file from this repo: scripts/appsscript.json — merge oauthScopes if you
 *    already have other scopes; do not remove scopes other features need.)
 * 3. Save all files. In the toolbar, choose function authorizeExternalFetch → Run.
 *    Complete the Google permission screen (connect to external URLs).
 * 4. Deploy → Manage deployments → Edit (pencil) on the Web app → New version → Deploy.
 *    “Execute as: Me” and “Who has access: Anyone” as before.
 *
 * --- First-time setup ---
 * 1. Open https://script.google.com → New project → paste this file as Code.gs
 * 2. Do the manifest + authorizeExternalFetch steps above before relying on the web app.
 * 3. Replace SPREADSHEET_ID if needed (must match bulandi2026Data.eventRegistrationSpreadsheetId)
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL and set bulandi2026Meta.eventRegistrationSheetFetchUrl to that URL
 *
 * The site calls this URL with GET; the script returns the same body as Google’s gviz JSON endpoint.
 */

/**
 * Run once from the Apps Script editor (not from the website) to trigger the OAuth screen
 * for connecting to external URLs, after appsscript.json includes script.external_request.
 */
function authorizeExternalFetch() {
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
}

/** Same ID as in src/data/bulandi2026Data.js → eventRegistrationSpreadsheetId */
var SPREADSHEET_ID = '1X6wXE1AIpR7edkmmtosGq3z4l0s-fPohOeO8qI45Ig4';

/** Default tab gid (first sheet is usually 0). Override with ?gid=123 in the URL if needed. */
var DEFAULT_GID = '0';

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var gid =
    params.gid !== undefined && params.gid !== null && String(params.gid) !== ''
      ? String(params.gid)
      : DEFAULT_GID;

  var sheetId = SPREADSHEET_ID;
  var fromProps = PropertiesService.getScriptProperties().getProperty('BULANDI_SHEET_ID');
  if (fromProps && String(fromProps).trim() !== '') {
    sheetId = String(fromProps).trim();
  }

  var url =
    'https://docs.google.com/spreadsheets/d/' +
    sheetId +
    '/gviz/tq?tqx=out:json&gid=' +
    encodeURIComponent(gid);

  var response;
  try {
    response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
    });
  } catch (err) {
    return errorResponse('Fetch failed: ' + err.message);
  }

  var code = response.getResponseCode();
  var text = response.getContentText();

  if (code !== 200) {
    return errorResponse('Sheet HTTP ' + code + ': ' + text.substring(0, 200));
  }

  // Return raw gviz payload so the website’s parseGvizJsonResponse() keeps working
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function errorResponse(message) {
  var payload = {
    version: '0.6',
    reqId: '0',
    status: 'error',
    errors: [{ reason: 'internal', detailed_message: String(message) }],
  };
  var body = 'google.visualization.Query.setResponse(' + JSON.stringify(payload) + ');';
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}
