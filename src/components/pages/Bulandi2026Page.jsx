import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  FileDown,
  Handshake,
  Loader2,
  Trophy,
} from 'lucide-react';
import {
  bulandi2026Meta,
  bulandiGoldSponsors,
  bulandiPlatinumSponsors,
  bulandiTitleSponsor,
} from '../../data/bulandi2026Data';
import {
  fetchBulandiRegistrationTable,
  findMatchingRegistrationRow,
  isUnder15BrRange,
  parseBrNumeric,
  postBulandiEventRegistration,
  preselectedEventIdsFromRegistrationRow,
} from '../../utils/bulandiRegistrationSheet';
import { BulandiSelectableEventList } from '../bulandi/BulandiSelectableEventList';
import {
  BrConfirmationModal,
  EventRegistrationSuccessModal,
  RulesModal,
} from '../bulandi/BulandiModals';
import { BulandiRegistrationDrawer } from '../bulandi/BulandiRegistrationDrawer';
import {
  BULANDI_PAGE_TABS,
  BULANDI_VALID_TAB_IDS,
  eventsOver15,
  eventsUnder15,
  readBulandiTabFromHash,
} from '../bulandi/bulandiPageConstants';
import { SponsorPersonCard } from '../bulandi/SponsorPersonCard';

/** Premium glass “hero card” for main Bulandi + workshop registration tabs (shared layout). */
function RegistrationPromoShell({
  panelId,
  ariaLabelledBy,
  headingId,
  eyebrow,
  titlePrimary,
  titleAccent,
  children,
}) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      className="relative mb-10 lg:mb-12 scroll-mt-6"
    >
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br from-violet-500/35 via-fuchsia-400/28 to-purple-500/32 opacity-70 blur-2xl motion-safe:animate-bulandiAmbientDrift"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/50"
        aria-hidden
      />
      <section
        aria-labelledby={headingId}
        className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/85 via-white/60 to-violet-50/50 p-6 sm:p-8 lg:p-10 shadow-[0_28px_100px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[1.75rem]"
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-400/25 to-violet-300/22 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.32em] text-slate-500">
            {eyebrow}
          </p>
          <div className="mt-4 w-full text-center px-1">
            <h2
              id={headingId}
              className="text-[clamp(1.75rem,5vw,3.5rem)] font-black tracking-tight leading-[1.08]"
            >
              <span className="text-slate-900">{titlePrimary}</span>{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent bg-[length:200%_auto] motion-safe:animate-bulandiTitleGradient">
                {titleAccent}
              </span>
            </h2>
          </div>
          <div className="relative mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}

const Bulandi2026Page = () => {
  const [rulesEvent, setRulesEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(readBulandiTabFromHash);

  const activateBulandiTab = useCallback((tabId) => {
    if (!BULANDI_VALID_TAB_IDS.has(tabId)) return;
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}#${tabId}`);
    }
  }, []);
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [brConfirmNumber, setBrConfirmNumber] = useState(null);

  const [eventRegBr, setEventRegBr] = useState('');
  const [eventRegDob, setEventRegDob] = useState('');
  const [eventRegVerifyState, setEventRegVerifyState] = useState('idle');
  const [eventRegError, setEventRegError] = useState('');
  const [eventRegAgeBucket, setEventRegAgeBucket] = useState(null);
  const [eventRegSelectedIds, setEventRegSelectedIds] = useState(() => new Set());
  const [eventRegFromSheetIds, setEventRegFromSheetIds] = useState(() => new Set());
  const [eventRegSuccessModalOpen, setEventRegSuccessModalOpen] = useState(false);
  const [eventRegSubmitError, setEventRegSubmitError] = useState('');
  const [eventRegSubmitting, setEventRegSubmitting] = useState(false);
  const [eventRulebookDownloading, setEventRulebookDownloading] = useState(false);
  const eventRegVerifiedRef = useRef(false);

  useEffect(() => {
    if (!eventRegVerifiedRef.current) return;
    eventRegVerifiedRef.current = false;
    setEventRegVerifyState('idle');
    setEventRegAgeBucket(null);
    setEventRegSelectedIds(new Set());
    setEventRegFromSheetIds(new Set());
    setEventRegSuccessModalOpen(false);
    setEventRegSubmitError('');
    setEventRegSubmitting(false);
  }, [eventRegBr, eventRegDob]);

  useEffect(() => {
    const onHashChange = () => setActiveTab(readBulandiTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleEventRegVerify = async () => {
    setEventRegError('');
    const fetchUrl = (bulandi2026Meta.eventRegistrationSheetFetchUrl || '').trim();
    const sheetId = (bulandi2026Meta.eventRegistrationSpreadsheetId || '').trim();
    if (!fetchUrl && !sheetId) {
      setEventRegError(
        'Event registration is not configured: set eventRegistrationSheetFetchUrl (same as registration web app) in bulandi2026Data.js.'
      );
      setEventRegVerifyState('error');
      return;
    }
    if (!parseBrNumeric(eventRegBr)) {
      setEventRegError('Enter a valid B number (e.g. B1511, BR1511, or 1511).');
      setEventRegVerifyState('error');
      return;
    }
    if (!eventRegDob) {
      setEventRegError('Enter your date of birth.');
      setEventRegVerifyState('error');
      return;
    }
    setEventRegVerifyState('loading');
    try {
      const { headers, rows } = await fetchBulandiRegistrationTable(
        sheetId,
        bulandi2026Meta.eventRegistrationSheetGid,
        (bulandi2026Meta.eventRegistrationSheetFetchUrl || '').trim(),
        { skipCache: true }
      );
      const match = findMatchingRegistrationRow(rows, headers, eventRegBr, eventRegDob);
      const bucket = isUnder15BrRange(match.brNumeric) ? 'under15' : 'over15';
      const eligible = bucket === 'under15' ? eventsUnder15 : eventsOver15;
      const preIds = preselectedEventIdsFromRegistrationRow(match.row, headers, eligible);
      setEventRegAgeBucket(bucket);
      setEventRegFromSheetIds(new Set(preIds));
      setEventRegSelectedIds(new Set(preIds));
      setEventRegSuccessModalOpen(false);
      setEventRegSubmitError('');
      eventRegVerifiedRef.current = true;
      setEventRegVerifyState('ok');
    } catch (e) {
      let msg = e?.message || 'Could not verify.';
      if (e?.name === 'TypeError' || /failed to fetch|network|load failed/i.test(String(msg))) {
        msg =
          'Could not reach the Bulandi web app (often CORS). For production: Apps Script → Deploy → Web app → set “Who has access” to Anyone (including anonymous), then New version → Deploy. Open your /exec URL in a private window — it must not ask for Google sign-in. Local dev: use npm start (uses a dev-server proxy).';
      }
      setEventRegError(msg);
      setEventRegAgeBucket(null);
      setEventRegSelectedIds(new Set());
      setEventRegFromSheetIds(new Set());
      setEventRegSuccessModalOpen(false);
      setEventRegSubmitError('');
      setEventRegVerifyState('error');
    }
  };

  const handleEventChoiceSubmit = async () => {
    setEventRegSubmitError('');
    if (eventRegSelectedIds.size === 0) {
      setEventRegSubmitError('Please select at least one competition.');
      return;
    }
    const webAppUrl = (bulandi2026Meta.registrationWebAppUrl || '').trim();
    if (!webAppUrl) {
      setEventRegSubmitError(
        'Registration web app URL is not configured. Set registrationWebAppUrl in bulandi2026Data.js.'
      );
      return;
    }
    if (!eventRegAgeBucket) return;

    const eligible = eventRegAgeBucket === 'under15' ? eventsUnder15 : eventsOver15;
    const eligibleEventNames = eligible.map((e) => e.name);
    const selectedEventNames = eligible
      .filter((e) => eventRegSelectedIds.has(e.id))
      .map((e) => e.name);

    const payload = {
      action: 'eventRegistration',
      br: eventRegBr.trim(),
      dob: eventRegDob,
      eligibleEventNames,
      selectedEventNames,
    };
    const regSecret = (bulandi2026Meta.registrationSubmitSecret || '').trim();
    if (regSecret) {
      payload.secret = regSecret;
    }

    setEventRegSubmitting(true);
    setEventRegSuccessModalOpen(false);
    try {
      await postBulandiEventRegistration(webAppUrl, payload);
      setEventRegSuccessModalOpen(true);
      setEventRegFromSheetIds(new Set(eventRegSelectedIds));
    } catch (e) {
      let msg = e?.message || 'Could not save your choices.';
      if (e?.name === 'TypeError' || /failed to fetch|network|load failed/i.test(String(msg))) {
        msg =
          'Could not reach the Bulandi web app. Check deployment (“Anyone” access), URL in bulandi2026Data.js, and use npm start for local dev (proxy).';
      }
      setEventRegSubmitError(msg);
    } finally {
      setEventRegSubmitting(false);
    }
  };

  const handleDownloadEventRulebook = async () => {
    setEventRulebookDownloading(true);
    try {
      const mod = await import('../../utils/bulandiEventRulebookPdf');
      mod.downloadBulandiEventRulebookPdf();
    } catch (e) {
      console.error(e);
    } finally {
      setEventRulebookDownloading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden py-8 sm:py-10 px-4 sm:px-6 lg:px-10 pb-16">
      {/* Absolute (not fixed) + isolate keeps the layer painting behind content reliably */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: 'url(/bulandi-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/85 via-white/78 to-fuchsia-50/75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-violet-900 hover:text-violet-950 font-semibold mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </a>

        <header className="mb-8 lg:mb-10">
          <img
            src="/bulandi-header.png"
            alt="Bulandi 2026"
            className="w-full max-h-[min(280px,40vw)] sm:max-h-[min(320px,36vw)] lg:max-h-[380px] object-contain object-center mx-auto rounded-2xl shadow-xl shadow-violet-900/15 ring-2 ring-violet-300/70 bg-white/30"
            decoding="async"
          />
        </header>

        <nav
          className="mb-8 lg:mb-10 rounded-2xl border-2 border-violet-200/80 bg-white/55 backdrop-blur-sm p-2 sm:p-2.5 shadow-md shadow-violet-900/8"
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
                  onClick={() => activateBulandiTab(tab.id)}
                  className={`min-h-[48px] rounded-xl px-4 py-3 text-center text-sm sm:text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    selected
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/35'
                      : 'bg-white/80 text-violet-950 hover:bg-violet-50/90 border border-transparent hover:border-violet-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {activeTab === 'sponsors' && (
        <section
          id="sponsors"
          role="tabpanel"
          aria-labelledby="bulandi-tab-sponsors sponsors-heading"
          className="mb-10 lg:mb-12 rounded-2xl border-2 border-violet-200/90 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/78 p-5 sm:p-6 lg:p-8 shadow-lg shadow-violet-900/10 scroll-mt-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="w-9 h-9 text-violet-700 shrink-0" strokeWidth={2} aria-hidden />
            <h2 id="sponsors-heading" className="text-2xl lg:text-3xl font-bold text-gray-900">
              Sponsors
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
            Our partners make Bulandi possible. Title, platinum, and gold supporters are listed below — names and photos will be updated as they are confirmed.
          </p>

          <div className="space-y-12 lg:space-y-14">
            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-violet-900/85 mb-5">
                Title sponsor
              </h3>
              <SponsorPersonCard entry={bulandiTitleSponsor} size="title" />
            </div>

            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-violet-800/90 mb-5">
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
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-violet-900/78 mb-5">
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

        {activeTab === 'bulandi-registration' && (
        <RegistrationPromoShell
          panelId="bulandi-registration"
          ariaLabelledBy="bulandi-tab-bulandi-registration bulandi-registration-heading"
          headingId="bulandi-registration-heading"
          eyebrow="Official entry · Bulandi 2026"
          titlePrimary="Bulandi"
          titleAccent="Registration"
        >
          <div className="w-full text-left">
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
              Complete the{' '}
              <strong className="font-bold text-slate-900">main Bulandi 2026 registration</strong> first. It is{' '}
              <strong className="font-bold text-violet-700">required</strong> for anyone taking part in competitions or
              activities on this page. After that, use each event&apos;s{' '}
              <strong className="font-bold text-slate-900">Register</strong> link when it opens for that competition.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
              <button
                type="button"
                onClick={() => setRegistrationDrawerOpen(true)}
                className="group relative flex min-h-[52px] flex-1 min-w-[min(100%,14rem)] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-violet-600/35 ring-1 ring-white/25 transition duration-200 hover:brightness-[1.06] hover:shadow-xl hover:shadow-violet-600/45 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 sm:min-w-[12rem] sm:text-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <span className="relative">Bulandi registration</span>
                <ChevronRight
                  className="relative h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2.75}
                  aria-hidden
                />
              </button>

              <button
                type="button"
                onClick={handleDownloadEventRulebook}
                disabled={eventRulebookDownloading}
                className="group flex min-h-[52px] flex-1 min-w-[min(100%,14rem)] items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-4 text-center text-base font-bold text-slate-900 shadow-sm backdrop-blur-sm transition duration-200 hover:border-violet-300/80 hover:bg-white hover:shadow-md hover:shadow-violet-500/10 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:min-w-[12rem] sm:text-lg"
              >
                {eventRulebookDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-600" aria-hidden />
                    Preparing PDF…
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 shrink-0 text-violet-600" strokeWidth={2.5} aria-hidden />
                    Event rulebook (PDF)
                  </>
                )}
              </button>

              {bulandi2026Meta.scheduleUrl ? (
                <a
                  href={bulandi2026Meta.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-4 text-center text-base font-bold text-slate-900 no-underline shadow-sm backdrop-blur-sm transition duration-200 hover:border-violet-300/80 hover:bg-white hover:shadow-md hover:shadow-violet-500/10 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 sm:text-lg"
                >
                  View schedule
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-violet-600 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.75}
                    aria-hidden
                  />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-6 py-4 text-center text-base font-bold text-slate-500 sm:text-lg"
                  role="status"
                >
                  Schedule — coming soon
                </span>
              )}
            </div>

            {!bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  Event schedule will be posted here soon
                </span>{' '}
                — follow SMYM updates.
              </p>
            )}
          </div>
        </RegistrationPromoShell>
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
          <p className="w-full text-sm sm:text-base text-gray-600 mb-6 lg:mb-8">
            If you have registered for Bulandi, you can find your <strong>B number</strong> (Bulandi registration ID)
            in your registration confirmation email. Enter your B number and <strong>date of birth</strong>, tap{' '}
            <strong>Validate details</strong>, then pick competitions and <strong>Submit</strong>. Use{' '}
            <strong>Rules and regulations</strong> on a row for that event’s full rules.
          </p>

          <div className="mb-8 lg:mb-10 rounded-2xl border-2 border-violet-200/80 bg-white/70 backdrop-blur-sm p-4 sm:p-5 shadow-md">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex flex-wrap items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-violet-600 shrink-0" aria-hidden />
              Your details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
              <div>
                <label htmlFor="bulandi-event-reg-br" className="block text-xs font-semibold text-gray-700 mb-1">
                  B number <span className="text-violet-600">*</span>
                </label>
                <input
                  id="bulandi-event-reg-br"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. B1511"
                  value={eventRegBr}
                  onChange={(e) => setEventRegBr(e.target.value)}
                  className="w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="bulandi-event-reg-dob" className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of birth <span className="text-violet-600">*</span>
                </label>
                <input
                  id="bulandi-event-reg-dob"
                  type="date"
                  value={eventRegDob}
                  onChange={(e) => setEventRegDob(e.target.value)}
                  className="w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>
            {eventRegError && (
              <p className="mb-3 text-sm text-fuchsia-950 bg-fuchsia-50 border border-fuchsia-200 rounded-lg px-3 py-2" role="alert">
                {eventRegError}
              </p>
            )}
            {eventRegVerifyState === 'ok' && eventRegAgeBucket && (
              <p className="mb-3 text-sm text-violet-950 bg-violet-100 border border-violet-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  Details validated. Competitions you already signed up for are pre-selected. Adjust your choices
                  below, then submit.
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={handleEventRegVerify}
              disabled={eventRegVerifyState === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-600/25 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {eventRegVerifyState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                  Validating your details…
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden />
                  Validate details
                </>
              )}
            </button>
          </div>

          {eventRegVerifyState === 'ok' && eventRegAgeBucket ? (
            <section className="w-full min-w-0 rounded-2xl border-2 border-violet-200/80 bg-white/70 backdrop-blur-sm p-4 sm:p-5 shadow-md z-[1]">
              <header className="mb-3 pb-3 border-b border-violet-200/60">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex flex-wrap items-center gap-2">
                  <Trophy
                    className={`w-5 h-5 shrink-0 ${eventRegAgeBucket === 'under15' ? 'text-fuchsia-600' : 'text-purple-600'}`}
                    aria-hidden
                  />
                  <span>{eventRegAgeBucket === 'under15' ? 'Under 15 years' : '15 years and above'}</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      eventRegAgeBucket === 'under15'
                        ? 'text-fuchsia-950 bg-fuchsia-100'
                        : 'text-purple-950 bg-purple-100'
                    }`}
                  >
                    Your competitions
                  </span>
                </h3>
                {eventRegAgeBucket === 'under15' ? (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    For participants who are{' '}
                    <strong className="font-semibold text-gray-800">over five years of age</strong> and{' '}
                    <strong className="font-semibold text-gray-800">under fifteen years of age</strong>, as on the
                    official Bulandi 2026 age reference date. <span className="text-gray-500">Eight competitions.</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Nine competitions</p>
                )}
              </header>
              <BulandiSelectableEventList
                events={eventRegAgeBucket === 'under15' ? eventsUnder15 : eventsOver15}
                eventRegSelectedIds={eventRegSelectedIds}
                setEventRegSelectedIds={setEventRegSelectedIds}
                eventRegFromSheetIds={eventRegFromSheetIds}
                setRulesEvent={setRulesEvent}
                setEventRegSuccessModalOpen={setEventRegSuccessModalOpen}
              />
              <div className="mt-6 pt-5 border-t border-violet-200/80">
                {eventRegSubmitError && (
                  <p className="mb-3 text-sm text-fuchsia-950 bg-fuchsia-50 border border-fuchsia-200 rounded-lg px-3 py-2" role="alert">
                    {eventRegSubmitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleEventChoiceSubmit}
                  disabled={eventRegSubmitting}
                  className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-600/25 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {eventRegSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </section>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-violet-200/90 bg-violet-50/40 px-4 py-8 sm:px-6 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter your details above and tap <strong className="font-semibold text-gray-800">Validate details</strong>{' '}
                to choose competitions.
              </p>
            </div>
          )}
        </section>
        )}

        {activeTab === 'workshop-registration' && (
        <RegistrationPromoShell
          panelId="workshop-registration"
          ariaLabelledBy="bulandi-tab-workshop-registration workshop-registration-heading"
          headingId="workshop-registration-heading"
          eyebrow="Workshops · Add-on registration"
          titlePrimary="Workshop"
          titleAccent="Registration"
        >
          <div className="w-full text-left">
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
              Complete the <strong className="font-bold text-slate-900">main Bulandi 2026 registration</strong> first.
              It is <strong className="font-bold text-violet-700">required</strong> for anyone attending Bulandi
              workshops. After that, use <strong className="font-bold text-slate-900">Workshop registration</strong>{' '}
              when it opens for the session you want to join.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
              {bulandi2026Meta.workshopRegistrationUrl ? (
                <a
                  href={bulandi2026Meta.workshopRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 text-center text-base font-extrabold text-white no-underline shadow-lg shadow-violet-600/35 ring-1 ring-white/25 transition duration-200 hover:brightness-[1.06] hover:shadow-xl hover:shadow-violet-600/45 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 sm:text-lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <span className="relative">Register for workshops</span>
                  <ChevronRight
                    className="relative h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.75}
                    aria-hidden
                  />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/90 px-6 py-4 text-center text-base font-bold text-slate-500 sm:text-lg"
                  role="status"
                >
                  Workshop link — opening soon
                  <ChevronRight className="h-5 w-5 shrink-0 opacity-40" strokeWidth={2.75} aria-hidden />
                </span>
              )}

              {bulandi2026Meta.scheduleUrl ? (
                <a
                  href={bulandi2026Meta.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-4 text-center text-base font-bold text-slate-900 no-underline shadow-sm backdrop-blur-sm transition duration-200 hover:border-violet-300/80 hover:bg-white hover:shadow-md hover:shadow-violet-500/10 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 sm:text-lg"
                >
                  View schedule
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-violet-600 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.75}
                    aria-hidden
                  />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-6 py-4 text-center text-base font-bold text-slate-500 sm:text-lg"
                  role="status"
                >
                  Schedule — coming soon
                </span>
              )}
            </div>

            {!bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  Workshop registration and schedule links
                </span>{' '}
                will appear here soon — follow SMYM updates.
              </p>
            )}
            {!bulandi2026Meta.workshopRegistrationUrl && bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  Workshop registration opens soon
                </span>{' '}
                — schedule is available above.
              </p>
            )}
            {bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold text-slate-600 sm:text-base">
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  Full event schedule
                </span>{' '}
                will be posted here soon.
              </p>
            )}
          </div>
        </RegistrationPromoShell>
        )}
      </div>

      {rulesEvent && <RulesModal event={rulesEvent} onClose={() => setRulesEvent(null)} />}
      {eventRegSuccessModalOpen && (
        <EventRegistrationSuccessModal onClose={() => setEventRegSuccessModalOpen(false)} />
      )}

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
