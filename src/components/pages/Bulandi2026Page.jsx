import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Handshake,
  Trophy,
  X,
} from 'lucide-react';
import {
  bulandi2026Meta,
  bulandiGoldSponsors,
  bulandiPlatinumSponsors,
  bulandiTitleSponsor,
  bulandiSubEvents,
  bulandiRegistrationUpiQrUrl,
} from '../../data/bulandi2026Data';
import { BANK_DETAILS, GENDER_OPTIONS } from '../../constants/formOptions';
import { sendBulandiWhapiConfirmation } from '../../utils/bulandiWhapiNotify';

const TEN_DIGIT_PHONE = /^\d{10}$/;

const BULANDI_REG_DOB_INPUT_MIN = '1900-01-01';
/** Last selectable day strictly before 3 May 2021 (inclusive). */
const BULANDI_REG_DOB_INPUT_MAX = '2021-05-02';

function isValidCalendarDobYyyyMmDd(v) {
  if (!v || typeof v !== 'string') return false;
  const parts = v.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [by, bm, bd] = parts;
  const birth = new Date(by, bm - 1, bd);
  return (
    birth.getFullYear() === by && birth.getMonth() === bm - 1 && birth.getDate() === bd
  );
}

/** DOB checks for Bulandi: before 3 May 2021; run on change/blur in the field (submit still blocks tampering). */
function getBulandiDobFieldError(raw) {
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

/** Stricter than a single regex: local part, domain labels, and TLD length. */
const isValidEmailFormat = (raw) => {
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
};

const bulandiRegFieldError = {
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

const readFileAsBase64 = (file) =>
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

const parsePrizeTiers = (prizes) => {
  if (!prizes || typeof prizes !== 'string') return null;
  const parts = prizes.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  return { first: parts[0], second: parts[1], third: parts[2] };
};

const PrizeBadgesRow = ({ prizes }) => {
  const tiers = parsePrizeTiers(prizes);
  if (!tiers) {
    return <span className="text-xs font-medium text-violet-700 mt-1 block">{prizes}</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-2" role="group" aria-label="Prize money for 1st, 2nd, and 3rd place">
      <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-amber-950 shadow-sm ring-1 ring-amber-400/60 tabular-nums">
        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-amber-950/90" aria-hidden />
        <span className="sr-only">1st place: </span>
        {tiers.first}
      </span>
      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-slate-400 to-slate-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm tabular-nums">
        <span className="sr-only">2nd place: </span>
        {tiers.second}
      </span>
      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-orange-700 to-amber-900 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-amber-100 shadow-sm tabular-nums">
        <span className="sr-only">3rd place: </span>
        {tiers.third}
      </span>
    </div>
  );
};

const PrizePodiumCard = ({ prizes }) => {
  const tiers = parsePrizeTiers(prizes);
  if (!tiers) {
    return (
      <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">{prizes}</span>
    );
  }
  return (
    <div className="w-full rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-3 sm:p-4 shadow-md ring-1 ring-amber-200/50">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800/80 mb-3">
        Win big — prize pool
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-slate-400 to-slate-600 px-1.5 pt-3 pb-2.5 text-center text-white shadow-lg ring-1 ring-white/20">
          <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">2nd</span>
          <span className="mt-1 text-sm sm:text-base font-bold tabular-nums leading-none">{tiers.second}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 px-1.5 pt-2 pb-3 text-center text-amber-950 shadow-xl ring-2 ring-amber-300/80 scale-[1.03] sm:scale-105 z-[1]">
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 mb-1 drop-shadow-sm" strokeWidth={2} aria-hidden />
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-950/90">Winner</span>
          <span className="mt-1 text-base sm:text-lg font-black tabular-nums leading-none">{tiers.first}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-orange-700 to-amber-950 px-1.5 pt-3 pb-2.5 text-center text-amber-50 shadow-lg ring-1 ring-white/15">
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-100/90">3rd</span>
          <span className="mt-1 text-sm sm:text-base font-bold tabular-nums leading-none">{tiers.third}</span>
        </div>
      </div>
    </div>
  );
};

const RulesModal = ({ event, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="rules-modal-title"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <h2 id="rules-modal-title" className="text-lg font-bold text-gray-900 pr-4">
            Rules &amp; regulations — {event.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 text-gray-600 shrink-0"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
              {event.ageGroupLabel}
            </span>
          </div>
          <PrizePodiumCard prizes={event.prizes} />
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{event.rules}</p>
        </div>
      </div>
    </div>
  );
};

const BrConfirmationModal = ({ brNumber, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="br-modal-title"
        aria-describedby="br-modal-desc"
      >
        <h2 id="br-modal-title" className="text-lg font-bold text-gray-900">
          Registration received
        </h2>
        <p id="br-modal-desc" className="mt-3 text-sm text-gray-600">
          Save your Bulandi registration number for your records and for event coordination.
        </p>
        <p className="mt-4 rounded-xl border-2 border-dashed border-red-200 bg-red-50/80 px-4 py-3 text-center font-mono text-lg font-bold tracking-wide text-red-900">
          {brNumber}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-base font-bold text-white shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          OK
        </button>
      </div>
    </div>
  );
};

const BulandiRegistrationDrawer = ({ open, onClose, onRegistered }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [paymentFile, setPaymentFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setName('');
      setPhone('');
      setPhoneAlt('');
      setGender('');
      setDob('');
      setEmail('');
      setPaymentFile(null);
      setErrors({});
      setSubmitting(false);
      setSubmitError('');
    }
  }, [open]);

  const applyFieldError = (field, value) => {
    const msg = bulandiRegFieldError[field](value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const next = {};
    const fields = [
      ['name', name],
      ['phone', phone],
      ['phoneAlt', phoneAlt],
      ['gender', gender],
      ['dob', dob],
      ['email', email],
      ['paymentFile', paymentFile],
    ];
    for (const [key, val] of fields) {
      const msg = bulandiRegFieldError[key](val);
      if (msg) next[key] = msg;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const webAppUrl = (bulandi2026Meta.registrationWebAppUrl || '').trim();
    if (!webAppUrl) {
      setSubmitError(
        'Registration is not configured. Set registrationWebAppUrl in src/data/bulandi2026Data.js (Google Apps Script web app URL).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const paymentFileBase64 = await readFileAsBase64(paymentFile);
      const safeName = paymentFile.name.replace(/[^\w.\- ]+/g, '_').slice(0, 180);
      const payload = {
        name: name.trim(),
        whatsappNo: phone,
        phoneAlternate: phoneAlt.trim(),
        gender,
        dob,
        mail: email.trim(),
        paymentFileName: safeName || 'payment.jpg',
        paymentMimeType: paymentFile.type || 'image/jpeg',
        paymentFileBase64,
      };
      const regSecret = (bulandi2026Meta.registrationSubmitSecret || '').trim();
      if (regSecret) {
        payload.secret = regSecret;
      }

      const res = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          'Unexpected server response. Check the Apps Script deployment URL and that the script is deployed as a web app.'
        );
      }

      if (!data.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      if (!data.brNumber) {
        throw new Error('No BR number returned from the server.');
      }

      const br = String(data.brNumber);
      const whatsappTarget =
        data.whatsappNo != null && String(data.whatsappNo).trim() !== ''
          ? String(data.whatsappNo).trim()
          : phone;
      const dobForWhapi =
        data.dob != null && String(data.dob).trim() !== '' ? String(data.dob).trim() : dob;

      onRegistered(br);

      void sendBulandiWhapiConfirmation({
        whatsappNo: whatsappTarget,
        brNumber: br,
        name: name.trim(),
        dob: dobForWhapi,
      }).catch((err) => {
        console.warn('[Bulandi] WhatsApp confirmation failed:', err);
      });
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/45"
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl motion-safe:transition-transform motion-safe:duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulandi-reg-drawer-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-4 sm:px-5">
          <h2 id="bulandi-reg-drawer-title" className="text-lg font-bold text-gray-900">
            Bulandi registration
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Close registration form"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 space-y-4">
            <div>
              <label htmlFor="bulandi-reg-name" className="block text-sm font-semibold text-gray-800">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="bulandi-reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  applyFieldError('name', v);
                }}
                onBlur={(e) => applyFieldError('name', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="bulandi-reg-phone" className="block text-sm font-semibold text-gray-800">
                Phone (WhatsApp only) <span className="text-red-600">*</span>
              </label>
              <input
                id="bulandi-reg-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(v);
                  applyFieldError('phone', v);
                }}
                onBlur={(e) => applyFieldError('phone', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm tabular-nums focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.phone ? 'true' : 'false'}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="bulandi-reg-phone-alt" className="block text-sm font-semibold text-gray-800">
                Phone 2 (alternative, optional)
              </label>
              <input
                id="bulandi-reg-phone-alt"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={phoneAlt}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhoneAlt(v);
                  applyFieldError('phoneAlt', v);
                }}
                onBlur={(e) => applyFieldError('phoneAlt', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm tabular-nums focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.phoneAlt ? 'true' : 'false'}
              />
              {errors.phoneAlt && <p className="mt-1 text-xs text-red-600">{errors.phoneAlt}</p>}
            </div>

            <div>
              <label htmlFor="bulandi-reg-gender" className="block text-sm font-semibold text-gray-800">
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                id="bulandi-reg-gender"
                value={gender}
                onChange={(e) => {
                  const v = e.target.value;
                  setGender(v);
                  applyFieldError('gender', v);
                }}
                onBlur={(e) => applyFieldError('gender', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.gender ? 'true' : 'false'}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="bulandi-reg-dob" className="block text-sm font-semibold text-gray-800">
                Date of birth <span className="text-red-600">*</span>
              </label>
              <input
                id="bulandi-reg-dob"
                type="date"
                min={BULANDI_REG_DOB_INPUT_MIN}
                max={BULANDI_REG_DOB_INPUT_MAX}
                value={dob}
                onChange={(e) => {
                  const v = e.target.value;
                  setDob(v);
                  applyFieldError('dob', v);
                }}
                onBlur={(e) => applyFieldError('dob', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.dob ? 'true' : 'false'}
              />
              {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
            </div>

            <div>
              <label htmlFor="bulandi-reg-email" className="block text-sm font-semibold text-gray-800">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="bulandi-reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  applyFieldError('email', v);
                }}
                onBlur={(e) => applyFieldError('email', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-4 space-y-3">
              <h3 className="text-sm font-bold text-amber-950">Payment details</h3>
              <p className="text-sm font-semibold text-amber-950/95">
                Registration cost: <span className="tabular-nums">₹500</span>
              </p>
              <p className="rounded-lg bg-red-100 border border-red-200 px-3 py-2 text-xs font-bold text-red-900">
                No cash — pay only via bank transfer or UPI using the details below, then upload your payment screenshot.
              </p>
              <div className="text-sm text-gray-800 space-y-1.5">
                <p>
                  <span className="text-gray-500">Account name:</span>{' '}
                  <span className="font-semibold">{BANK_DETAILS.name}</span>
                </p>
                <p>
                  <span className="text-gray-500">Bank:</span>{' '}
                  <span className="font-medium">{BANK_DETAILS.bank}</span>
                </p>
                <p>
                  <span className="text-gray-500">Account no.:</span>{' '}
                  <span className="font-mono font-medium">{BANK_DETAILS.accountNumber}</span>
                </p>
                <p>
                  <span className="text-gray-500">IFSC:</span>{' '}
                  <span className="font-mono font-medium">{BANK_DETAILS.ifscCode}</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900/90 mb-2">UPI QR</p>
                {bulandiRegistrationUpiQrUrl?.trim() ? (
                  <div className="flex justify-center rounded-lg bg-white p-3 border border-amber-200">
                    <img
                      src={bulandiRegistrationUpiQrUrl.trim()}
                      alt="SMYM UPI QR code for payment"
                      className="max-h-48 w-auto max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-amber-900/80 bg-white/80 rounded-lg border border-dashed border-amber-300 px-3 py-3 text-center">
                    UPI QR image will appear here once added. Use bank transfer above if needed, or check SMYM updates for the UPI ID.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="bulandi-reg-payment" className="block text-sm font-semibold text-gray-800">
                  Payment screenshot <span className="text-red-600">*</span>
                </label>
                <input
                  id="bulandi-reg-payment"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setPaymentFile(f);
                    applyFieldError('paymentFile', f);
                  }}
                  onBlur={() => applyFieldError('paymentFile', paymentFile)}
                  className="mt-1.5 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700"
                  aria-invalid={errors.paymentFile ? 'true' : 'false'}
                />
                {errors.paymentFile && <p className="mt-1 text-xs text-red-600">{errors.paymentFile}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white p-4 sm:p-5 shrink-0 space-y-3">
            {submitError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-3.5 text-base font-extrabold text-white shadow-lg shadow-red-600/30 transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

const eventsUnder15 = bulandiSubEvents.filter((e) => e.ageGroup === 'under15');
const eventsOver15 = bulandiSubEvents.filter((e) => e.ageGroup === 'over15');

const BULANDI_PAGE_TABS = [
  { id: 'bulandi-registration', label: 'Bulandi Registration' },
  { id: 'event-registration', label: 'Event Registration' },
  { id: 'workshop-registration', label: 'Workshop registration' },
  { id: 'sponsors', label: 'Sponsors' },
];

/** Portrait + name; optional website link. */
const SponsorPersonCard = ({ entry, size = 'grid' }) => {
  const { name, imageUrl, websiteUrl } = entry;
  const label = name?.trim() ? name.trim() : 'To be announced';
  const isTitle = size === 'title';
  const frameClass = isTitle
    ? 'relative w-full max-w-[280px] mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md ring-2 ring-amber-200/50'
    : 'relative w-full aspect-square overflow-hidden rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white shadow-sm';

  const inner = (
    <div className={`flex flex-col items-center ${isTitle ? 'max-w-sm mx-auto' : ''}`}>
      <div className={frameClass}>
        {imageUrl?.trim() ? (
          <img
            src={imageUrl.trim()}
            alt={name?.trim() ? `${name.trim()} (sponsor)` : 'Sponsor'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-amber-700/55 text-xs sm:text-sm font-medium">
            Image coming soon
          </div>
        )}
      </div>
      <p
        className={`mt-2.5 sm:mt-3 font-semibold text-gray-900 text-center px-1 ${
          isTitle ? 'text-base sm:text-lg lg:text-xl' : 'text-xs sm:text-sm'
        }`}
      >
        {label}
      </p>
    </div>
  );

  if (websiteUrl?.trim()) {
    return (
      <a
        href={websiteUrl.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl outline-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        {inner}
      </a>
    );
  }

  return <div className="h-full">{inner}</div>;
};

const Bulandi2026Page = () => {
  const [openId, setOpenId] = useState(null);
  const [rulesEvent, setRulesEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('bulandi-registration');
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [brConfirmNumber, setBrConfirmNumber] = useState(null);

  const toggleRow = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const renderEventList = (events) => (
    <ul className="space-y-2.5">
      {events.map((event) => {
        const isOpen = openId === event.id;
        return (
          <li
            key={event.id}
            className="rounded-xl border border-violet-100 bg-white shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleRow(event.id)}
              className="w-full flex items-center justify-between gap-3 text-left px-3 py-3 sm:px-4 sm:py-3.5 hover:bg-violet-50/60 transition"
              aria-expanded={isOpen}
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-gray-900 text-sm sm:text-base block leading-snug">
                  {event.name}
                </span>
                <PrizeBadgesRow prizes={event.prizes} />
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-violet-600 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-violet-600 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-t border-violet-50 bg-violet-50/30">
                <button
                  type="button"
                  onClick={() => setRulesEvent(event)}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm border-2 border-violet-300 text-violet-800 bg-white hover:bg-violet-50 transition"
                >
                  Rules and regulations
                </button>
                {event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm text-center text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transition shadow-sm"
                  >
                    Register
                  </a>
                ) : (
                  <span className="flex min-h-[44px] items-center justify-center py-2.5 px-3 rounded-lg font-semibold text-sm text-center text-gray-500 bg-gray-100 border border-gray-200">
                    Register — soon
                  </span>
                )}
                {event.resultsUrl ? (
                  <a
                    href={event.resultsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm text-center text-emerald-900 border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm"
                  >
                    <Award className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                    View results
                  </a>
                ) : (
                  <span className="flex min-h-[44px] items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm text-center text-emerald-800/70 bg-emerald-50/80 border-2 border-solid border-emerald-400">
                    <Award className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                    Results — soon
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden py-8 sm:py-10 px-4 sm:px-6 lg:px-10 pb-16">
      {/* Absolute (not fixed) + isolate keeps the layer painting behind content reliably */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: 'url(/bulandi-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/85 via-white/78 to-amber-50/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-red-900 hover:text-red-950 font-semibold mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </a>

        <header className="mb-8 lg:mb-10">
          <img
            src="/bulandi-header.png"
            alt="Bulandi 2026"
            className="w-full max-h-[min(280px,40vw)] sm:max-h-[min(320px,36vw)] lg:max-h-[380px] object-contain object-center mx-auto rounded-2xl shadow-xl shadow-red-900/20 ring-2 ring-red-300/70 bg-white/30"
            decoding="async"
          />
        </header>

        <nav
          className="mb-8 lg:mb-10 rounded-2xl border-2 border-red-200/70 bg-white/55 backdrop-blur-sm p-2 sm:p-2.5 shadow-md shadow-red-900/5"
          aria-label="Bulandi page sections"
        >
          <div
            role="tablist"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-2"
            aria-orientation="horizontal"
          >
            {BULANDI_PAGE_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`bulandi-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={tab.id}
                  tabIndex={0}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[48px] rounded-xl px-4 py-3 text-center text-sm sm:text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    selected
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/35'
                      : 'bg-white/80 text-red-950 hover:bg-red-50/90 border border-transparent hover:border-red-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {activeTab === 'bulandi-registration' && (
        <div
          id="bulandi-registration"
          role="tabpanel"
          aria-labelledby="bulandi-tab-bulandi-registration bulandi-registration-heading"
          className="relative mb-10 lg:mb-12 scroll-mt-6"
        >
          <div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 opacity-50 blur-lg motion-safe:animate-pulse"
            aria-hidden
          />
          <section
            aria-labelledby="bulandi-registration-heading"
            className="relative rounded-2xl border-[3px] border-red-600 bg-gradient-to-br from-red-50 via-rose-100 to-orange-100 p-5 sm:p-6 lg:p-8 shadow-[0_20px_55px_-12px_rgba(185,28,28,0.55)] ring-2 ring-red-500/25"
          >
            <div className="w-full overflow-visible">
              <div className="relative z-0 mb-5 flex w-full justify-center overflow-visible px-1 sm:px-2">
                <div
                  className="pointer-events-none absolute left-1/2 top-[55%] h-20 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500/35 via-rose-400/45 to-orange-500/35 blur-2xl motion-safe:animate-pulse sm:h-24 sm:w-[min(100%,28rem)]"
                  aria-hidden
                />
                <h2
                  id="bulandi-registration-heading"
                  className="relative z-[1] inline-block max-w-full text-center text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 bg-[length:200%_auto] pb-2 pt-1 leading-[1.28] sm:leading-[1.22] motion-safe:animate-bulandiTitleGradient"
                >
                  Bulandi Registration
                </h2>
              </div>
              <div className="w-full text-left">
                <p className="text-red-950 text-base sm:text-lg leading-relaxed font-semibold [text-shadow:0_1px_2px_rgba(255,255,255,0.8)]">
                  Complete the{' '}
                  <strong className="font-black text-red-700">
                    main Bulandi 2026 registration
                  </strong>{' '}
                  first. It is{' '}
                  <strong className="font-black text-red-700 underline decoration-red-400 decoration-2 underline-offset-2">
                    required
                  </strong>{' '}
                  for anyone taking part in any of the competitions or activities listed below. After that, use each
                  event&apos;s{' '}
                  <strong className="font-black text-red-700">
                    Register
                  </strong>{' '}
                  link when it opens for that specific competition.
                </p>

                <div className="mt-7 w-full flex flex-col sm:flex-row gap-3 justify-start sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => setRegistrationDrawerOpen(true)}
                    className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-white/50 px-5 py-4 text-base sm:text-lg font-extrabold text-white text-center shadow-lg shadow-red-700/45 transition duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100 bg-gradient-to-r from-red-600 via-rose-600 to-red-700"
                  >
                    Bulandi Registration
                    <ChevronRight
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2.75}
                      aria-hidden
                    />
                  </button>

                  {bulandi2026Meta.scheduleUrl ? (
                    <a
                      href={bulandi2026Meta.scheduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-[3px] border-red-800 bg-white px-5 py-4 text-base sm:text-lg font-extrabold text-red-950 no-underline text-center shadow-md transition duration-200 hover:bg-red-50 hover:border-red-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100"
                    >
                      View schedule
                      <ChevronRight
                        className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 text-red-700"
                        strokeWidth={2.75}
                        aria-hidden
                      />
                    </a>
                  ) : (
                    <span
                      className="flex flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-[3px] border-solid border-red-400 bg-white/80 px-5 py-4 text-base sm:text-lg font-extrabold text-red-900/90 text-center"
                      role="status"
                    >
                      View schedule
                    </span>
                  )}
                </div>

                {!bulandi2026Meta.scheduleUrl && (
                  <p className="mt-4 text-left text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-rose-800">
                    Event schedule will be posted here soon — follow SMYM updates.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
        )}

        {activeTab === 'event-registration' && (
        <section
          id="event-registration"
          role="tabpanel"
          aria-labelledby="bulandi-tab-event-registration event-registration-heading"
          className="scroll-mt-6 mb-10 lg:mb-12"
        >
          <h2 id="event-registration-heading" className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Event Registration
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl mb-6 lg:mb-8">
            Sixteen events in two age groups. Tap an event for <strong>Rules and regulations</strong>,{' '}
            <strong>Register</strong>, and <strong>View results</strong> (after the event). Each competition shows a{' '}
            <strong>gold–silver–bronze</strong> prize strip for 1st, 2nd, and 3rd.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-start">
          <section className="min-w-0 rounded-2xl border border-violet-100/80 bg-white/40 backdrop-blur-sm p-4 sm:p-5 lg:p-6">
            <header className="mb-4 lg:mb-5 pb-3 border-b border-violet-200/60">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" aria-hidden />
                Under 15 years
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 pl-0.5 leading-relaxed">
                This category is for participants who are{' '}
                <strong className="font-semibold text-gray-800">over five years of age</strong> and{' '}
                <strong className="font-semibold text-gray-800">under fifteen years of age</strong>, determined
                as on the official Bulandi 2026 age reference date.{' '}
                <span className="text-gray-500">Eight competitions.</span>
              </p>
            </header>
            {renderEventList(eventsUnder15)}
          </section>
          <section className="min-w-0 rounded-2xl border border-violet-100/80 bg-white/40 backdrop-blur-sm p-4 sm:p-5 lg:p-6">
            <header className="mb-4 lg:mb-5 pb-3 border-b border-violet-200/60">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" aria-hidden />
                15 years and above
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 pl-0.5">Eight competitions</p>
            </header>
            {renderEventList(eventsOver15)}
          </section>
          </div>
        </section>
        )}

        {activeTab === 'workshop-registration' && (
        <div
          id="workshop-registration"
          role="tabpanel"
          aria-labelledby="bulandi-tab-workshop-registration workshop-registration-heading"
          className="relative mb-10 lg:mb-12 scroll-mt-6"
        >
          <div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 opacity-50 blur-lg motion-safe:animate-pulse"
            aria-hidden
          />
          <section
            aria-labelledby="workshop-registration-heading"
            className="relative rounded-2xl border-[3px] border-red-600 bg-gradient-to-br from-red-50 via-rose-100 to-orange-100 p-5 sm:p-6 lg:p-8 shadow-[0_20px_55px_-12px_rgba(185,28,28,0.55)] ring-2 ring-red-500/25"
          >
            <div className="w-full overflow-visible">
              <div className="relative z-0 mb-5 flex w-full justify-center overflow-visible px-1 sm:px-2">
                <div
                  className="pointer-events-none absolute left-1/2 top-[55%] h-20 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500/35 via-rose-400/45 to-orange-500/35 blur-2xl motion-safe:animate-pulse sm:h-24 sm:w-[min(100%,28rem)]"
                  aria-hidden
                />
                <h2
                  id="workshop-registration-heading"
                  className="relative z-[1] inline-block max-w-full text-center text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 bg-[length:200%_auto] pb-2 pt-1 leading-[1.28] sm:leading-[1.22] motion-safe:animate-bulandiTitleGradient"
                >
                  Workshop registration
                </h2>
              </div>
              <div className="w-full text-left">
                <p className="text-red-950 text-base sm:text-lg leading-relaxed font-semibold [text-shadow:0_1px_2px_rgba(255,255,255,0.8)]">
                  Complete the{' '}
                  <strong className="font-black text-red-700">
                    main Bulandi 2026 registration
                  </strong>{' '}
                  first. It is{' '}
                  <strong className="font-black text-red-700 underline decoration-red-400 decoration-2 underline-offset-2">
                    required
                  </strong>{' '}
                  for anyone attending Bulandi workshops. After that, use{' '}
                  <strong className="font-black text-red-700">Workshop registration</strong> when it opens for the
                  session you want to join.
                </p>

                <div className="mt-7 w-full flex flex-col sm:flex-row gap-3 justify-start sm:items-stretch">
                  {bulandi2026Meta.workshopRegistrationUrl ? (
                    <a
                      href={bulandi2026Meta.workshopRegistrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-white/50 px-5 py-4 text-base sm:text-lg font-extrabold text-white no-underline text-center shadow-lg shadow-red-700/45 transition duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100 bg-gradient-to-r from-red-600 via-rose-600 to-red-700"
                    >
                      Workshop registration
                      <ChevronRight
                        className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                        strokeWidth={2.75}
                        aria-hidden
                      />
                    </a>
                  ) : (
                    <span
                      className="flex flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-solid border-red-700 bg-gradient-to-r from-red-100 to-rose-200 px-5 py-4 text-base sm:text-lg font-extrabold text-black text-center"
                      role="status"
                    >
                      Workshop registration
                      <ChevronRight className="h-5 w-5 shrink-0 opacity-60" strokeWidth={2.75} aria-hidden />
                    </span>
                  )}

                  {bulandi2026Meta.scheduleUrl ? (
                    <a
                      href={bulandi2026Meta.scheduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-[3px] border-red-800 bg-white px-5 py-4 text-base sm:text-lg font-extrabold text-red-950 no-underline text-center shadow-md transition duration-200 hover:bg-red-50 hover:border-red-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100"
                    >
                      View schedule
                      <ChevronRight
                        className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 text-red-700"
                        strokeWidth={2.75}
                        aria-hidden
                      />
                    </a>
                  ) : (
                    <span
                      className="flex flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-[3px] border-solid border-red-400 bg-white/80 px-5 py-4 text-base sm:text-lg font-extrabold text-red-900/90 text-center"
                      role="status"
                    >
                      View schedule
                    </span>
                  )}
                </div>

                {!bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
                  <p className="mt-4 text-left text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-rose-800">
                    Workshop registration and schedule links will be shared here soon — follow SMYM updates.
                  </p>
                )}
                {!bulandi2026Meta.workshopRegistrationUrl && bulandi2026Meta.scheduleUrl && (
                  <p className="mt-4 text-left text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-rose-800">
                    Workshop registration link goes live here soon — follow SMYM updates.
                  </p>
                )}
                {bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
                  <p className="mt-4 text-left text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-rose-800">
                    Event schedule will be posted here soon.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
        )}

        {activeTab === 'sponsors' && (
        <section
          id="sponsors"
          role="tabpanel"
          aria-labelledby="bulandi-tab-sponsors sponsors-heading"
          className="mb-10 lg:mb-12 rounded-2xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 p-5 sm:p-6 lg:p-8 shadow-lg shadow-amber-900/10 scroll-mt-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="w-9 h-9 text-amber-700 shrink-0" strokeWidth={2} aria-hidden />
            <h2 id="sponsors-heading" className="text-2xl lg:text-3xl font-bold text-gray-900">
              Sponsors
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
            Our partners make Bulandi possible. Title, platinum, and gold supporters are listed below — names and photos will be updated as they are confirmed.
          </p>

          <div className="space-y-12 lg:space-y-14">
            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-amber-900/85 mb-5">
                Title sponsor
              </h3>
              <SponsorPersonCard entry={bulandiTitleSponsor} size="title" />
            </div>

            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-slate-700 mb-5">
                Platinum sponsors
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
                {bulandiPlatinumSponsors.map((entry, i) => (
                  <li key={`bulandi-platinum-${i}`}>
                    <SponsorPersonCard entry={entry} size="grid" />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-amber-900/75 mb-5">
                Gold sponsors
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {bulandiGoldSponsors.map((entry, i) => (
                  <li key={`bulandi-gold-${i}`}>
                    <SponsorPersonCard entry={entry} size="grid" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        )}
      </div>

      {rulesEvent && <RulesModal event={rulesEvent} onClose={() => setRulesEvent(null)} />}

      <BulandiRegistrationDrawer
        open={registrationDrawerOpen}
        onClose={() => setRegistrationDrawerOpen(false)}
        onRegistered={(br) => {
          setRegistrationDrawerOpen(false);
          setBrConfirmNumber(br);
        }}
      />

      {brConfirmNumber && (
        <BrConfirmationModal brNumber={brConfirmNumber} onClose={() => setBrConfirmNumber(null)} />
      )}
    </div>
  );
};

export default Bulandi2026Page;
