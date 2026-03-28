/**
 * Bulandi — bound spreadsheet web app (POST registration + GET sheet data for the website)
 *
 * Install: Extensions → Apps Script on the Bulandi registration spreadsheet. Replace Code.gs with this file.
 *
 * DEPLOY (required after any edit):
 *   Deploy → Manage deployments → Edit (pencil) on the Web app → New version → Deploy.
 *   Execute as: Me  ·  Who has access: Anyone (otherwise the public site gets “failed to fetch”).
 *
 * Smoke test: open your Web app URL (ends with /exec) in a normal browser tab.
 *   You must see: google.visualization.Query.setResponse( …
 *   If you see “Bulandi registration web app is running. POST JSON to submit.” you still have an
 *   old doGet somewhere — search the project for “function doGet”, keep only the one in THIS file, redeploy.
 *
 * Website: set BOTH registrationWebAppUrl and eventRegistrationSheetFetchUrl in bulandi2026Data.js to this same /exec URL.
 *
 * POST JSON with action "eventRegistration" to update event columns for an existing row (matched by BR + DOB):
 *   { "action":"eventRegistration", "br":"BR1520", "dob":"2015-06-01",
 *     "eligibleEventNames":["Car Race","Solo Dance",...],
 *     "selectedEventNames":["Car Race","GK Crossword"],
 *     "secret":"..." }   // secret only if SUBMIT_SECRET is set in this script
 * For each eligible event column: writes "Yes" if selected, else "No". Column headers must match event names (same as the website).
 * After a successful update, an email is sent to the row’s Mail/Email column (same layout family as main registration) listing
 * events newly registered vs removed, if anything changed. Uses BULANDI_SEND_EMAIL; skipped if no delta or invalid email.
 *
 * Admin check-in (optional SUBMIT_SECRET same as other POSTs):
 *   adminRegistrationDeskCheckIn — { "action","br","dob" } → writes check-in time in column ddMMyyyyregistered (no hyphens), e.g. 26072026registered.
 *     Hyphens are stripped from br/dob in the JSON body. Legacy column dd-mm-yyyy-registered is still found if present.
 *   adminBackstageCheckIn — { "action","br","dob","eventNames":["Solo Dance",…] } → timestamps in columns like “Backstage — Solo Dance”.
 *   adminBackstageRowCheckIn — { "action","br","dob","eventName":"Solo Dance" } → timestamp in column dd-mm-yyyy-back-stage for today (creates column if missing). Verifies main event column Yes/TRUE.
 *   adminBackstageEligibleList — { "action","eventName":"Solo Dance" } → { deskColumn, backstageColumn, participants:[{…,backstageCheckedInAt}], … }
 *     backstageCheckedInAt is non-empty when today’s dd-mm-yyyy-back-stage cell has a timestamp.
 *     Participants must have a non-empty value in today’s desk column (ddMMyyyyregistered or legacy dd-mm-yyyy-registered) and the main event column must be Yes / TRUE (checkbox).
 *   adminOnStageRowCheckIn — writes dd-mm-yyyy-on-stage only if today’s dd-mm-yyyy-back-stage cell is set (back stage first).
 *   adminOnStageEligibleList — participants must have today’s back-stage column set + event Yes/TRUE; includes onStageCheckedInAt (not desk column).
 *   adminOnStageCheckIn — same with “On stage — …” per-event columns. Participant must be “Yes” on the main event column.
 *
 * GET (default): gviz JSON (no UrlFetchApp — SpreadsheetApp reads the bound sheet).
 * Row 1 of tab SHEET_NAME = headers (BR No, DOB, WhatsApp, Event list, …). Data from row 2.
 * GET ?help=1 — plain-text description.
 */

var SHEET_NAME = 'Bulandi Registration'; // tab name; change if your sheet tab differs
var PAYMENT_FOLDER_ID = '1WxAsWH50zMi72AW8jE56np7EFg4crFRW';

var REF_YYYY = 2026;
var REF_MM = 5; // May (1-based for clarity below)
var REF_DD = 3;

var BR_U15_MIN = 1501;
var BR_U15_MAX = 2999;
var BR_O15_MIN = 3001;
var BR_O15_MAX = 99999;

/** Optional shared secret — if non-empty, JSON body must include the same "secret" string. */
var SUBMIT_SECRET = '';

/** Confirmation email — sent via GmailApp from the account that owns this script (use smymchennai@gmail.com). */
var BULANDI_EVENT_TITLE = 'Kanta J Narayan Rathi Bulandi 2026';
var BULANDI_SENDER_NAME = 'SMYM Bulandi Chennai';
/** Full URL to your Bulandi / events page; empty = no extra link (event tab link below is always added when set). */
var BULANDI_EVENTS_PAGE_URL = '';
/**
 * Direct link to the Event Registration tab on the site (shown in registration and event-choice emails).
 * BR numbers in all emails use this format with no hyphens (e.g. BR1511).
 */
var BULANDI_EVENT_REGISTRATION_TAB_URL = 'https://smymchennai.in/bulandi-2026#event-registration';
/** Set false to skip sending mail (e.g. while testing). Applies to registration confirmation and event-choice updates. */
var BULANDI_SEND_EMAIL = true;

function buildBulandiWhatsappBody_(registrantName, brNumber, dob, eventsUrl) {
  var name = String(registrantName || '').trim() || 'Participant';
  var br = String(brNumber || '').trim();
  var dobStr = String(dob || '').trim();
  var lines = [
    'Dear ' + name + ',',
    '',
    'Thank you for registering for ' + BULANDI_EVENT_TITLE + '.',
    '',
    'Your Bulandi registration number (BR number) is: *' + br + '*',
    '',
    'Please save this number. When you register for individual events, you will need:',
    '• Your BR number: ' + br,
    '• Your date of birth (as submitted): ' + dobStr,
    '',
    'Next step: go through the list of events on the Bulandi page and complete registration for each event you wish to take part in.',
  ];
  if (eventsUrl) {
    lines.push('');
    lines.push(eventsUrl);
  }
  lines.push('');
  lines.push('Warm regards,');
  lines.push(BULANDI_SENDER_NAME);
  return lines.join('\n');
}

/**
 * GET: gviz JSON for website event verification (all columns in SHEET_NAME, row 1 = headers).
 * GET ?help=1: short plain-text help.
 */
