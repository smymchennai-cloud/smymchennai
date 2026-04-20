import React, { useEffect } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { PrizePodiumCard } from './BulandiPrizeBlocks';

export function RulesModal({ event, onClose }) {
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
}

export function BrConfirmationModal({ brNumber, onClose }) {
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
        <p className="mt-4 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/90 px-4 py-3 text-center font-mono text-lg font-bold tracking-wide text-violet-950">
          {brNumber}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 text-base font-bold text-white shadow-md shadow-violet-600/25 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function EventRegistrationSuccessModal({ onClose }) {
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-reg-success-title"
        aria-describedby="event-reg-success-desc"
      >
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4 border-b border-violet-100 flex items-start justify-between gap-3">
          <h2 id="event-reg-success-title" className="text-lg font-bold text-gray-900 pr-2">
            Thank you
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
        <div className="p-6 sm:p-7 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 ring-4 ring-fuchsia-50"
            aria-hidden
          >
            <BadgeCheck className="h-8 w-8 text-violet-600" strokeWidth={2.25} />
          </div>
          <p id="event-reg-success-desc" className="text-sm text-gray-600 leading-relaxed">
            Your competition choices have been saved successfully.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 text-base font-bold text-white shadow-md shadow-violet-600/25 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
