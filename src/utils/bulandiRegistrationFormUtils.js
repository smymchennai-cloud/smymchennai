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

/** DOB checks for Bulandi: before 3 May 2021; run on change/blur in the field (submit still blocks tampering). */
export function getBulandiDobFieldError(raw) {
  const s = raw == null ? '' : String(raw).trim();
  if (!s) return 'Date of birth is required.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'Enter a valid date of birth.';
  if (!isValidCalendarDobYyyyMmDd(s)) return 'Enter a valid date of birth.';
  if (s < BULANDI_REG_DOB_INPUT_MIN) {
    return 'Date of birth must be on or after 1 January 1900.';
  }
  if (s > BULANDI_REG_DOB_INPUT_MAX) {
    return 'Date of birth must be before 3 May 2021.';
  }
  return undefined;
}

/**
 * Clamp yyyy-mm-dd into Bulandi main-registration bounds. Mobile date pickers often ignore min/max;
 * this keeps the value consistent with desktop.
 */
export function clampBulandiRegistrationDobValue(raw) {
  const s = raw == null ? '' : String(raw).trim();
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !isValidCalendarDobYyyyMmDd(s)) return s;
  if (s < BULANDI_REG_DOB_INPUT_MIN) return BULANDI_REG_DOB_INPUT_MIN;
  if (s > BULANDI_REG_DOB_INPUT_MAX) return BULANDI_REG_DOB_INPUT_MAX;
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