function doGet(e) {
  var params = (e && e.parameter) || {};
  if (String(params.help || '') === '1') {
    return ContentService.createTextOutput(
      'POST JSON here for Bulandi registration. GET returns tab "' +
        SHEET_NAME +
        '" as gviz JSON for the SMYM site. Row 1 = headers (BR No, DOB, WhatsApp, Event list, …).'
    ).setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    var body = buildRegistrationSheetGviz_();
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService.createTextOutput(buildGvizErrorBody_(String(err.message || err))).setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return jsonOut({ ok: false, error: 'Server busy. Try again in a moment.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: 'Empty body' });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOut({ ok: false, error: 'Invalid JSON' });
    }

    if (SUBMIT_SECRET && String(body.secret || '') !== SUBMIT_SECRET) {
      return jsonOut({ ok: false, error: 'Unauthorized' });
    }

    if (String(body.action || '') === 'eventRegistration') {
      return handleEventRegistrationPost_(body);
    }

    var act = String(body.action || '');
    if (act === 'adminRegistrationDeskCheckIn') {
      return handleAdminRegistrationDeskCheckIn_(body);
    }
    if (act === 'adminBackstageEligibleList') {
      return handleAdminBackstageEligibleList_(body);
    }
    if (act === 'adminBackstageRowCheckIn') {
      return handleAdminBackstageRowCheckIn_(body);
    }
    if (act === 'adminOnStageEligibleList') {
      return handleAdminOnStageEligibleList_(body);
    }
    if (act === 'adminOnStageRowCheckIn') {
      return handleAdminOnStageRowCheckIn_(body);
    }
    if (act === 'adminBackstageCheckIn') {
      return handleAdminEventCheckIn_(body, 'backstage');
    }
    if (act === 'adminOnStageCheckIn') {
      return handleAdminEventCheckIn_(body, 'onstage');
    }

    var name = String(body.name || '').trim();
    var whatsappNo = String(body.whatsappNo || '').replace(/\D/g, '');
    var phoneAlt = String(body.phoneAlternate || '').replace(/\D/g, '');
    var gender = String(body.gender || '').trim();
    var dob = String(body.dob || '').trim();
    var mail = String(body.mail || '').trim();
    var b64 = body.paymentFileBase64;
    var payName = String(body.paymentFileName || 'payment');
    var payMime = String(body.paymentMimeType || 'image/jpeg');

    if (!name) return jsonOut({ ok: false, error: 'Name is required' });
    if (whatsappNo.length !== 10) return jsonOut({ ok: false, error: 'WhatsApp number must be 10 digits' });
    if (phoneAlt && phoneAlt.length !== 10) return jsonOut({ ok: false, error: 'Alternate phone must be 10 digits' });
    if (!gender) return jsonOut({ ok: false, error: 'Gender is required' });
    if (!dob) return jsonOut({ ok: false, error: 'DOB is required' });
    if (!mail) return jsonOut({ ok: false, error: 'Mail is required' });
    if (!b64) return jsonOut({ ok: false, error: 'Payment screenshot is required' });

    var age = ageOnReferenceDate_(dob, REF_YYYY, REF_MM, REF_DD);
    if (age === null) return jsonOut({ ok: false, error: 'Invalid DOB' });
    if (age < 5) return jsonOut({ ok: false, error: 'Registrant must be more than 5 years old as on 3 May 2026' });

    var pool = age < 15 ? 'u15' : 'o15';
    var brNumber = nextBrNumber_(pool);

    if (!PAYMENT_FOLDER_ID || PAYMENT_FOLDER_ID.indexOf('PASTE_') === 0) {
      return jsonOut({ ok: false, error: 'Configure PAYMENT_FOLDER_ID in Apps Script' });
    }

    var bytes;
    try {
      bytes = Utilities.base64Decode(b64);
    } catch (err2) {
      return jsonOut({ ok: false, error: 'Invalid payment file data' });
    }
    if (!bytes || bytes.length === 0) {
      return jsonOut({ ok: false, error: 'Empty payment file' });
    }
    if (bytes.length > 15 * 1024 * 1024) {
      return jsonOut({ ok: false, error: 'Payment file too large (max 15 MB)' });
    }

    var folder = DriveApp.getFolderById(PAYMENT_FOLDER_ID);
    var blob = Utilities.newBlob(bytes, payMime, sanitizeFilename_(payName));
    var file = folder.createFile(blob);
    var base = brNumber.replace(/[^\w\-]/g, '');
    file.setName(base + '_' + sanitizeFilename_(payName));
    var fileUrl = file.getUrl();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOut({ ok: false, error: 'Sheet not found: ' + SHEET_NAME });
    }

    // Row 1 must be headers, same column order (add e.g. "Event list" and trailing '' here if you added that column).
    sheet.appendRow([
      brNumber,
      name,
      whatsappNo,
      phoneAlt || '',
      gender,
      dob,
      mail,
      fileUrl,
    ]);

    sendBulandiRegistrationConfirmationEmail_(mail, name, brNumber, dob);
    return jsonOut({ ok: true, brNumber: brNumber, whatsappNo: whatsappNo, dob: dob });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** @param {string} s */
function normalizeHeaderForEventMatch_(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** @param {Array} headerRow first sheet row values */
function findSheetColumnKeyForEventName_(headerRow, displayName) {
  var t = normalizeHeaderForEventMatch_(displayName);
  for (var i = 0; i < headerRow.length; i++) {
    var h = String(headerRow[i] || '').trim();
    if (normalizeHeaderForEventMatch_(h) === t) {
      return h;
    }
  }
  return null;
}

/** @param {Array} headerRow */
function findBrColumnKeyFromRow_(headerRow) {
  var headers = [];
  for (var i = 0; i < headerRow.length; i++) {
    headers.push(String(headerRow[i] || '').trim());
  }
  var lower = [];
  for (var j = 0; j < headers.length; j++) {
    lower.push(headers[j].toLowerCase());
  }
  var patterns = [
    /^br\s*number$/,
    /^br\s*no\.?$/,
    /^br$/,
    /br\s*number/,
    /bulandi.*(reg|registration).*(no|num|number)/,
    /registration.*(no|num|number)/,
    /^br\s*$/,
  ];
  for (var p = 0; p < patterns.length; p++) {
    var re = patterns[p];
    for (var k = 0; k < lower.length; k++) {
      if (re.test(lower[k])) return headers[k];
    }
  }
  for (var k2 = 0; k2 < lower.length; k2++) {
    if (lower[k2].indexOf('br') >= 0 && (lower[k2].indexOf('no') >= 0 || lower[k2].indexOf('num') >= 0)) {
      return headers[k2];
    }
  }
  return null;
}

/** @param {Array} headerRow */
function findDobColumnKeyFromRow_(headerRow) {
  var headers = [];
  for (var i = 0; i < headerRow.length; i++) {
    headers.push(String(headerRow[i] || '').trim());
  }
  var lower = [];
  for (var j = 0; j < headers.length; j++) {
    lower.push(headers[j].toLowerCase());
  }
  var patterns = [/date\s*of\s*birth/, /^dob$/, /birth\s*date/, /^dob\s/];
  for (var p = 0; p < patterns.length; p++) {
    var re = patterns[p];
    for (var k = 0; k < lower.length; k++) {
      if (re.test(lower[k])) return headers[k];
    }
  }
  for (var k2 = 0; k2 < lower.length; k2++) {
    if (lower[k2].indexOf('dob') >= 0 || lower[k2].indexOf('birth') >= 0) {
      return headers[k2];
    }
  }
  return null;
}

/** @param {Array} headerRow */
function findNameColumnKeyFromRow_(headerRow) {
  var headers = [];
  for (var i = 0; i < headerRow.length; i++) {
    headers.push(String(headerRow[i] || '').trim());
  }
  var lower = [];
  for (var j = 0; j < headers.length; j++) {
    lower.push(headers[j].toLowerCase());
  }
  var exact = ['name', 'full name', 'participant name', 'registrant name'];
  for (var e = 0; e < exact.length; e++) {
    for (var k = 0; k < lower.length; k++) {
      if (lower[k] === exact[e]) return headers[k];
    }
  }
  for (var k2 = 0; k2 < lower.length; k2++) {
    if (lower[k2].indexOf('whatsapp') >= 0) continue;
    if (lower[k2] === 'first name' || lower[k2] === 'last name') return headers[k2];
    if (lower[k2].indexOf('participant') >= 0 && lower[k2].indexOf('name') >= 0) return headers[k2];
  }
  return null;
}

/** @param {Array} headerRow */
function findMailColumnKeyFromRow_(headerRow) {
  var headers = [];
  for (var i = 0; i < headerRow.length; i++) {
    headers.push(String(headerRow[i] || '').trim());
  }
  var lower = [];
  for (var j = 0; j < headers.length; j++) {
    lower.push(headers[j].toLowerCase());
  }
  var exact = ['mail', 'email', 'e-mail', 'e mail'];
  for (var e = 0; e < exact.length; e++) {
    for (var k = 0; k < lower.length; k++) {
      if (lower[k] === exact[e]) return headers[k];
    }
  }
  for (var k2 = 0; k2 < lower.length; k2++) {
    if (lower[k2].indexOf('email') >= 0) return headers[k2];
  }
  return null;
}

/** First column index where header string equals key (exact trim match). */
function findFirstColumnIndexForKey_(headerRow, key) {
  if (!key) return -1;
  for (var c = 0; c < headerRow.length; c++) {
    if (String(headerRow[c] || '').trim() === key) return c;
  }
  return -1;
}

/**
 * 1-based column index in row 1 whose header equals key (trim). Scans through sheet.getLastColumn().
 * Use this for date-based headers (e.g. ddMMyyyyregistered): getDataRange() often omits columns that
 * only have a header in row 1 with no data below, so headerRow from getValues() would miss them.
 */
function findColumn1BasedForHeaderLabel_(sheet, key) {
  var want = String(key || '').trim();
  if (!want) return -1;
  var last = sheet.getLastColumn();
  if (last < 1) return -1;
  var headers = sheet.getRange(1, 1, 1, last).getValues()[0];
  for (var c = 0; c < headers.length; c++) {
    if (String(headers[c] || '').trim() === want) return c + 1;
  }
  return -1;
}

/** Sheet cell counts as Yes for event columns (case-insensitive). */
function cellIsYes_(val) {
  return String(val || '')
    .trim()
    .toLowerCase() === 'yes';
}

/** Event column counts as registered: Yes, TRUE, checkbox true, common truthy strings. */
function cellCountsAsRegisteredForEvent_(val) {
  if (val === true) return true;
  var s = String(val || '').trim().toLowerCase();
  if (!s) return false;
  if (s === 'yes' || s === 'true' || s === '1' || s === 'y') return true;
  return false;
}

/** Registration desk cell for today has a value (timestamp string or Date). */
function deskCheckInCellIsSet_(val) {
  if (val === null || val === undefined) return false;
  if (Object.prototype.toString.call(val) === '[object Date]' && !isNaN(val.getTime())) return true;
  return String(val).trim() !== '';
}

/** Display string for a check-in timestamp cell (Date or string). Empty if unset. */
function checkInCellDisplayString_(val) {
  if (!deskCheckInCellIsSet_(val)) return '';
  if (Object.prototype.toString.call(val) === '[object Date]' && !isNaN(val.getTime())) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }
  return String(val).trim();
}

/** @param {Array} headerRow */
function findWhatsappColumnKeyFromRow_(headerRow) {
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || '').trim();
    if (!h) continue;
    if (/whatsapp/i.test(h)) return h;
  }
  return null;
}

