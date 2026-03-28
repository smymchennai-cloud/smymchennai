/**
 * Load Bulandi main-registration rows from a public Google Sheet (gviz JSON).
 * If the browser blocks Google (CORS), set `eventRegistrationSheetFetchUrl` in bulandi2026Data
 * to an Apps Script web app that returns the same gviz response body as text.
 */

const SHEET_CACHE_TTL_MS = 2 * 60 * 1000;
let cache = { key: '', at: 0, payload: null };

function buildGvizUrl(spreadsheetId, gid) {
  const g = gid === undefined || gid === '' ? '0' : String(gid);
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${encodeURIComponent(g)}`;
}

/**
 * Pull the JSON object argument from google.visualization.Query.setResponse({...});
 * Uses brace matching so nested objects and trailing noise after `);` do not break parsing.
 * @param {string} text
 */
function extractSetResponseJsonObjectString(text) {
  const marker = 'google.visualization.Query.setResponse(';
  const idx = text.indexOf(marker);
  if (idx < 0) return null;
  let pos = idx + marker.length;
  while (pos < text.length && /\s/.test(text[pos])) pos += 1;
  if (text[pos] !== '{') return null;
  const start = pos;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let p = pos; p < text.length; p += 1) {
    const c = text[p];
    if (escape) {
      escape = false;
      continue;
    }
    if (inStr) {
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === '{') depth += 1;
    if (c === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, p + 1);
    }
  }
  return null;
}

/** @param {string} text */
export function parseGvizJsonResponse(text) {
  let t = String(text ?? '').replace(/^\uFEFF/, '').trim();
  if (!t) throw new Error('Empty response from registration sheet.');
  if (t.startsWith('<')) {
    const looksLikeGoogleAuth =
      /authorization is required|accounts\.google\.com|Sign in|access denied/i.test(t);
    const looksLikeCraIndex =
      /id="root"|id='root'|react-scripts|webpack/i.test(t) && /<!DOCTYPE html/i.test(t);
    if (looksLikeCraIndex) {
      throw new Error(
        'Received the React dev app index.html instead of sheet data. Restart npm start after editing src/config/bulandiWebApp.json; dev uses /bulandi-sheet-exec via src/setupProxy.js (must match that JSON).'
      );
    }
    throw new Error(
      looksLikeGoogleAuth
        ? 'The web app URL returned Google’s HTML “authorization” page instead of data. In Apps Script: Deploy → Manage deployments → select your Web app → Edit (pencil) → set “Who has access” to Anyone (choose the option that allows anonymous users, e.g. “Anyone” / “Anyone with Google account” depending on your UI), “Execute as: Me” → Deploy NEW version. Then open the /exec link in an incognito window; it must show google.visualization.Query.setResponse( without signing in. Workspace accounts: your admin may block public web apps.'
        : 'The sheet URL returned HTML instead of gviz data. If /exec works in incognito, set src/config/bulandiWebApp.json execUrl to that exact URL, then restart npm start (dev) or rebuild (production). Dev proxy reads the same JSON so /bulandi-sheet-exec hits the correct deployment.'
    );
  }
  // Google gviz sometimes prefixes responses (XSSI guard)
  t = t.replace(/^\)\]\}'\s*/m, '').trim();

  const inner = extractSetResponseJsonObjectString(t);
  if (inner) {
    try {
      return JSON.parse(inner);
    } catch {
      throw new Error('Registration sheet response contained invalid JSON after setResponse.');
    }
  }

  // Plain JSON (e.g. custom endpoint returning only the payload object)
  if (t.startsWith('{')) {
    try {
      const o = JSON.parse(t);
      if (o && (o.table != null || o.status === 'error' || o.status === 'ok')) return o;
    } catch {
      /* fall through */
    }
  }

  const hint = t.length > 160 ? `${t.slice(0, 160)}…` : t;
  throw new Error(
    `Unexpected response from registration sheet. Expected google.visualization.Query.setResponse({...}). Starts with: ${hint.replace(/\s+/g, ' ')}`
  );
}

/** @param {{ status?: string, errors?: Array<{ detailed_message?: string, message?: string, reason?: string }> }} parsed */
function gvizErrorMessage(parsed) {
  const errs = parsed?.errors;
  if (!Array.isArray(errs) || errs.length === 0) return '';
  return errs
    .map((e) => (e && (e.detailed_message || e.message || e.reason)) || '')
    .filter(Boolean)
    .join(' ')
    .trim();
}

/** @param {unknown} v */
function cellToString(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'string' || typeof v === 'number') {
    const s = String(v).trim();
    const dm = /^Date\((\d+),\s*(\d+),\s*(\d+)\)/.exec(s);
    if (dm) {
      const y = parseInt(dm[1], 10);
      const month0 = parseInt(dm[2], 10);
      const d = parseInt(dm[3], 10);
      const mo = month0 + 1;
      return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return s;
  }
  if (typeof v === 'object' && v !== null) {
    if ('year' in v && 'month' in v && 'day' in v) {
      const y = v.year;
      const mo = v.month;
      const d = v.day;
      if (typeof y === 'number' && typeof mo === 'number' && typeof d === 'number') {
        const mm = String(mo).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
    }
  }
  return String(v).trim();
}

/**
 * @param {string} spreadsheetId
 * @param {string} [gid]
 * @param {string} [overrideFetchUrl] full URL to GET (proxy)
 * @param {{ skipCache?: boolean }} [options] pass `{ skipCache: true }` to always refetch (e.g. Validate details)
 */
export async function fetchBulandiRegistrationTable(spreadsheetId, gid, overrideFetchUrl, options) {
  const skipCache = options?.skipCache === true;
  const cacheKey = `${spreadsheetId}|${gid}|${overrideFetchUrl || ''}`;
  const now = Date.now();
  if (
    !skipCache &&
    cache.payload &&
    cache.key === cacheKey &&
    now - cache.at < SHEET_CACHE_TTL_MS
  ) {
    return cache.payload;
  }

  let url = (overrideFetchUrl || '').trim() || buildGvizUrl(spreadsheetId, gid);
  if (skipCache && url) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}_ts=${now}`;
  }
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Could not load registration data (${res.status}).`);
  const text = await res.text();
  const parsed = parseGvizJsonResponse(text);

  if (parsed.status === 'error') {
    const fromGoogle = gvizErrorMessage(parsed);
    throw new Error(
      fromGoogle ||
        'The registration sheet could not be loaded (Google returned an error). Check sharing, gid, or the Apps Script proxy deployment.'
    );
  }

  const table = parsed?.table;
  if (!table?.cols) {
    throw new Error('Registration sheet format was not recognised (no column definitions).');
  }

  const rowSource = Array.isArray(table.rows) ? table.rows : [];

  const headers = table.cols.map((c, i) => {
    const label = (c?.label || '').trim();
    return label || `Column_${i + 1}`;
  });

  const rows = rowSource.map((row) => {
    /** @type {Record<string, string>} */
    const obj = {};
    const cells = row.c || [];
    headers.forEach((h, i) => {
      obj[h] = cellToString(cells[i]?.v ?? cells[i]?.f);
    });
    return obj;
  });

  const payload = { headers, rows };
  cache = { key: cacheKey, at: now, payload };
  return payload;
}

/** @param {string} raw */
export function parseBrNumeric(raw) {
  const s = String(raw ?? '').replace(/\s/g, '').toUpperCase();
  const digits = s.replace(/\D/g, '');
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

/** @param {string} raw */
export function normalizeDobToIso(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const dayFirst = a > 12;
    const dd = dayFirst ? a : b;
    const mm = dayFirst ? b : a;
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
  }
  return s;
}

/**
 * True → participant should see Under 15 events; false → 15 and above.
 * BR1500 through BR2999 (inclusive); BR3000+ uses the over-15 list.
 * @param {number} n
 */
export function isUnder15BrRange(n) {
  return n >= 1500 && n < 3000;
}

/** @param {string[]} headers */
function findBrColumnKey(headers) {
  const lower = headers.map((h) => h.toLowerCase());
  const patterns = [
    /^br\s*number$/,
    /^br\s*no\.?$/,
    /^br$/,
    /br\s*number/,
    /bulandi.*(reg|registration).*(no|num|number)/,
    /registration.*(no|num|number)/,
    /^br\s*$/,
  ];
  for (const re of patterns) {
    const i = lower.findIndex((h) => re.test(h));
    if (i >= 0) return headers[i];
  }
  const idx = lower.findIndex((h) => h.includes('br') && (h.includes('no') || h.includes('num')));
  return idx >= 0 ? headers[idx] : null;
}

/** @param {string[]} headers */
function findDobColumnKey(headers) {
  const lower = headers.map((h) => h.toLowerCase());
  const patterns = [/date\s*of\s*birth/, /^dob$/, /birth\s*date/, /^dob\s/];
  for (const re of patterns) {
    const i = lower.findIndex((h) => re.test(h));
    if (i >= 0) return headers[i];
  }
  const idx = lower.findIndex((h) => h.includes('dob') || h.includes('birth'));
  return idx >= 0 ? headers[idx] : null;
}

/** Shown when BR + DOB do not match a row (or DOB wrong for that BR). */
export const BULANDI_REGISTRATION_MISMATCH_MESSAGE = 'Mismatch registration details';

/**
 * @param {Record<string, string>[]} rows
 * @param {string[]} headers
 * @param {string} brInput
 * @param {string} dobInput yyyy-mm-dd from <input type="date">
 */
export function findMatchingRegistrationRow(rows, headers, brInput, dobInput) {
  const brKey = findBrColumnKey(headers);
  const dobKey = findDobColumnKey(headers);
  if (!brKey) {
    throw new Error(
      'The registration sheet has no BR column (expected a header like “BR number” or “BR”).'
    );
  }
  if (!dobKey) {
    throw new Error(
      'The registration sheet has no date-of-birth column (expected “DOB” or “Date of birth”).'
    );
  }

  const wantBr = parseBrNumeric(brInput);
  if (wantBr == null) throw new Error('Enter a valid BR number (e.g. BR1511 or 1511).');

  const wantDob = normalizeDobToIso(dobInput);
  if (!wantDob || !/^\d{4}-\d{2}-\d{2}$/.test(wantDob)) {
    throw new Error('Enter your date of birth.');
  }

  for (const row of rows) {
    const sheetBr = parseBrNumeric(row[brKey] || '');
    if (sheetBr == null || sheetBr !== wantBr) continue;
    const sheetDobRaw = row[dobKey] || '';
    const sheetDob = normalizeDobToIso(sheetDobRaw);
    if (sheetDob === wantDob) {
      return { row, brNumeric: wantBr, brKey, dobKey };
    }
    throw new Error(BULANDI_REGISTRATION_MISMATCH_MESSAGE);
  }

  throw new Error(BULANDI_REGISTRATION_MISMATCH_MESSAGE);
}

function normalizeHeaderForEventMatch(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** @param {string[]} headers sheet column labels */
export function findSheetColumnKeyForEventName(headers, eventDisplayName) {
  const t = normalizeHeaderForEventMatch(eventDisplayName);
  for (const h of headers) {
    if (normalizeHeaderForEventMatch(h) === t) return h;
  }
  return null;
}

/** @param {unknown} val cell from registration row */
export function sheetCellIndicatesEventRegistered(val) {
  const s = String(val ?? '').trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (['no', 'n', 'false', '0', '-', 'na', 'n/a', 'pending'].includes(lower)) return false;
  if (['yes', 'y', 'true', '1', '✓', '√', 'registered', 'done', 'ok', 'x'].includes(lower)) return true;
  return true;
}

/**
 * @param {Record<string, string>} row matched registration row
 * @param {string[]} headers
 * @param {{ id: string, name: string }[]} events eligible list for age band
 */
export function preselectedEventIdsFromRegistrationRow(row, headers, events) {
  const ids = [];
  for (const ev of events) {
    const key = findSheetColumnKeyForEventName(headers, ev.name);
    if (key && sheetCellIndicatesEventRegistered(row[key])) ids.push(ev.id);
  }
  return ids;
}

/**
 * POST JSON to the bound Bulandi Apps Script web app (registration, event choices, admin check-in, etc.).
 * @param {string} webAppUrl same `/exec` URL as main registration
 * @param {Record<string, unknown>} body includes optional `secret` when meta.registrationSubmitSecret is set
 */
export async function postBulandiWebApp(webAppUrl, body) {
  const url = (webAppUrl || '').trim();
  if (!url) throw new Error('Web app URL is not configured.');

  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      'Unexpected server response. Check the Apps Script deployment and that the web app returns JSON.'
    );
  }

  if (!data.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

/**
 * POST event choices (`action: 'eventRegistration'`).
 * @param {string} webAppUrl same `/exec` URL as main registration
 * @param {Record<string, unknown>} body includes optional `secret` when meta.registrationSubmitSecret is set
 */
export async function postBulandiEventRegistration(webAppUrl, body) {
  return postBulandiWebApp(webAppUrl, body);
}
