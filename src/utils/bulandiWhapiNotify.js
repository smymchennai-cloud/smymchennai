/**
 * Bulandi registration → Whapi.Cloud WhatsApp confirmation.
 *
 * - Local dev: POST /__whapi/messages/text (see src/setupProxy.js — token added server-side).
 * - Production build: POST https://gate.whapi.cloud/messages/text with Bearer token
 *   (set REACT_APP_WHAPI_TOKEN in the host’s build environment).
 *
 * Optional: REACT_APP_WHAPI_BASE_URL (production only; default https://gate.whapi.cloud).
 */

const WHAPI_SEND_TIMEOUT_MS = 60_000;

/** @param {unknown} input */
export function normalizeWhapiTo(input) {
  let digits = String(input ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** @param {unknown} isoYyyyMmDd */
function formatDobForMessage(isoYyyyMmDd) {
  const s = String(isoYyyyMmDd ?? '').trim();
  if (!s) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

function getWhapiSendUrl() {
  const useDevProxy = process.env.NODE_ENV === 'development';
  if (useDevProxy) return '/__whapi/messages/text';
  const base = (process.env.REACT_APP_WHAPI_BASE_URL || 'https://gate.whapi.cloud').replace(/\/$/, '');
  return `${base}/messages/text`;
}

/**
 * @param {{ whatsappNo: string, brNumber: string, name: string, dob: string }} params
 * @returns {Promise<void>}
 */
export async function sendBulandiWhapiConfirmation({ whatsappNo, brNumber, name, dob }) {
  const useDevProxy = process.env.NODE_ENV === 'development';
  const token = (process.env.REACT_APP_WHAPI_TOKEN || '').trim();

  if (!token) {
    console.warn(
      '[Bulandi] WhatsApp skipped: set REACT_APP_WHAPI_TOKEN in .env.local (dev) or in your hosting build env (production), then restart the dev server / rebuild.'
    );
    return;
  }

  const to = normalizeWhapiTo(whatsappNo);
  if (!to) {
    console.warn('[Bulandi] WhatsApp skipped: could not normalize phone number for Whapi `to` field.');
    return;
  }

  const displayName = (name || 'there').trim() || 'there';
  const dobLine = formatDobForMessage(dob);

  const messageBody =
    `✨ *Jai Mahesh! You're officially in, ${displayName}!* ✨\n\n` +
    `We're thrilled to have you at Kanta J Narayan Rathi Bulandi 2026! Get ready for an unforgettable celebration of talent, culture, and community. 🎊\n\n` +
    `Here are your registration details — keep them handy!\n\n` +
    `🏷️ *BR Number:* ${brNumber}\n` +
    `📅 *Date of Birth:* ${dobLine}\n\n` +
    `You'll need these to sign up for events, so don't lose them! 😊\n\n` +
    `📲 *Join the official Bulandi group for updates, schedules & all the excitement:*\n` +
    `https://chat.whatsapp.com/L14kRAoLXKP371AASqqowo?mode=gi_t\n\n` +
    `Can't wait to see you there! 🙏🎶\n` +
    `— *SMYM Bulandi Team*`;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (!useDevProxy) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WHAPI_SEND_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(getWhapiSendUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, body: messageBody }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error(`Whapi request timed out after ${WHAPI_SEND_TIMEOUT_MS / 1000}s`);
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await res.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const msg = json?.error ?? json?.message ?? (raw || `HTTP ${res.status}`);
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  if (json && json.error != null && json.error !== '') {
    const msg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
    throw new Error(msg);
  }
}