/** @param {Array} headerRow */
function findPhoneAlternateColumnKeyFromRow_(headerRow) {
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || '').trim();
    if (!h) continue;
    if (/alternate|alt\.?\s*phone|phone\s*alt|second\s*phone|other\s*phone|mobile\s*2/i.test(h)) return h;
  }
  return null;
}

function bulandiHtmlEscape_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** BR as shown in emails: no hyphens (e.g. BR-1511 → BR1511). */
function bulandiBrForEmail_(raw) {
  return String(raw || '')
    .replace(/-/g, '')
    .trim();
}

/** Violet call-to-action block: Event Registration tab (HTML). */
function bulandiEventRegistrationTabBlockHtml_(safe) {
  var u = String(BULANDI_EVENT_REGISTRATION_TAB_URL || '').trim();
  if (!u) return '';
  return (
    '<div style="margin:0 0 20px;padding:14px 18px;background:#faf5ff;border:1px solid #ddd6fe;border-radius:8px;">' +
      '<p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:0.05em;color:#5b21b6;text-transform:uppercase;font-family:Arial,sans-serif;">Event registration</p>' +
      '<a href="' +
      safe(u) +
      '" style="font-size:15px;color:#6d28d9;font-weight:bold;text-decoration:none;">Open Event Registration tab →</a>' +
    '</div>'
  );
}

/** Optional second line: general Bulandi page if configured and different from the event-registration URL. */
function bulandiOptionalGeneralPageLinkHtml_(safe, eventsUrl) {
  var ev = String(eventsUrl || '').trim();
  var tab = String(BULANDI_EVENT_REGISTRATION_TAB_URL || '').trim();
  if (!ev || ev === tab) return '';
  return (
    '<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">' +
      '<a href="' +
      safe(ev) +
      '" style="color:#b91c1c;font-weight:bold;">Open Bulandi 2026 — full page</a>' +
    '</p>'
  );
}

function parseBrNumeric_(raw) {
  var s = String(raw || '')
    .replace(/\s/g, '')
    .toUpperCase();
  var digits = s.replace(/\D/g, '');
  if (!digits) return null;
  var n = parseInt(digits, 10);
  return isNaN(n) ? null : n;
}

/** @param {string} raw */
function normalizeDobToIso_(raw) {
  var s = String(raw || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{8}$/.test(s)) {
    var y8 = parseInt(s.slice(0, 4), 10);
    var mo8 = parseInt(s.slice(4, 6), 10);
    var d8 = parseInt(s.slice(6, 8), 10);
    if (mo8 >= 1 && mo8 <= 12 && d8 >= 1 && d8 <= 31) {
      return y8 + '-' + pad2_(mo8) + '-' + pad2_(d8);
    }
  }
  var m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (m) {
    var a = parseInt(m[1], 10);
    var b = parseInt(m[2], 10);
    var y = parseInt(m[3], 10);
    var dayFirst = a > 12;
    var dd = dayFirst ? a : b;
    var mm = dayFirst ? b : a;
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return y + '-' + pad2_(mm) + '-' + pad2_(dd);
    }
  }
  return s;
}

/** @param {*} val spreadsheet cell (Date or string) */
function normalizeDobFromSheetCell_(val) {
  if (val === null || val === undefined || val === '') return '';
  if (Object.prototype.toString.call(val) === '[object Date]' && !isNaN(val.getTime())) {
    return val.getFullYear() + '-' + pad2_(val.getMonth() + 1) + '-' + pad2_(val.getDate());
  }
  return normalizeDobToIso_(String(val));
}

/**
 * Locate registration row by BR + DOB. Returns { error } or sheet context.
 * @returns {{ error: string } | { sheet: *, headerRow: Array, values: Array, matchRow1Based: number, dataRow: Array, brColIdx: number, dobColIdx: number }}
 */
function bulandiMatchRowContext_(wantBr, wantDobIso) {
  if (wantBr === null || wantBr === undefined) {
    return { error: 'Invalid BR number.' };
  }
  var wantDob = String(wantDobIso || '').trim();
  if (!wantDob || !/^\d{4}-\d{2}-\d{2}$/.test(wantDob)) {
    return { error: 'Invalid date of birth.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return { error: 'Sheet not found: ' + SHEET_NAME };
  }

  var range = sheet.getDataRange();
  var values = range.getValues();
  if (!values || values.length < 2) {
    return { error: 'No registration rows in sheet.' };
  }

  var headerRow = values[0];
  var brKey = findBrColumnKeyFromRow_(headerRow);
  var dobKey = findDobColumnKeyFromRow_(headerRow);
  if (!brKey || !dobKey) {
    return { error: 'Sheet is missing BR or DOB column headers.' };
  }

  var brColIdx = -1;
  var dobColIdx = -1;
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || '').trim();
    if (h === brKey && brColIdx < 0) brColIdx = c;
    if (h === dobKey && dobColIdx < 0) dobColIdx = c;
  }
  if (brColIdx < 0 || dobColIdx < 0) {
    return { error: 'Could not locate BR or DOB columns.' };
  }

  var matchRow1Based = -1;
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var sheetBr = parseBrNumeric_(String(row[brColIdx] || ''));
    if (sheetBr !== wantBr) continue;
    var sheetDob = normalizeDobFromSheetCell_(row[dobColIdx]);
    if (sheetDob === wantDob) {
      matchRow1Based = r + 1;
      break;
    }
    return { error: 'Mismatch registration details' };
  }
  if (matchRow1Based < 0) {
    return { error: 'Mismatch registration details' };
  }

  var dataRow = values[matchRow1Based - 1];
  return {
    sheet: sheet,
    headerRow: headerRow,
    values: values,
    matchRow1Based: matchRow1Based,
    dataRow: dataRow,
    brColIdx: brColIdx,
    dobColIdx: dobColIdx,
  };
}

/**
 * Header for today’s registration desk check-in column: ddMMyyyyregistered — no hyphens (script timezone).
 * Example: 28032026registered
 */
function registrationDeskColumnHeaderForToday_() {
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), tz, 'ddMMyyyy') + 'registered';
}

/** Legacy desk header with hyphens in the date — still matched for existing sheets. */
function registrationDeskColumnLegacyHyphenatedForToday_() {
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), tz, 'dd-MM-yyyy') + '-registered';
}

/** 1-based column for today’s desk check-in: new format first, then legacy hyphenated. */
function findRegistrationDeskColumn1BasedForToday_(sheet) {
  var c = findColumn1BasedForHeaderLabel_(sheet, registrationDeskColumnHeaderForToday_());
  if (c >= 0) return c;
  return findColumn1BasedForHeaderLabel_(sheet, registrationDeskColumnLegacyHyphenatedForToday_());
}

/**
 * Header for today’s backstage check-in column: dd-mm-yyyy-back-stage (script timezone).
 * Example: 28-03-2026-back-stage
 */
function backstageColumnHeaderForToday_() {
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), tz, 'dd-MM-yyyy') + '-back-stage';
}

/**
 * Header for today’s on-stage daily check-in column: dd-mm-yyyy-on-stage (script timezone).
 * Example: 28-03-2026-on-stage
 */
function onStageColumnHeaderForToday_() {
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), tz, 'dd-MM-yyyy') + '-on-stage';
}

/**
 * POST adminBackstageRowCheckIn: br, dob, eventName. Writes timestamp in today’s dd-mm-yyyy-back-stage column (appends if missing).
 */
