/** Shared validation + helpers for the Bulandi main registration drawer. */

export const TEN_DIGIT_PHONE = /^\d{10}$/;

export const BULANDI_REG_DOB_INPUT_MIN = '1900-01-01';
/** Last selectable day strictly before 3 May 2021 (inclusive). */
export const BULANDI_REG_DOB_INPUT_MAX = '2021-05-02';

export function isValidCalendarDobYyyyMmDd(v) {
  if (!v || typeof v !== 'string') return false;
  const parts = v.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [by, bm, bd] = parts;
  const birth = new Date(by, bm - 1, bd);
  return birth.getFullYear() === by && birth.getMonth() === bm - 1 && birth.getDate() === bd;
}

/** Parse yyyy-mm-dd in local calendar (no UTC shift). */
function parseBulandiDobIsoLocal(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function compareBulandiDobIso(a, b) {
  const da = parseBulandiDobIsoLocal(a);
  const db = parseBulandiDobIsoLocal(b);
  if (!da || !db) return null;
  const ta = da.getTime();
  const tb = db.getTime();
  if (ta < tb) return -1;
  if (ta > tb) return 1;
  return 0;
}

/** DOB checks for Bulandi: before 3 May 2021; run on change/blur in the field (submit still blocks tampering). */
export function getBulandiDobFieldError(raw) {
  const s = raw == null ? '' : String(raw).trim();
  if (!s) return 'Date of birth is required.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'Enter a valid date of birth.';
  if (!isValidCalendarDobYyyyMmDd(s)) return 'Enter a valid date of birth.';
  const cmpMin = compareBulandiDobIso(s, BULANDI_REG_DOB_INPUT_MIN);
  const cmpMax = compareBulandiDobIso(s, BULANDI_REG_DOB_INPUT_MAX);
  if (cmpMin === null || cmpMax === null) return 'Enter a valid date of birth.';
  if (cmpMin < 0) {
    return 'Date of birth must be on or after 1 January 1900.';
  }
  if (cmpMax > 0) {
    return 'Date of birth must be before 3 May 2021.';
  }
  return undefined;
}

/**
 * Clamp yyyy-mm-dd into Bulandi main-registration bounds. Mobile date pickers often ignore min/max;
 * this keeps the value consistent with desktop.
 *
 * Does not rewrite years outside 1900–2021 so transient native date-picker values (e.g. year 0003
 * while typing 1993) are not snapped to 1900-01-01. String comparison is not used (it wrongly treats
 * 1993 as after 2021).
 */
export function clampBulandiRegistrationDobValue(raw) {
  const s = raw == null ? '' : String(raw).trim();
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !isValidCalendarDobYyyyMmDd(s)) return s;
  const y = Number(s.slice(0, 4));
  if (y < 1900 || y > 2021) return s;
  const cmpMin = compareBulandiDobIso(s, BULANDI_REG_DOB_INPUT_MIN);
  const cmpMax = compareBulandiDobIso(s, BULANDI_REG_DOB_INPUT_MAX);
  if (cmpMin === null || cmpMax === null) return s;
  if (cmpMin < 0) return BULANDI_REG_DOB_INPUT_MIN;
  if (cmpMax > 0) return BULANDI_REG_DOB_INPUT_MAX;
  return s;
}

/** Stricter than a single regex: local part, domain labels, and TLD length. */
export function isValidEmailFormat(raw) {
  const email = typeof raw === 'string' ? raw.trim() : '';
  if (!email || email.length > 254) return false;
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || local.length > 64 || !domain || domain.length > 253) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
  if (!domain.includes('.')) return false;
  const labels = domain.split('.');
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || tld.length > 63) return false;
  if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/.test(local)) return false;
  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)
  );
}

export const bulandiRegFieldError = {
  name: (v) => (!v.trim() ? 'Name is required.' : undefined),
  fatherName: (v) => (!String(v ?? '').trim() ? "Father's name is required." : undefined),
  phone: (v) =>
    !TEN_DIGIT_PHONE.test(v) ? 'Enter a valid 10-digit WhatsApp number.' : undefined,
  phoneAlt: (v) => {
    const t = v.trim();
    if (!t) return undefined;
    return !TEN_DIGIT_PHONE.test(t) ? 'Alternative number must be 10 digits.' : undefined;
  },
  gender: (v) => (!v ? 'Please select gender.' : undefined),
  dob: (v) => getBulandiDobFieldError(v),
  email: (v) => {
    const t = v.trim();
    if (!t) return 'Email is required.';
    if (!isValidEmailFormat(t)) {
      return 'Enter a valid email address (e.g. name@example.com).';
    }
    return undefined;
  },
  paymentFile: (f) => (!f ? 'Payment screenshot is required.' : undefined),
};

export const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read payment screenshot.'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Could not read payment screenshot.'));
    reader.readAsDataURL(file);
  });
