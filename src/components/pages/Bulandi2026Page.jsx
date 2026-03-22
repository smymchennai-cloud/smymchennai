import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  MapPin,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { bulandi2026Meta, bulandiSubEvents } from '../../data/bulandi2026Data';

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
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

const eventsUnder15 = bulandiSubEvents.filter((e) => e.ageGroup === 'under15');
const eventsOver15 = bulandiSubEvents.filter((e) => e.ageGroup === 'over15');

const Bulandi2026Page = () => {
  const [openId, setOpenId] = useState(null);
  const [rulesEvent, setRulesEvent] = useState(null);

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
                  <span className="flex min-h-[44px] items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-sm text-center text-emerald-800/70 bg-emerald-50/80 border border-dashed border-emerald-400">
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
          className="inline-flex items-center gap-2 text-violet-800 hover:text-violet-950 font-semibold mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </a>

        <div className="mb-8 lg:mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
          <div className="text-center lg:text-left lg:max-w-2xl">
            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-violet-600 mx-auto lg:mx-0 mb-3" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {bulandi2026Meta.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Annual cultural extravaganza celebrating youth talent and community spirit.
            </p>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-3 sm:gap-4 text-sm text-gray-700 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 border border-violet-100 px-4 py-3 shadow-sm">
              <Calendar className="w-5 h-5 text-violet-600 shrink-0" />
              <span className="text-left leading-snug">
                {new Date(bulandi2026Meta.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 border border-violet-100 px-4 py-3 shadow-sm max-w-xs">
              <MapPin className="w-5 h-5 text-violet-600 shrink-0" />
              <span className="text-left leading-snug">{bulandi2026Meta.venueNote}</span>
            </span>
          </div>
        </div>

        <section className="mb-8 lg:mb-10 rounded-2xl border-[3px] border-fuchsia-500 bg-gradient-to-br from-fuchsia-100 via-violet-100 to-amber-200 p-5 sm:p-6 lg:p-8 shadow-[0_20px_50px_-12px_rgba(192,38,211,0.45)]">
          <div className="flex flex-col md:flex-row md:items-start gap-4 lg:gap-6">
            <ClipboardList className="w-12 h-12 text-fuchsia-600 shrink-0 md:mt-0.5 mx-auto md:mx-0 drop-shadow-sm" strokeWidth={2.25} />
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-violet-700 to-orange-600 mb-3">
                Bulandi event registration
              </h2>
              <p className="text-violet-950 text-sm sm:text-base leading-relaxed max-w-4xl font-medium">
                Complete the <strong className="text-fuchsia-800">main Bulandi 2026 registration</strong> first. It
                is <strong className="text-violet-800">required</strong> for anyone taking part in any of the
                competitions or activities listed below. After that, use each event&apos;s{' '}
                <strong className="text-orange-700">Register</strong> link when it opens for that specific
                competition.
              </p>

              <div className="mt-6 md:mt-7 max-w-2xl mx-auto md:mx-0 flex flex-col sm:flex-row gap-3">
                {bulandi2026Meta.mainRegistrationUrl ? (
                  <a
                    href={bulandi2026Meta.mainRegistrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-5 py-4 text-base sm:text-lg font-extrabold text-white no-underline shadow-lg shadow-fuchsia-600/50 transition duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-100 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-orange-500"
                  >
                    Bulandi event registration
                    <ChevronRight
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2.75}
                      aria-hidden
                    />
                  </a>
                ) : (
                  <span
                    className="flex flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-500 bg-gradient-to-r from-violet-200 to-fuchsia-200 px-5 py-4 text-base sm:text-lg font-extrabold text-violet-900 text-center"
                    role="status"
                  >
                    Bulandi event registration
                    <ChevronRight className="h-5 w-5 shrink-0 opacity-60" strokeWidth={2.75} aria-hidden />
                  </span>
                )}

                {bulandi2026Meta.scheduleUrl ? (
                  <a
                    href={bulandi2026Meta.scheduleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl border-[3px] border-violet-700 bg-white px-5 py-4 text-base sm:text-lg font-extrabold text-violet-900 no-underline shadow-md transition duration-200 hover:bg-violet-50 hover:border-fuchsia-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-100"
                  >
                    <Calendar className="h-5 w-5 shrink-0 text-fuchsia-600" strokeWidth={2.5} aria-hidden />
                    View schedule
                    <ChevronRight
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 text-violet-600"
                      strokeWidth={2.75}
                      aria-hidden
                    />
                  </a>
                ) : (
                  <span
                    className="flex flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border-[3px] border-dashed border-violet-400 bg-white/70 px-5 py-4 text-base sm:text-lg font-extrabold text-violet-800/80 text-center"
                    role="status"
                  >
                    <Calendar className="h-5 w-5 shrink-0 opacity-50" strokeWidth={2.5} aria-hidden />
                    View schedule
                  </span>
                )}
              </div>

              {!bulandi2026Meta.mainRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
                <p className="mt-3 text-center md:text-left text-sm font-semibold text-orange-800 max-w-2xl mx-auto md:mx-0">
                  Registration and schedule links will be shared here soon — follow SMYM updates.
                </p>
              )}
              {!bulandi2026Meta.mainRegistrationUrl && bulandi2026Meta.scheduleUrl && (
                <p className="mt-3 text-center md:text-left text-sm font-semibold text-orange-800 max-w-2xl mx-auto md:mx-0">
                  Registration link goes live here soon — follow SMYM updates.
                </p>
              )}
              {bulandi2026Meta.mainRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
                <p className="mt-3 text-center md:text-left text-sm font-semibold text-orange-800 max-w-2xl mx-auto md:mx-0">
                  Event schedule will be posted here soon.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mb-4 lg:mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Competitions &amp; activities</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl">
            Sixteen events in two age groups. Tap an event for <strong>Rules and regulations</strong>,{' '}
            <strong>Register</strong>, and <strong>View results</strong> (after the event). Each competition shows a{' '}
            <strong>gold–silver–bronze</strong> prize strip for 1st, 2nd, and 3rd.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-start">
          <section className="min-w-0 rounded-2xl border border-violet-100/80 bg-white/40 backdrop-blur-sm p-4 sm:p-5 lg:p-6">
            <header className="mb-4 lg:mb-5 pb-3 border-b border-violet-200/60">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" aria-hidden />
                Under 15 years
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 pl-0.5">Eight competitions</p>
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
      </div>

      {rulesEvent && <RulesModal event={rulesEvent} onClose={() => setRulesEvent(null)} />}
    </div>
  );
};

export default Bulandi2026Page;