function handleAdminBackstageRowCheckIn_(body) {
  var brRaw = String(body.br || body.brNumber || '').trim();
  var dobRaw = String(body.dob || '').trim();
  var eventName = String(body.eventName || '').trim();
  if (!brRaw || !dobRaw) {
    return jsonOut({ ok: false, error: 'BR number and date of birth are required.' });
  }
  if (!eventName) {
    return jsonOut({ ok: false, error: 'eventName is required.' });
  }

  var wantBr = parseBrNumeric_(brRaw);
  var wantDob = normalizeDobToIso_(dobRaw);
  var ctx = bulandiMatchRowContext_(wantBr, wantDob);
  if (ctx.error) return jsonOut({ ok: false, error: ctx.error });

  var regColKey = findSheetColumnKeyForEventName_(ctx.headerRow, eventName);
  if (!regColKey) {
    return jsonOut({ ok: false, error: 'No registration column for event: ' + eventName });
  }
  var regColIdx = findFirstColumnIndexForKey_(ctx.headerRow, regColKey);
  if (regColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not resolve column for: ' + eventName });
  }
  var regVal = regColIdx < ctx.dataRow.length ? ctx.dataRow[regColIdx] : '';
  if (!cellCountsAsRegisteredForEvent_(regVal)) {
    return jsonOut({ ok: false, error: 'Not registered for this event: ' + eventName });
  }

  var sheet = ctx.sheet;
  var headerLabel = backstageColumnHeaderForToday_();
  var col1Based = findColumn1BasedForHeaderLabel_(sheet, headerLabel);
  if (col1Based < 0) {
    col1Based = sheet.getLastColumn() + 1;
    if (col1Based < 1) col1Based = 1;
    sheet.getRange(1, col1Based).setValue(headerLabel);
  }

  var ts = adminCheckInTimestamp_();
  sheet.getRange(ctx.matchRow1Based, col1Based).setValue(ts);
  var colHeaderShown = String(sheet.getRange(1, col1Based).getValue() || headerLabel).trim();
  return jsonOut({ ok: true, checkedInAt: ts, column: colHeaderShown, eventName: eventName });
}

/**
 * POST adminOnStageRowCheckIn: br, dob, eventName. Requires today’s dd-mm-yyyy-back-stage set; writes dd-mm-yyyy-on-stage (appends if missing).
 */
function handleAdminOnStageRowCheckIn_(body) {
  var brRaw = String(body.br || body.brNumber || '').trim();
  var dobRaw = String(body.dob || '').trim();
  var eventName = String(body.eventName || '').trim();
  if (!brRaw || !dobRaw) {
    return jsonOut({ ok: false, error: 'BR number and date of birth are required.' });
  }
  if (!eventName) {
    return jsonOut({ ok: false, error: 'eventName is required.' });
  }

  var wantBr = parseBrNumeric_(brRaw);
  var wantDob = normalizeDobToIso_(dobRaw);
  var ctx = bulandiMatchRowContext_(wantBr, wantDob);
  if (ctx.error) return jsonOut({ ok: false, error: ctx.error });

  var regColKey = findSheetColumnKeyForEventName_(ctx.headerRow, eventName);
  if (!regColKey) {
    return jsonOut({ ok: false, error: 'No registration column for event: ' + eventName });
  }
  var regColIdx = findFirstColumnIndexForKey_(ctx.headerRow, regColKey);
  if (regColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not resolve column for: ' + eventName });
  }
  var regVal = regColIdx < ctx.dataRow.length ? ctx.dataRow[regColIdx] : '';
  if (!cellCountsAsRegisteredForEvent_(regVal)) {
    return jsonOut({ ok: false, error: 'Not registered for this event: ' + eventName });
  }

  var sheet = ctx.sheet;
  var bkHeader = backstageColumnHeaderForToday_();
  var bkCol1 = findColumn1BasedForHeaderLabel_(sheet, bkHeader);
  if (bkCol1 < 0) {
    return jsonOut({
      ok: false,
      error:
        'No back stage column for today ("' +
        bkHeader +
        '"). Add it by completing back stage check-in for this participant first.',
    });
  }
  var bkVal = sheet.getRange(ctx.matchRow1Based, bkCol1).getValue();
  if (!deskCheckInCellIsSet_(bkVal)) {
    return jsonOut({
      ok: false,
      error: 'Back stage check-in is required for today before on stage check-in.',
    });
  }

  var headerLabel = onStageColumnHeaderForToday_();
  var col1Based = findColumn1BasedForHeaderLabel_(sheet, headerLabel);
  if (col1Based < 0) {
    col1Based = sheet.getLastColumn() + 1;
    if (col1Based < 1) col1Based = 1;
    sheet.getRange(1, col1Based).setValue(headerLabel);
  }

  var ts = adminCheckInTimestamp_();
  sheet.getRange(ctx.matchRow1Based, col1Based).setValue(ts);
  var colHeaderShown = String(sheet.getRange(1, col1Based).getValue() || headerLabel).trim();
  return jsonOut({ ok: true, checkedInAt: ts, column: colHeaderShown, eventName: eventName });
}

/**
 * POST adminBackstageEligibleList: eventName (display name, same as sheet column / website).
 * Returns participants with today’s registration-desk check-in set and main event column Yes/TRUE.
 */
