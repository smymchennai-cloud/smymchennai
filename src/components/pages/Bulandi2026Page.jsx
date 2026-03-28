import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
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
      setEventRegError('Enter a valid BR number (e.g. BR1511 or 1511).');
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
                  onClick={() => activateBulandiTab(tab.id)}
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
          <p className="w-full text-sm sm:text-base text-gray-600 mb-6 lg:mb-8">
            If you have registered for Bulandi, you can find your <strong>BR number</strong> in your registration
            confirmation email. Enter your BR number and <strong>date of birth</strong>, tap{' '}
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
                  BR number <span className="text-red-600">*</span>
                </label>
                <input
                  id="bulandi-event-reg-br"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. BR1511"
                  value={eventRegBr}
                  onChange={(e) => setEventRegBr(e.target.value)}
                  className="w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="bulandi-event-reg-dob" className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of birth <span className="text-red-600">*</span>
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
              <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {eventRegError}
              </p>
            )}
            {eventRegVerifyState === 'ok' && eventRegAgeBucket && (
              <p className="mb-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-start gap-2">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
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
                    className={`w-5 h-5 shrink-0 ${eventRegAgeBucket === 'under15' ? 'text-cyan-600' : 'text-purple-600'}`}
                    aria-hidden
                  />
                  <span>{eventRegAgeBucket === 'under15' ? 'Under 15 years' : '15 years and above'}</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      eventRegAgeBucket === 'under15'
                        ? 'text-cyan-900 bg-cyan-100'
                        : 'text-purple-900 bg-purple-100'
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
                  <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                    {eventRegSubmitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleEventChoiceSubmit}
                  disabled={eventRegSubmitting}
                  className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
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
