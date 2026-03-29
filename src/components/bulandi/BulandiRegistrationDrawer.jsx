import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { bulandi2026Meta, bulandiRegistrationUpiQrUrl } from '../../data/bulandi2026Data';
import { BANK_DETAILS, GENDER_OPTIONS } from '../../constants/formOptions';
import { sendBulandiWhapiConfirmation } from '../../utils/bulandiWhapiNotify';
import {
  BULANDI_REG_DOB_INPUT_MAX,
  BULANDI_REG_DOB_INPUT_MIN,
  bulandiRegFieldError,
  clampBulandiRegistrationDobValue,
  readFileAsBase64,
} from '../../utils/bulandiRegistrationFormUtils';

export function BulandiRegistrationDrawer({ open, onClose, onRegistered }) {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [paymentFile, setPaymentFile] = useState(null);
  const [aadharAcknowledged, setAadharAcknowledged] = useState(false);
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
      setFatherName('');
      setPhone('');
      setPhoneAlt('');
      setGender('');
      setDob('');
      setEmail('');
      setPaymentFile(null);
      setAadharAcknowledged(false);
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
      ['fatherName', fatherName],
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
    if (!aadharAcknowledged) {
      next.aadharAcknowledged =
        'Please confirm you will bring Aadhaar proof on the event day for verification at the registration desk.';
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
        fatherName: fatherName.trim(),
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
        throw new Error('No B number returned from the server.');
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
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 shadow-sm"
              role="note"
              aria-label="Registration eligibility"
            >
              <p className="font-bold text-amber-950">Disclaimer — who may register</p>
              <p className="mt-2 leading-relaxed text-amber-950/95">
                <span className="font-semibold">TKPP Maheshwaris only.</span> Registration is intended for
                Maheshwaris in <span className="font-semibold">Tamil Nadu</span>,{' '}
                <span className="font-semibold">Kerala</span>, and{' '}
                <span className="font-semibold">Puducherry (Pondicherry)</span> only. Please complete this form
                only if you belong to this group.
              </p>
            </div>

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
              <label htmlFor="bulandi-reg-father-name" className="block text-sm font-semibold text-gray-800">
                Father&apos;s name <span className="text-red-600">*</span>
              </label>
              <input
                id="bulandi-reg-father-name"
                type="text"
                autoComplete="additional-name"
                value={fatherName}
                onChange={(e) => {
                  const v = e.target.value;
                  setFatherName(v);
                  applyFieldError('fatherName', v);
                }}
                onBlur={(e) => applyFieldError('fatherName', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-invalid={errors.fatherName ? 'true' : 'false'}
              />
              {errors.fatherName && <p className="mt-1 text-xs text-red-600">{errors.fatherName}</p>}
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
                onBlur={(e) => {
                  const v = clampBulandiRegistrationDobValue(e.target.value.trim());
                  if (v !== e.target.value.trim()) setDob(v);
                  applyFieldError('dob', v);
                }}
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
                Registration fees: <span className="tabular-nums">₹500</span>
              </p>
              <p className="rounded-lg bg-red-100 border border-red-200 px-3 py-2 text-xs font-bold text-red-900">
                No cash — pay only via bank transfer or UPI using the details below, then upload your payment screenshot.
              </p>
              <p className="text-xs text-gray-800 leading-snug">
                For any payment issues, please WhatsApp{' '}
                <a
                  href="https://wa.me/918610447053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-red-700 underline decoration-red-400 underline-offset-2 hover:text-red-800"
                >
                  8610447053
                </a>
                .
              </p>
              <dl className="grid grid-cols-[8.75rem_1fr] gap-x-3 gap-y-2 text-sm text-gray-800 sm:grid-cols-[10.5rem_1fr]">
                <dt className="text-gray-600 shrink-0">Account Name</dt>
                <dd className="m-0 font-semibold text-gray-900 break-words">{BANK_DETAILS.name}</dd>
                <dt className="text-gray-600 shrink-0">Bank Name</dt>
                <dd className="m-0 font-medium text-gray-900 break-words">{BANK_DETAILS.bankName}</dd>
                <dt className="text-gray-600 shrink-0">Branch Name</dt>
                <dd className="m-0 font-medium text-gray-900 break-words">{BANK_DETAILS.branch}</dd>
                <dt className="text-gray-600 shrink-0">Account No.</dt>
                <dd className="m-0 font-mono font-medium text-gray-900 tabular-nums break-all">
                  {BANK_DETAILS.accountNumber}
                </dd>
                <dt className="text-gray-600 shrink-0">IFSC Code</dt>
                <dd className="m-0 font-mono font-medium text-gray-900 tabular-nums break-all">
                  {BANK_DETAILS.ifscCode}
                </dd>
              </dl>

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
            <div
              className={`rounded-lg border px-3 py-3 ${
                errors.aadharAcknowledged ? 'border-red-300 bg-red-50/80' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  id="bulandi-reg-aadhar-ack"
                  type="checkbox"
                  checked={aadharAcknowledged}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAadharAcknowledged(checked);
                    setErrors((prev) => {
                      const n = { ...prev };
                      if (checked) delete n.aadharAcknowledged;
                      return n;
                    });
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  aria-invalid={errors.aadharAcknowledged ? 'true' : 'false'}
                  aria-describedby={
                    errors.aadharAcknowledged ? 'bulandi-reg-aadhar-ack-error' : undefined
                  }
                />
                <label
                  htmlFor="bulandi-reg-aadhar-ack"
                  className="text-sm text-gray-800 leading-snug cursor-pointer select-none"
                >
                  <span className="font-semibold text-gray-900">Required:</span> I will carry my{' '}
                  <span className="font-semibold">Aadhaar proof</span> on the day of the event for verification at
                  the registration desk. <span className="text-red-600">*</span>
                </label>
              </div>
              {errors.aadharAcknowledged ? (
                <p id="bulandi-reg-aadhar-ack-error" className="mt-2 text-xs text-red-700 pl-7" role="alert">
                  {errors.aadharAcknowledged}
                </p>
              ) : null}
            </div>
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
}