function handleAdminBackstageEligibleList_(body) {
  var eventName = String(body.eventName || '').trim();
  if (!eventName) {
    return jsonOut({ ok: false, error: 'eventName is required.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOut({ ok: false, error: 'Sheet not found: ' + SHEET_NAME });
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return jsonOut({
      ok: true,
      deskColumn: registrationDeskColumnHeaderForToday_(),
      eventName: eventName,
      participants: [],
      count: 0,
      note: 'No registration rows in sheet.',
    });
  }

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (!values || values.length < 2) {
    return jsonOut({
      ok: true,
      deskColumn: registrationDeskColumnHeaderForToday_(),
      eventName: eventName,
      participants: [],
      count: 0,
      note: 'No registration rows in sheet.',
    });
  }

  var headerRow = values[0];
  var deskHeader = registrationDeskColumnHeaderForToday_();
  var deskColIdx = findFirstColumnIndexForKey_(headerRow, deskHeader);
  if (deskColIdx < 0) {
    deskColIdx = findFirstColumnIndexForKey_(headerRow, registrationDeskColumnLegacyHyphenatedForToday_());
  }
  if (deskColIdx < 0) {
    return jsonOut({
      ok: true,
      deskColumn: deskHeader,
      eventName: eventName,
      participants: [],
      count: 0,
      note:
        'No desk column for today ("' +
        deskHeader +
        '" or legacy hyphenated form) yet — list will populate after the first registration desk check-in.',
    });
  }

  var evColKey = findSheetColumnKeyForEventName_(headerRow, eventName);
  if (!evColKey) {
    return jsonOut({ ok: false, error: 'Sheet has no column for event: ' + eventName });
  }
  var evColIdx = findFirstColumnIndexForKey_(headerRow, evColKey);
  if (evColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not resolve column for event: ' + eventName });
  }

  var brKey = findBrColumnKeyFromRow_(headerRow);
  if (!brKey) {
    return jsonOut({ ok: false, error: 'Sheet is missing BR column headers.' });
  }
  var brColIdx = findFirstColumnIndexForKey_(headerRow, brKey);
  if (brColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not locate BR column.' });
  }

  var dobKey = findDobColumnKeyFromRow_(headerRow);
  var dobColIdx = dobKey ? findFirstColumnIndexForKey_(headerRow, dobKey) : -1;

  var waKey = findWhatsappColumnKeyFromRow_(headerRow);
  var altKey = findPhoneAlternateColumnKeyFromRow_(headerRow);
  var waColIdx = waKey ? findFirstColumnIndexForKey_(headerRow, waKey) : -1;
  var altColIdx = altKey ? findFirstColumnIndexForKey_(headerRow, altKey) : -1;

  var backstageHeader = backstageColumnHeaderForToday_();
  var backstageColIdx = findFirstColumnIndexForKey_(headerRow, backstageHeader);

  var participants = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var deskVal = deskColIdx < row.length ? row[deskColIdx] : '';
    if (!deskCheckInCellIsSet_(deskVal)) continue;
    var evVal = evColIdx < row.length ? row[evColIdx] : '';
    if (!cellCountsAsRegisteredForEvent_(evVal)) continue;
    var brDisp = String(row[brColIdx] != null ? row[brColIdx] : '').trim();
    var wa = waColIdx >= 0 && waColIdx < row.length ? String(row[waColIdx] != null ? row[waColIdx] : '').trim() : '';
    var alt = altColIdx >= 0 && altColIdx < row.length ? String(row[altColIdx] != null ? row[altColIdx] : '').trim() : '';
    var dobIso =
      dobColIdx >= 0 && dobColIdx < row.length ? normalizeDobFromSheetCell_(row[dobColIdx]) : '';
    var backstageCell = backstageColIdx >= 0 && backstageColIdx < row.length ? row[backstageColIdx] : '';
    var backstageCheckedInAt = checkInCellDisplayString_(backstageCell);
    participants.push({
      br: brDisp,
      whatsappNo: wa,
      phoneAlternate: alt,
      dob: dobIso,
      backstageCheckedInAt: backstageCheckedInAt,
    });
  }

  return jsonOut({
    ok: true,
    deskColumn: deskHeader,
    backstageColumn: backstageHeader,
    eventName: eventName,
    participants: participants,
    count: participants.length,
  });
}

/**
 * POST adminOnStageEligibleList: rows with today’s dd-mm-yyyy-back-stage set + main event Yes/TRUE; onStageCheckedInAt from dd-mm-yyyy-on-stage.
 */
function handleAdminOnStageEligibleList_(body) {
  var eventName = String(body.eventName || '').trim();
  if (!eventName) {
    return jsonOut({ ok: false, error: 'eventName is required.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOut({ ok: false, error: 'Sheet not found: ' + SHEET_NAME });
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return jsonOut({
      ok: true,
      backstageColumn: backstageColumnHeaderForToday_(),
      onStageColumn: onStageColumnHeaderForToday_(),
      eventName: eventName,
      participants: [],
      count: 0,
      note: 'No registration rows in sheet.',
    });
  }

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (!values || values.length < 2) {
    return jsonOut({
      ok: true,
      backstageColumn: backstageColumnHeaderForToday_(),
      onStageColumn: onStageColumnHeaderForToday_(),
      eventName: eventName,
      participants: [],
      count: 0,
      note: 'No registration rows in sheet.',
    });
  }

  var headerRow = values[0];
  var backstageHeader = backstageColumnHeaderForToday_();
  var backstageColIdx = findFirstColumnIndexForKey_(headerRow, backstageHeader);
  if (backstageColIdx < 0) {
    return jsonOut({
      ok: true,
      backstageColumn: backstageHeader,
      onStageColumn: onStageColumnHeaderForToday_(),
      eventName: eventName,
      participants: [],
      count: 0,
      note:
        'No back stage column for today ("' +
        backstageHeader +
        '") yet — list appears after participants complete back stage check-in for today.',
    });
  }

  var evColKey = findSheetColumnKeyForEventName_(headerRow, eventName);
  if (!evColKey) {
    return jsonOut({ ok: false, error: 'Sheet has no column for event: ' + eventName });
  }
  var evColIdx = findFirstColumnIndexForKey_(headerRow, evColKey);
  if (evColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not resolve column for event: ' + eventName });
  }

  var brKey = findBrColumnKeyFromRow_(headerRow);
  if (!brKey) {
    return jsonOut({ ok: false, error: 'Sheet is missing BR column headers.' });
  }
  var brColIdx = findFirstColumnIndexForKey_(headerRow, brKey);
  if (brColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not locate BR column.' });
  }

  var dobKey = findDobColumnKeyFromRow_(headerRow);
  var dobColIdx = dobKey ? findFirstColumnIndexForKey_(headerRow, dobKey) : -1;

  var waKey = findWhatsappColumnKeyFromRow_(headerRow);
  var altKey = findPhoneAlternateColumnKeyFromRow_(headerRow);
  var waColIdx = waKey ? findFirstColumnIndexForKey_(headerRow, waKey) : -1;
  var altColIdx = altKey ? findFirstColumnIndexForKey_(headerRow, altKey) : -1;

  var onStageHeader = onStageColumnHeaderForToday_();
  var onStageColIdx = findFirstColumnIndexForKey_(headerRow, onStageHeader);

  var participants = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var bkVal = backstageColIdx < row.length ? row[backstageColIdx] : '';
    if (!deskCheckInCellIsSet_(bkVal)) continue;
    var evVal = evColIdx < row.length ? row[evColIdx] : '';
    if (!cellCountsAsRegisteredForEvent_(evVal)) continue;
    var brDisp = String(row[brColIdx] != null ? row[brColIdx] : '').trim();
    var wa = waColIdx >= 0 && waColIdx < row.length ? String(row[waColIdx] != null ? row[waColIdx] : '').trim() : '';
    var alt = altColIdx >= 0 && altColIdx < row.length ? String(row[altColIdx] != null ? row[altColIdx] : '').trim() : '';
    var dobIso =
      dobColIdx >= 0 && dobColIdx < row.length ? normalizeDobFromSheetCell_(row[dobColIdx]) : '';
    var onStageCell = onStageColIdx >= 0 && onStageColIdx < row.length ? row[onStageColIdx] : '';
    var onStageCheckedInAt = checkInCellDisplayString_(onStageCell);
    participants.push({
      br: brDisp,
      whatsappNo: wa,
      phoneAlternate: alt,
      dob: dobIso,
      onStageCheckedInAt: onStageCheckedInAt,
    });
  }

  return jsonOut({
    ok: true,
    backstageColumn: backstageHeader,
    onStageColumn: onStageHeader,
    eventName: eventName,
    participants: participants,
    count: participants.length,
  });
}

/**
 * Check-in column for backstage or on-stage, per event. Header must include the event name and
 * “Backstage” / “On stage” (e.g. “Backstage — Solo Dance”, “On stage — Solo Dance”).
 * @param {'backstage' | 'onstage'} kind
 */
function findAdminEventCheckInColumnKey_(headerRow, kind, eventDisplayName) {
  var evNorm = normalizeHeaderForEventMatch_(eventDisplayName);
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || '').trim();
    var hn = normalizeHeaderForEventMatch_(h);
    if (hn.indexOf(evNorm) < 0) continue;
    var hasBk = /\bbackstage\b|\bback\s+stage\b/.test(hn);
    var hasOn = /\bon\s*stage\b|\bonstage\b/.test(hn);
    if (kind === 'backstage' && hasBk) return h;
    if (kind === 'onstage' && hasOn) return h;
  }
  return null;
}

function adminCheckInTimestamp_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * POST action adminRegistrationDeskCheckIn: br, dob (yyyy-mm-dd or yyyymmdd; hyphens optional, stripped).
 * Writes timestamp in column ddMMyyyyregistered for today (script timezone). Appends that column if neither format exists.
 */
function handleAdminRegistrationDeskCheckIn_(body) {
  var brRaw = String(body.br || body.brNumber || '')
    .trim()
    .replace(/-/g, '');
  var dobRaw = String(body.dob || '')
    .trim()
    .replace(/-/g, '');
  if (!brRaw || !dobRaw) {
    return jsonOut({ ok: false, error: 'BR number and date of birth are required.' });
  }
  var wantBr = parseBrNumeric_(brRaw);
  var wantDob = normalizeDobToIso_(dobRaw);
  var ctx = bulandiMatchRowContext_(wantBr, wantDob);
  if (ctx.error) return jsonOut({ ok: false, error: ctx.error });

  var sheet = ctx.sheet;
  var headerLabel = registrationDeskColumnHeaderForToday_();
  var col1Based = findRegistrationDeskColumn1BasedForToday_(sheet);
  if (col1Based < 0) {
    col1Based = sheet.getLastColumn() + 1;
    if (col1Based < 1) col1Based = 1;
    sheet.getRange(1, col1Based).setValue(headerLabel);
  }

  var ts = adminCheckInTimestamp_();
  sheet.getRange(ctx.matchRow1Based, col1Based).setValue(ts);
  var colHeaderShown = String(sheet.getRange(1, col1Based).getValue() || headerLabel).trim();
  return jsonOut({ ok: true, checkedInAt: ts, column: colHeaderShown });
}

/**
 * POST action adminBackstageCheckIn | adminOnStageCheckIn: br, dob, eventNames[] (display names).
 * Participant must be “Yes” on the main event column. Writes timestamp to Backstage / On stage column for each event.
 */
function handleAdminEventCheckIn_(body, kind) {
  var brRaw = String(body.br || body.brNumber || '').trim();
  var dobRaw = String(body.dob || '').trim();
  var eventNames = body.eventNames;

  if (!brRaw || !dobRaw) {
    return jsonOut({ ok: false, error: 'BR number and date of birth are required.' });
  }
  if (!Array.isArray(eventNames) || eventNames.length === 0) {
    return jsonOut({ ok: false, error: 'Select at least one event to check in.' });
  }

  var wantBr = parseBrNumeric_(brRaw);
  var wantDob = normalizeDobToIso_(dobRaw);
  var ctx = bulandiMatchRowContext_(wantBr, wantDob);
  if (ctx.error) return jsonOut({ ok: false, error: ctx.error });

  var dataRow = ctx.dataRow;
  var ts = adminCheckInTimestamp_();
  var updated = [];

  for (var i = 0; i < eventNames.length; i++) {
    var ename = String(eventNames[i] || '').trim();
    if (!ename) continue;

    var regColKey = findSheetColumnKeyForEventName_(ctx.headerRow, ename);
    if (!regColKey) {
      return jsonOut({ ok: false, error: 'No registration column for event: ' + ename });
    }
    var regColIdx = findFirstColumnIndexForKey_(ctx.headerRow, regColKey);
    if (regColIdx < 0) {
      return jsonOut({ ok: false, error: 'Could not resolve column for: ' + ename });
    }
    var regVal = regColIdx < dataRow.length ? dataRow[regColIdx] : '';
    if (!cellCountsAsRegisteredForEvent_(regVal)) {
      return jsonOut({ ok: false, error: 'Not registered for this event: ' + ename });
    }

    var checkColKey = findAdminEventCheckInColumnKey_(ctx.headerRow, kind, ename);
    if (!checkColKey) {
      var hint = kind === 'backstage' ? 'Backstage — ' + ename : 'On stage — ' + ename;
      return jsonOut({
        ok: false,
        error: 'No check-in column for this event. Add a column like “' + hint + '”.',
      });
    }
    var checkColIdx = findFirstColumnIndexForKey_(ctx.headerRow, checkColKey);
    if (checkColIdx < 0) {
      return jsonOut({ ok: false, error: 'Could not resolve check-in column for: ' + ename });
    }
    ctx.sheet.getRange(ctx.matchRow1Based, checkColIdx + 1).setValue(ts);
    updated.push(ename);
  }

  return jsonOut({ ok: true, updated: updated, checkedInAt: ts });
}

