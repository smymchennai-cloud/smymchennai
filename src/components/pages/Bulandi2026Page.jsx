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
      className="mb-10 lg:mb-12 scroll-mt-6"
    >
      <section
        aria-labelledby={headingId}
        className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500 shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10"
      >
        <p className="text-center text-xs font-bold uppercase tracking-widest text-purple-600 mb-4">
          {eyebrow}
        </p>
        <h2
          id={headingId}
          className="text-center text-3xl sm:text-4xl font-bold text-gray-800 mb-8"
        >
          {titlePrimary}{' '}
          <span className="text-purple-700">{titleAccent}</span>
        </h2>
        {children}
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
          'Could not reach the Bulandi web app (often CORS). For production: Apps Script → Deploy → Web app → set "Who has access" to Anyone (including anonymous), then New version → Deploy. Open your /exec URL in a private window — it must not ask for Google sign-in. Local dev: use npm start (uses a dev-server proxy).';
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
          'Could not reach the Bulandi web app. Check deployment ("Anyone" access), URL in bulandi2026Data.js, and use npm start for local dev (proxy).';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 sm:py-10 px-4 sm:px-6 lg:px-10 pb-16">
      <div className="max-w-7xl mx-auto w-full">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </a>

        <header className="mb-8 lg:mb-10">
          <img
            src="/bulandi-header.png"
            alt="Bulandi 2026"
            className="w-full max-h-[min(280px,40vw)] sm:max-h-[min(320px,36vw)] lg:max-h-[380px] object-contain object-center mx-auto rounded-xl shadow-lg"
            decoding="async"
          />
        </header>

        <nav
          className="mb-8 lg:mb-10 rounded-xl border border-purple-200 bg-white p-2 sm:p-2.5 shadow-md"
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
                  className={`min-h-[48px] rounded-lg px-4 py-3 text-center text-sm sm:text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                    selected
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg'
                      : 'bg-white text-purple-900 hover:bg-purple-50 border border-transparent hover:border-purple-200'
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
          className="mb-10 lg:mb-12 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500 p-5 sm:p-6 lg:p-8 shadow-lg scroll-mt-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="w-9 h-9 text-purple-700 shrink-0" strokeWidth={2} aria-hidden />
            <h2 id="sponsors-heading" className="text-2xl lg:text-3xl font-bold text-gray-800">
              Sponsors
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
            Our partners make Bulandi possible. Title, platinum, and gold supporters are listed below — names and photos will be updated as they are confirmed.
          </p>

          <div className="space-y-12 lg:space-y-14">
            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-800 mb-5">
                Title sponsor
              </h3>
              <SponsorPersonCard entry={bulandiTitleSponsor} size="title" />
            </div>

            <div>
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-700 mb-5">
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
              <h3 className="text-center text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-800 mb-5">
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
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
              Complete the{' '}
              <strong className="font-bold text-gray-900">main Bulandi 2026 registration</strong> first. It is{' '}
              <strong className="font-bold text-purple-700">required</strong> for anyone taking part in competitions or
              activities on this page. After that, use each event&apos;s{' '}
              <strong className="font-bold text-gray-900">Register</strong> link when it opens for that competition.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
              <button
                type="button"
                onClick={() => setRegistrationDrawerOpen(true)}
                className="flex min-h-[52px] flex-1 min-w-[min(100%,14rem)] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 text-center text-base font-extrabold text-white shadow-md hover:brightness-105 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:min-w-[12rem] sm:text-lg"
              >
                <span>Bulandi registration</span>
                <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2.75} aria-hidden />
              </button>

              <button
                type="button"
                onClick={handleDownloadEventRulebook}
                disabled={eventRulebookDownloading}
                className="flex min-h-[52px] flex-1 min-w-[min(100%,14rem)] items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-6 py-4 text-center text-base font-bold text-gray-800 shadow-sm hover:bg-purple-50 hover:border-purple-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:min-w-[12rem] sm:text-lg"
              >
                {eventRulebookDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-purple-600" aria-hidden />
                    Preparing PDF…
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 shrink-0 text-purple-600" strokeWidth={2.5} aria-hidden />
                    Event rulebook (PDF)
                  </>
                )}
              </button>

              {bulandi2026Meta.scheduleUrl ? (
                <a
                  href={bulandi2026Meta.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-6 py-4 text-center text-base font-bold text-gray-800 no-underline shadow-sm hover:bg-purple-50 hover:border-purple-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:text-lg"
                >
                  View schedule
                  <ChevronRight className="h-5 w-5 shrink-0 text-purple-600" strokeWidth={2.75} aria-hidden />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-center text-base font-bold text-gray-400 sm:text-lg"
                  role="status"
                >
                  Schedule — coming soon
                </span>
              )}
            </div>

            {!bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
                <span className="text-purple-700">
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
          <h2 id="event-registration-heading" className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Event Registration
          </h2>
          <p className="w-full text-sm sm:text-base text-gray-600 mb-6 lg:mb-8">
            If you have registered for Bulandi, you can find your <strong>B number</strong> (Bulandi registration ID)
            in your registration confirmation email. Enter your B number and <strong>date of birth</strong>, tap{' '}
            <strong>Validate details</strong>, then pick competitions and <strong>Submit</strong>. Use{' '}
            <strong>Rules and regulations</strong> on a row for that event's full rules.
          </p>

          <div className="mb-8 lg:mb-10 rounded-xl border border-purple-200 bg-white p-4 sm:p-5 shadow-md">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex flex-wrap items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-purple-600 shrink-0" aria-hidden />
              Your details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
              <div>
                <label htmlFor="bulandi-event-reg-br" className="block text-xs font-semibold text-gray-700 mb-1">
                  B number <span className="text-purple-600">*</span>
                </label>
                <input
                  id="bulandi-event-reg-br"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. B1511"
                  value={eventRegBr}
                  onChange={(e) => setEventRegBr(e.target.value)}
                  className="w-full rounded-lg border border-purple-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label htmlFor="bulandi-event-reg-dob" className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of birth <span className="text-purple-600">*</span>
                </label>
                <input
                  id="bulandi-event-reg-dob"
                  type="date"
                  value={eventRegDob}
                  onChange={(e) => setEventRegDob(e.target.value)}
                  className="w-full rounded-lg border border-purple-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
            {eventRegError && (
              <p className="mb-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {eventRegError}
              </p>
            )}
            {eventRegVerifyState === 'ok' && eventRegAgeBucket && (
              <p className="mb-3 text-sm text-purple-900 bg-purple-100 border border-purple-200 rounded-lg px-3 py-2 flex items-start gap-2">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
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
            <section className="w-full min-w-0 rounded-xl border border-purple-200 bg-white p-4 sm:p-5 shadow-md">
              <header className="mb-3 pb-3 border-b border-purple-200">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex flex-wrap items-center gap-2">
                  <Trophy
                    className={`w-5 h-5 shrink-0 ${eventRegAgeBucket === 'under15' ? 'text-fuchsia-600' : 'text-purple-600'}`}
                    aria-hidden
                  />
                  <span>{eventRegAgeBucket === 'under15' ? 'Under 15 years' : '15 years and above'}</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      eventRegAgeBucket === 'under15'
                        ? 'text-fuchsia-900 bg-fuchsia-100'
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
              <div className="mt-6 pt-5 border-t border-purple-200">
                {eventRegSubmitError && (
                  <p className="mb-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                    {eventRegSubmitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleEventChoiceSubmit}
                  disabled={eventRegSubmitting}
                  className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
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
            <div className="w-full rounded-xl border border-dashed border-purple-200 bg-purple-50/40 px-4 py-8 sm:px-6 text-center">
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
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
              Complete the <strong className="font-bold text-gray-900">main Bulandi 2026 registration</strong> first.
              It is <strong className="font-bold text-purple-700">required</strong> for anyone attending Bulandi
              workshops. After that, use <strong className="font-bold text-gray-900">Workshop registration</strong>{' '}
              when it opens for the session you want to join.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
              {bulandi2026Meta.workshopRegistrationUrl ? (
                <a
                  href={bulandi2026Meta.workshopRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 text-center text-base font-extrabold text-white no-underline shadow-md hover:brightness-105 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:text-lg"
                >
                  <span>Register for workshops</span>
                  <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2.75} aria-hidden />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-center text-base font-bold text-gray-400 sm:text-lg"
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
                  className="flex min-h-[52px] flex-1 min-w-0 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-6 py-4 text-center text-base font-bold text-gray-800 no-underline shadow-sm hover:bg-purple-50 hover:border-purple-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:text-lg"
                >
                  View schedule
                  <ChevronRight className="h-5 w-5 shrink-0 text-purple-600" strokeWidth={2.75} aria-hidden />
                </a>
              ) : (
                <span
                  className="flex min-h-[52px] flex-1 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-center text-base font-bold text-gray-400 sm:text-lg"
                  role="status"
                >
                  Schedule — coming soon
                </span>
              )}
            </div>

            {!bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
                <span className="text-purple-700">
                  Workshop registration and schedule links
                </span>{' '}
                will appear here soon — follow SMYM updates.
              </p>
            )}
            {!bulandi2026Meta.workshopRegistrationUrl && bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
                <span className="text-purple-700">
                  Workshop registration opens soon
                </span>{' '}
                — schedule is available above.
              </p>
            )}
            {bulandi2026Meta.workshopRegistrationUrl && !bulandi2026Meta.scheduleUrl && (
              <p className="mt-5 text-sm font-semibold text-gray-600 sm:text-base">
                <span className="text-purple-700">
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