/**
 * POST body: action eventRegistration, br, dob (yyyy-mm-dd), eligibleEventNames[], selectedEventNames[].
 */
function handleEventRegistrationPost_(body) {
  var brRaw = String(body.br || body.brNumber || '').trim();
  var dobRaw = String(body.dob || '').trim();
  var eligible = body.eligibleEventNames;
  var selected = body.selectedEventNames;

  if (!brRaw || !dobRaw) {
    return jsonOut({ ok: false, error: 'BR number and date of birth are required.' });
  }
  if (!Array.isArray(eligible) || eligible.length === 0) {
    return jsonOut({ ok: false, error: 'eligibleEventNames must be a non-empty array.' });
  }
  if (!Array.isArray(selected)) {
    return jsonOut({ ok: false, error: 'selectedEventNames must be an array.' });
  }

  var wantBr = parseBrNumeric_(brRaw);
  if (wantBr === null) {
    return jsonOut({ ok: false, error: 'Invalid BR number.' });
  }
  var wantDob = normalizeDobToIso_(dobRaw);
  if (!wantDob || !/^\d{4}-\d{2}-\d{2}$/.test(wantDob)) {
    return jsonOut({ ok: false, error: 'Invalid date of birth.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOut({ ok: false, error: 'Sheet not found: ' + SHEET_NAME });
  }

  var range = sheet.getDataRange();
  var values = range.getValues();
  if (!values || values.length < 2) {
    return jsonOut({ ok: false, error: 'No registration rows in sheet.' });
  }

  var headerRow = values[0];
  var brKey = findBrColumnKeyFromRow_(headerRow);
  var dobKey = findDobColumnKeyFromRow_(headerRow);
  if (!brKey || !dobKey) {
    return jsonOut({ ok: false, error: 'Sheet is missing BR or DOB column headers.' });
  }

  var brColIdx = -1;
  var dobColIdx = -1;
  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || '').trim();
    if (h === brKey && brColIdx < 0) brColIdx = c;
    if (h === dobKey && dobColIdx < 0) dobColIdx = c;
  }
  if (brColIdx < 0 || dobColIdx < 0) {
    return jsonOut({ ok: false, error: 'Could not locate BR or DOB columns.' });
  }

  var matchRow1Based = -1;
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var sheetBr = parseBrNumeric_(String(row[brColIdx] || ''));
    if (sheetBr !== wantBr) continue;
    var sheetDob = normalizeDobFromSheetCell_(row[dobColIdx]);
    if (sheetDob === wantDob) {
      matchRow1Based = r + 1;
      break;
    }
    return jsonOut({ ok: false, error: 'Mismatch registration details' });
  }
  if (matchRow1Based < 0) {
    return jsonOut({ ok: false, error: 'Mismatch registration details' });
  }

  var dataRow = values[matchRow1Based - 1];
  var nameKey = findNameColumnKeyFromRow_(headerRow);
  var mailKey = findMailColumnKeyFromRow_(headerRow);
  var nameColIdx = findFirstColumnIndexForKey_(headerRow, nameKey);
  var mailColIdx = findFirstColumnIndexForKey_(headerRow, mailKey);
  var registrantName = nameColIdx >= 0 && nameColIdx < dataRow.length ? dataRow[nameColIdx] : '';
  var recipientMail = mailColIdx >= 0 && mailColIdx < dataRow.length ? dataRow[mailColIdx] : '';
  var brDisplay = String(dataRow[brColIdx] || brRaw).trim();

  var selectedSet = {};
  for (var si = 0; si < selected.length; si++) {
    selectedSet[normalizeHeaderForEventMatch_(String(selected[si] || ''))] = true;
  }

  var registeredNow = [];
  var removedNow = [];
  var updated = 0;
  for (var ei = 0; ei < eligible.length; ei++) {
    var ename = String(eligible[ei] || '').trim();
    if (!ename) continue;
    var colKey = findSheetColumnKeyForEventName_(headerRow, ename);
    if (!colKey) {
      return jsonOut({ ok: false, error: 'Sheet has no column for event: ' + ename });
    }
    var colIdx = -1;
    for (var cc = 0; cc < headerRow.length; cc++) {
      if (String(headerRow[cc] || '').trim() === colKey) {
        colIdx = cc;
        break;
      }
    }
    if (colIdx < 0) {
      return jsonOut({ ok: false, error: 'Could not resolve column for: ' + ename });
    }
    var oldVal = colIdx < dataRow.length ? dataRow[colIdx] : '';
    var oldYes = cellIsYes_(oldVal);
    var writeYes = !!selectedSet[normalizeHeaderForEventMatch_(ename)];
    if (writeYes && !oldYes) registeredNow.push(ename);
    if (!writeYes && oldYes) removedNow.push(ename);
    sheet.getRange(matchRow1Based, colIdx + 1).setValue(writeYes ? 'Yes' : 'No');
    updated++;
  }

  var emailSent = false;
  if (BULANDI_SEND_EMAIL && (registeredNow.length > 0 || removedNow.length > 0)) {
    emailSent = sendBulandiEventRegistrationUpdateEmail_(
      recipientMail,
      registrantName,
      brDisplay,
      wantDob,
      registeredNow,
      removedNow
    );
  }

  return jsonOut({ ok: true, updated: updated, emailSent: emailSent });
}

function sendBulandiRegistrationConfirmationEmail_(recipientEmail, registrantName, brNumber, dobYyyyMmDd) {
  if (!BULANDI_SEND_EMAIL) return;

  var to = String(recipientEmail || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    Logger.log('Bulandi email skipped: invalid recipient');
    return;
  }

  var displayName = String(registrantName || '').trim() || 'Participant';
  var br = bulandiBrForEmail_(brNumber);
  var dob = String(dobYyyyMmDd || '').trim();
  var eventsUrl = String(BULANDI_EVENTS_PAGE_URL || '').trim();

  var subject = 'Thank you for registering — ' + BULANDI_EVENT_TITLE + ' • BR ' + br;
  var plain = buildBulandiConfirmationPlain_(displayName, br, dob, eventsUrl);
  var html = buildBulandiConfirmationHtml_(displayName, br, dob, eventsUrl);

  try {
    GmailApp.sendEmail(to, subject, plain, {
      htmlBody: html,
      name: BULANDI_SENDER_NAME,
    });
  } catch (e) {
    Logger.log('Bulandi confirmation email failed: ' + e);
  }
}

/**
 * @param {string[]} registeredNames
 * @param {string[]} removedNames
 * @returns {boolean} true if Gmail send was attempted and did not throw
 */
function sendBulandiEventRegistrationUpdateEmail_(recipientEmail, registrantName, brNumber, dobYyyyMmDd, registeredNames, removedNames) {
  if (!BULANDI_SEND_EMAIL) return false;

  var to = String(recipientEmail || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    Logger.log('Bulandi event-choice email skipped: invalid or missing email on sheet row');
    return false;
  }

  var displayName = String(registrantName || '').trim() || 'Participant';
  var br = bulandiBrForEmail_(brNumber);
  var dob = String(dobYyyyMmDd || '').trim();
  var eventsUrl = String(BULANDI_EVENTS_PAGE_URL || '').trim();

  var subject = 'Event choices updated — ' + BULANDI_EVENT_TITLE + ' • BR ' + br;
  var plain = buildBulandiEventUpdatePlain_(displayName, br, dob, registeredNames, removedNames, eventsUrl);
  var html = buildBulandiEventUpdateHtml_(displayName, br, dob, registeredNames, removedNames, eventsUrl);

  try {
    GmailApp.sendEmail(to, subject, plain, {
      htmlBody: html,
      name: BULANDI_SENDER_NAME,
    });
    return true;
  } catch (e) {
    Logger.log('Bulandi event-choice email failed: ' + e);
    return false;
  }
}

function buildBulandiEventUpdatePlain_(name, brNumber, dob, registeredNames, removedNames, eventsUrl) {
  var reg = registeredNames && registeredNames.length ? registeredNames.join(', ') : '(none)';
  var rem = removedNames && removedNames.length ? removedNames.join(', ') : '(none)';
  var tabUrl = String(BULANDI_EVENT_REGISTRATION_TAB_URL || '').trim();
  var lines = [
    'Dear ' + name + ',',
    '',
    'Your competition choices for ' + BULANDI_EVENT_TITLE + ' have been saved. Compared to your previous choices of events, the following changed:',
    '',
    'Your Bulandi registration number (BR number): ' + brNumber,
    'Date of birth (as submitted): ' + dob,
    '',
    'Registered for: ' + reg,
    'Removed from registration: ' + rem,
    '',
    'If you need to change your selections again, use Event Registration on the Bulandi page with the same BR number and date of birth.',
  ];
  if (tabUrl) {
    lines.push('');
    lines.push('Event registration: ' + tabUrl);
  }
  var ev = String(eventsUrl || '').trim();
  if (ev && ev !== tabUrl) {
    lines.push('');
    lines.push('Bulandi page: ' + ev);
  }
  lines.push('');
  lines.push('Warm regards,');
  lines.push(BULANDI_SENDER_NAME);
  return lines.join('\n');
}

function buildBulandiEventUpdateHtml_(name, brNumber, dob, registeredNames, removedNames, eventsUrl) {
  var safe = bulandiHtmlEscape_;
  var tabBlock = bulandiEventRegistrationTabBlockHtml_(safe);
  var generalLink = bulandiOptionalGeneralPageLinkHtml_(safe, eventsUrl);
  var linksFallback =
    !tabBlock && !generalLink
      ? '<p style="margin:0 0 20px;color:#4b5563;font-size:14px;">Visit the SMYM website Bulandi 2026 page to review or change your event choices.</p>'
      : '';

  var regListHtml = bulandiEventNamesListHtml_(registeredNames, safe);
  var remListHtml = bulandiEventNamesListHtml_(removedNames, safe);

  return (
    '<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">' +
    '<div style="background:#7c1a1a;padding:20px 28px 18px;border-radius:10px 10px 0 0;">' +
      '<p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:0.08em;color:#f5c4c4;text-transform:uppercase;font-family:Arial,sans-serif;">Shree Maheshwari Yuva Mandal, Chennai</p>' +
      '<p style="margin:4px 0 0;font-size:20px;color:#ffffff;font-family:Georgia,serif;">' + safe(BULANDI_EVENT_TITLE) + '</p>' +
    '</div>' +
    '<div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px 28px 24px;">' +
      '<p style="margin:0 0 16px;font-size:15px;color:#111827;">Dear <strong>' + safe(name) + '</strong>,</p>' +
      '<p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#111827;">Your <strong>competition choices</strong> have been saved. Compared to your <strong>previous choices of events</strong>, the following changed:</p>' +
      '<div style="background:#fff5f5;border:1px solid #f5c4c4;border-radius:8px;padding:16px 20px;margin:0 0 20px;">' +
        '<p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:0.06em;color:#993c1d;text-transform:uppercase;font-family:Arial,sans-serif;">Your Bulandi Registration Number</p>' +
        '<p style="margin:0;font-size:26px;font-weight:bold;font-family:ui-monospace,Courier New,monospace;color:#7c1a1a;letter-spacing:0.06em;">' + safe(brNumber) + '</p>' +
      '</div>' +
      '<div style="border-left:3px solid #d85a30;padding:4px 0 4px 16px;margin:0 0 22px;">' +
        '<p style="margin:0 0 8px;font-size:14px;color:#111827;"><span style="color:#6b7280;display:inline-block;min-width:110px;">BR Number</span> <strong>' + safe(brNumber) + '</strong></p>' +
        '<p style="margin:0;font-size:14px;color:#111827;"><span style="color:#6b7280;display:inline-block;min-width:110px;">Date of birth</span> <strong>' + safe(dob) + '</strong></p>' +
      '</div>' +
      '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:0 0 16px;">' +
        '<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:0.06em;color:#15803d;text-transform:uppercase;font-family:Arial,sans-serif;">Registered for</p>' +
        regListHtml +
      '</div>' +
      '<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin:0 0 24px;">' +
        '<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:0.06em;color:#b91c1c;text-transform:uppercase;font-family:Arial,sans-serif;">Removed from registration</p>' +
        remListHtml +
      '</div>' +
      '<p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:#4b5563;">You can update your selections again anytime from <strong>Event Registration</strong> on the Bulandi page, using the same BR number and date of birth.</p>' +
      tabBlock +
      generalLink +
      linksFallback +
      '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:24px 0 0;display:flex;align-items:center;gap:14px;">' +
        '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="32" height="32" alt="WhatsApp" style="flex-shrink:0;" />' +
        '<div>' +
          '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Official Bulandi Group</p>' +
          '<a href="https://chat.whatsapp.com/L14kRAoLXKP371AASqqowo?mode=gi_t" style="font-size:14px;color:#166534;font-weight:bold;text-decoration:none;">Join the WhatsApp group &rarr;</a>' +
        '</div>' +
      '</div>' +
      '<div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:24px;">' +
        '<p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">Warm regards,<br><span style="font-weight:bold;color:#111827;">' + safe(BULANDI_SENDER_NAME) + '</span></p>' +
      '</div>' +
    '</div>' +
    '</div>'
  );
}

/** @param {string[]} names @param {function(string):string} safe */
function bulandiEventNamesListHtml_(names, safe) {
  if (!names || names.length === 0) {
    return '<p style="margin:0;font-size:14px;color:#6b7280;font-style:italic;">None.</p>';
  }
  var items = '';
  for (var i = 0; i < names.length; i++) {
    items +=
      '<li style="margin:6px 0;font-size:14px;color:#111827;line-height:1.5;">' + safe(String(names[i] || '')) + '</li>';
  }
  return '<ul style="margin:0;padding-left:20px;">' + items + '</ul>';
}

function buildBulandiConfirmationPlain_(name, brNumber, dob, eventsUrl) {
  var tabUrl = String(BULANDI_EVENT_REGISTRATION_TAB_URL || '').trim();
  var lines = [
    'Dear ' + name + ',',
    '',
    'Thank you for registering for ' + BULANDI_EVENT_TITLE + '.',
    '',
    'Your Bulandi registration number (BR number) is: ' + brNumber,
    '',
    'Please save this number. When you register for individual events, you will need:',
    '  • Your BR number: ' + brNumber,
    '  • Your date of birth (as submitted): ' + dob,
    '',
    'Next step: open Event Registration on the Bulandi page and choose the competitions you wish to take part in.',
  ];
  if (tabUrl) {
    lines.push('');
    lines.push('Event registration: ' + tabUrl);
  }
  var ev = String(eventsUrl || '').trim();
  if (ev && ev !== tabUrl) {
    lines.push('');
    lines.push('Bulandi page: ' + ev);
  }
  lines.push('');
  lines.push('Warm regards,');
  lines.push(BULANDI_SENDER_NAME);
  return lines.join('\n');
}

function buildBulandiConfirmationHtml_(name, brNumber, dob, eventsUrl) {
  var safe = bulandiHtmlEscape_;
  var tabBlock = bulandiEventRegistrationTabBlockHtml_(safe);
  var generalLink = bulandiOptionalGeneralPageLinkHtml_(safe, eventsUrl);
  var linksFallback =
    !tabBlock && !generalLink
      ? '<p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.65;">Visit the SMYM website Bulandi 2026 page for the event list and registration.</p>'
      : '';

  return (
    '<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">' +

    // Header band
    '<div style="background:#7c1a1a;padding:20px 28px 18px;border-radius:10px 10px 0 0;">' +
      '<p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:0.08em;color:#f5c4c4;text-transform:uppercase;font-family:Arial,sans-serif;">Shree Maheshwari Yuva Mandal, Chennai</p>' +
      '<p style="margin:4px 0 0;font-size:20px;color:#ffffff;font-family:Georgia,serif;">' + safe(BULANDI_EVENT_TITLE) + '</p>' +
    '</div>' +

    // Body
    '<div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px 28px 24px;">' +

      '<p style="margin:0 0 16px;font-size:15px;color:#111827;">Dear <strong>' + safe(name) + '</strong>,</p>' +
      '<p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#111827;">Thank you for registering for <strong>' + safe(BULANDI_EVENT_TITLE) + '</strong>. Your participation has been confirmed.</p>' +

      // BR Number card
      '<div style="background:#fff5f5;border:1px solid #f5c4c4;border-radius:8px;padding:16px 20px;margin:0 0 24px;">' +
        '<p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:0.06em;color:#993c1d;text-transform:uppercase;font-family:Arial,sans-serif;">Your Bulandi Registration Number</p>' +
        '<p style="margin:0;font-size:26px;font-weight:bold;font-family:ui-monospace,Courier New,monospace;color:#7c1a1a;letter-spacing:0.06em;">' + safe(brNumber) + '</p>' +
      '</div>' +

      '<p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:#4b5563;">Please keep this number safe. To register for competitions, open <strong>Event Registration</strong> on the Bulandi page and sign in with:</p>' +

      // Credential list
      '<div style="border-left:3px solid #d85a30;padding:4px 0 4px 16px;margin:0 0 20px;">' +
        '<p style="margin:0 0 8px;font-size:14px;color:#111827;"><span style="color:#6b7280;display:inline-block;min-width:110px;">BR Number</span> <strong>' + safe(brNumber) + '</strong></p>' +
        '<p style="margin:0;font-size:14px;color:#111827;"><span style="color:#6b7280;display:inline-block;min-width:110px;">Date of birth</span> <strong>' + safe(dob) + '</strong></p>' +
      '</div>' +

      tabBlock +
      generalLink +
      linksFallback +

      // WhatsApp group CTA
      '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:0 0 24px;display:flex;align-items:center;gap:14px;">' +
        '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="32" height="32" alt="WhatsApp" style="flex-shrink:0;" />' +
        '<div>' +
          '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Official Bulandi Group</p>' +
          '<a href="https://chat.whatsapp.com/L14kRAoLXKP371AASqqowo?mode=gi_t" style="font-size:14px;color:#166534;font-weight:bold;text-decoration:none;">Join the WhatsApp group &rarr;</a>' +
        '</div>' +
      '</div>' +

      // Sign-off
      '<div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:4px;">' +
        '<p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">Warm regards,<br><span style="font-weight:bold;color:#111827;">' + safe(BULANDI_SENDER_NAME) + '</span></p>' +
      '</div>' +

    '</div>' +
    '</div>'
  );
}

/** Integer age on reference calendar date (local). dobStr yyyy-MM-dd */
function ageOnReferenceDate_(dobStr, yRef, mRef, dRef) {
  var p = dobStr.split('-');
  if (p.length !== 3) return null;
  var y = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var d = parseInt(p[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  var birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;

  var ref = new Date(yRef, mRef - 1, dRef);
  var age = ref.getFullYear() - birth.getFullYear();
  var md = ref.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

function nextBrNumber_(pool) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();
  var maxNum = pool === 'u15' ? BR_U15_MIN - 1 : BR_O15_MIN - 1;

  if (lastRow >= 2) {
    var values = sheet.getRange(2, 1, lastRow, 1).getValues();
    for (var i = 0; i < values.length; i++) {
      var cell = String(values[i][0] || '');
      var m = cell.match(/^BR(\d+)$/i);
      if (!m) continue;
      var n = parseInt(m[1], 10);
      if (pool === 'u15') {
        if (n >= BR_U15_MIN && n <= BR_U15_MAX && n > maxNum) maxNum = n;
      } else {
        if (n >= BR_O15_MIN && n <= BR_O15_MAX && n > maxNum) maxNum = n;
      }
    }
  }

  var next = maxNum + 1;
  if (pool === 'u15') {
    if (next > BR_U15_MAX) throw new Error('Under-15 BR range full (BR' + BR_U15_MIN + '-BR' + BR_U15_MAX + ')');
  } else {
    if (next > BR_O15_MAX) throw new Error('15+ BR range full');
  }
  return 'BR' + next;
}

function sanitizeFilename_(name) {
  return String(name || 'file')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 180);
}

/**
 * Run from the Apps Script editor: choose doTest → Run (▶).
 * Verifies bound spreadsheet, tab name, Drive payment folder, age-on-reference samples, and next BR numbers.
 * Does not append sheet rows or upload files.
 */
function doTest() {
  var log = Logger.log;
  log('--- Bulandi registration doTest ---');

  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    log('OK Spreadsheet: ' + ss.getName());
  } catch (err) {
    log('FAIL: Open this script from the bound spreadsheet (Extensions → Apps Script), then run doTest again.');
    throw err;
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    log('FAIL: No tab named "' + SHEET_NAME + '". Create it or change SHEET_NAME in the script.');
  } else {
    log('OK Sheet tab: "' + SHEET_NAME + '" | lastRow=' + sheet.getLastRow());
  }

  if (!PAYMENT_FOLDER_ID || PAYMENT_FOLDER_ID.indexOf('PASTE_') === 0) {
    log('WARN: PAYMENT_FOLDER_ID still placeholder — file upload will fail until you set a real folder ID.');
  } else {
    try {
      var folder = DriveApp.getFolderById(PAYMENT_FOLDER_ID);
      log('OK Drive folder: ' + folder.getName() + ' | id=' + PAYMENT_FOLDER_ID);
    } catch (e2) {
      log('FAIL: Drive folder not accessible: ' + e2.message);
    }
  }

  log('Reference date: ' + REF_YYYY + '-' + REF_MM + '-' + REF_DD + ' (age = completed years on that date)');
  var samples = [
    ['2010-01-01', 'expect 15+ pool'],
    ['2011-05-03', 'expect 15 on ref day → 15+ pool'],
    ['2015-06-01', 'expect under 15'],
    ['2020-05-03', 'expect age 6, under 15'],
  ];
  for (var i = 0; i < samples.length; i++) {
    var dob = samples[i][0];
    var note = samples[i][1];
    var age = ageOnReferenceDate_(dob, REF_YYYY, REF_MM, REF_DD);
    if (age === null) {
      log('FAIL age for ' + dob + ' (' + note + ')');
    } else {
      var pool = age < 15 ? 'u15 (BR ' + BR_U15_MIN + '-' + BR_U15_MAX + ')' : 'o15 (BR ' + BR_O15_MIN + '-' + BR_O15_MAX + ')';
      log('  DOB ' + dob + ' → age ' + age + ' → ' + pool + ' | ' + note);
    }
  }

  if (sheet) {
    try {
      log('Next BR for under-15 registrant: ' + nextBrNumber_('u15'));
      log('Next BR for 15+ registrant: ' + nextBrNumber_('o15'));
    } catch (e3) {
      log('FAIL nextBrNumber_: ' + e3.message);
    }
  }

  if (SUBMIT_SECRET) {
    log('SUBMIT_SECRET is set (submissions must include matching "secret" in JSON).');
  } else {
    log('SUBMIT_SECRET empty (optional).');
  }

  log('--- doTest finished (no data written) ---');
}

// --- GET / gviz export (website event registration verification) ---

function pad2_(n) {
  return n < 10 ? '0' + n : String(n);
}

/** Serialize cell for gviz { v: ... } so DOB parses as yyyy-mm-dd on the site. */
function cellValueForGviz_(val) {
  if (val === null || val === undefined || val === '') {
    return { v: '' };
  }
  if (Object.prototype.toString.call(val) === '[object Date]' && !isNaN(val.getTime())) {
    var y = val.getFullYear();
    var m = val.getMonth() + 1;
    var d = val.getDate();
    return { v: y + '-' + pad2_(m) + '-' + pad2_(d) };
  }
  return { v: String(val) };
}

/**
 * Reads SHEET_NAME: row 1 = headers (BR No, DOB, WhatsApp, Event list, …), row 2+ = data.
 * Returns full gviz setResponse(...) string including every column (site uses BR + DOB; others available for future use).
 */
function buildRegistrationSheetGviz_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet not found: ' + SHEET_NAME);
  }
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (!values || values.length < 1) {
    return wrapGvizResponse_({ cols: [], rows: [] });
  }

  var headerRow = values[0];
  var numCols = headerRow.length;
  var cols = [];
  for (var j = 0; j < numCols; j++) {
    var label = String(headerRow[j] || '').trim() || 'Column_' + (j + 1);
    cols.push({ id: 'C' + j, label: label, type: 'string', pattern: '' });
  }

  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var rowVals = values[i];
    var c = [];
    for (var k = 0; k < numCols; k++) {
      var cell = k < rowVals.length ? rowVals[k] : '';
      c.push(cellValueForGviz_(cell));
    }
    rows.push({ c: c });
  }

  return wrapGvizResponse_({ cols: cols, rows: rows });
}

function wrapGvizResponse_(table) {
  var payload = {
    version: '0.6',
    reqId: '0',
    status: 'ok',
    table: table,
  };
  return 'google.visualization.Query.setResponse(' + JSON.stringify(payload) + ');';
}

function buildGvizErrorBody_(message) {
  var payload = {
    version: '0.6',
    reqId: '0',
    status: 'error',
    errors: [{ reason: 'internal', detailed_message: String(message) }],
  };
  return 'google.visualization.Query.setResponse(' + JSON.stringify(payload) + ');';
}