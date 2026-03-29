import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ClipboardList, Loader2, Mic2, Theater } from 'lucide-react';
import {
  bulandi2026Meta,
  BULANDI_2026_PATH,
  BULANDI_2026_ADMIN_HASH_TO_TAB,
  BULANDI_2026_ADMIN_LINKS,
} from '../../data/bulandi2026Data';
import {
  fetchBulandiRegistrationTable,
  findMatchingRegistrationRow,
  isUnder15BrRange,
  parseBrNumeric,
  postBulandiWebApp,
} from '../../utils/bulandiRegistrationSheet';
import { eventsOver15, eventsUnder15 } from '../bulandi/bulandiPageConstants';

const TABS = [
  {
    id: 'desk',
    label: 'Registration desk',
    icon: ClipboardList,
    link: BULANDI_2026_ADMIN_LINKS.registrationDesk,
    hint: '',
  },
  {
    id: 'backstage',
    label: 'Back stage check-in',
    icon: Theater,
    link: BULANDI_2026_ADMIN_LINKS.backStage,
    hint: '',
  },
  {
    id: 'onstage',
    label: 'On stage check-in',
    icon: Mic2,
    link: BULANDI_2026_ADMIN_LINKS.onStage,
    hint: '',
  },
];

function readBulandiAdminTabFromHash() {
  if (typeof window === 'undefined') return 'desk';
  const raw = window.location.hash.replace(/^#/, '').trim();
  return BULANDI_2026_ADMIN_HASH_TO_TAB[raw] || 'desk';
}

/** B 1500–2999 → under-15 list; B 3000+ → 15+ list (numeric part; matches registration rules). */
function eventsEligibleForBr(brInput) {
  const n = parseBrNumeric(brInput);
  if (n == null) return [];
  if (isUnder15BrRange(n)) return eventsUnder15;
  if (n >= 3000) return eventsOver15;
  return [];
}

function brBucketLabel(brInput) {
  const n = parseBrNumeric(brInput);
  if (n == null) return null;
  if (isUnder15BrRange(n)) return 'Under 15 (B 1500–2999)';
  if (n >= 3000) return '15 years and above (B 3000+)';
  return 'B number must be in range 1500+ (under 15: 1500–2999, 15+: 3000+)';
}

function buildAdminBody(action, rest) {
  const secret = (bulandi2026Meta.registrationSubmitSecret || '').trim();
  return { action, ...rest, ...(secret ? { secret } : {}) };
}

export default function Bulandi2026AdminPage() {
  const [activeTab, setActiveTab] = useState(() => readBulandiAdminTabFromHash());

  useEffect(() => {
    const onHashChange = () => setActiveTab(readBulandiAdminTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const webAppUrl = useMemo(() => (bulandi2026Meta.registrationWebAppUrl || '').trim(), []);
  const sheetId = (bulandi2026Meta.eventRegistrationSpreadsheetId || '').trim();
  const fetchUrl = (bulandi2026Meta.eventRegistrationSheetFetchUrl || '').trim();

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-8 sm:py-10 px-4 sm:px-6 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,#a78bfa_0%,transparent_45%),radial-gradient(circle_at_70%_80%,#f472b6_0%,transparent_40%)]" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <a
          href={BULANDI_2026_PATH}
          className="inline-flex items-center gap-2 text-violet-200 hover:text-white font-semibold mb-6"
        >
          <ArrowLeft size={18} />
          Bulandi 2026
        </a>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Bulandi 2026 — check-in
          </h1>
          <p className="mt-2 text-sm text-violet-200/90 leading-snug">
            Venue volunteers: enter B number and DOB as on registration. Updates go to the Bulandi Google Sheet.
          </p>
        </header>
        <nav
          className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3"
          aria-label="Admin sections"
        >
          {TABS.map(({ id, label, icon: Icon, link }) => {
            const on = activeTab === id;
            return (
              <a
                key={id}
                href={link}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 no-underline ${
                  on
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                    : 'bg-white/10 text-violet-100 hover:bg-white/15 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                {label}
              </a>
            );
          })}
        </nav>

        {(TABS.find((t) => t.id === activeTab)?.hint || '').trim() ? (
          <p className="mb-6 text-xs text-violet-300/80">{TABS.find((t) => t.id === activeTab)?.hint}</p>
        ) : null}

        {!webAppUrl || (!fetchUrl && !sheetId) ? (
          <p className="rounded-xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            Configure <code className="text-amber-50">registrationWebAppUrl</code> and sheet fetch settings in{' '}
            <code className="text-amber-50">bulandi2026Data.js</code> / <code className="text-amber-50">bulandiWebApp.json</code>.
          </p>
        ) : null}

        {activeTab === 'desk' && (
          <RegistrationDeskPanel webAppUrl={webAppUrl} sheetId={sheetId} fetchUrl={fetchUrl} />
        )}
        {activeTab === 'backstage' && (
          <EventCheckInPanel
            webAppUrl={webAppUrl}
            sheetId={sheetId}
            fetchUrl={fetchUrl}
            action="adminBackstageCheckIn"
            title="Back stage check-in"
            description=""
            eligibleListKind="backstage"
          />
        )}
        {activeTab === 'onstage' && (
          <EventCheckInPanel
            webAppUrl={webAppUrl}
            sheetId={sheetId}
            fetchUrl={fetchUrl}
            action="adminOnStageCheckIn"
            title="On stage check-in"
            description=""
            eligibleListKind="onstage"
          />
        )}
      </div>
    </div>
  );
}

function RegistrationDeskPanel({ webAppUrl, sheetId, fetchUrl }) {
  const [br, setBr] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = useCallback(async () => {
    setMsg({ type: '', text: '' });
    const brClean = br.trim().replace(/-/g, '');
    if (!parseBrNumeric(brClean)) {
      setMsg({ type: 'err', text: 'Enter a valid B number (e.g. B1511 or BR1511).' });
      return;
    }
    if (!dob) {
      setMsg({ type: 'err', text: 'Enter date of birth.' });
      return;
    }
    setLoading(true);
    try {
      const data = await postBulandiWebApp(
        webAppUrl,
        buildAdminBody('adminRegistrationDeskCheckIn', {
          br: brClean,
          dob: dob.replace(/-/g, ''),
        })
      );
      const col = data.column ? ` Column: ${data.column}.` : '';
      setMsg({
        type: 'ok',
        text: `Checked in at ${data.checkedInAt || 'recorded time'}.${col}`,
      });
    } catch (e) {
      setMsg({ type: 'err', text: e?.message || 'Check-in failed.' });
    } finally {
      setLoading(false);
    }
  }, [br, dob, webAppUrl]);

  return (
    <section
      className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5 sm:p-6 shadow-xl"
      aria-labelledby="desk-heading"
    >
      <h2 id="desk-heading" className="text-lg font-bold text-white mb-2">
        Registration desk
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="admin-desk-br" className="block text-xs font-semibold text-violet-200 mb-1">
            B number
          </label>
          <input
            id="admin-desk-br"
            type="text"
            autoComplete="off"
            placeholder="e.g. B1511"
            value={br}
            onChange={(e) => setBr(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-violet-400/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <div>
          <label htmlFor="admin-desk-dob" className="block text-xs font-semibold text-violet-200 mb-1">
            Date of birth
          </label>
          <input
            id="admin-desk-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
      </div>
      {msg.text ? (
        <p
          className={`mb-4 text-sm rounded-lg px-3 py-2 ${
            msg.type === 'ok' ? 'bg-emerald-950/60 text-emerald-100 border border-emerald-500/30' : 'bg-red-950/50 text-red-100 border border-red-500/30'
          }`}
          role={msg.type === 'err' ? 'alert' : 'status'}
        >
          {msg.text}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full sm:w-auto min-h-[48px] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Checking in…
          </span>
        ) : (
          'Check-in'
        )}
      </button>
    </section>
  );
}

/** @typedef {{ participants: object[], deskColumn?: string, backstageGateColumn?: string, stageColumn?: string, note?: string, error?: string }} EventBundle */

function EventCheckInPanel({ webAppUrl, sheetId, fetchUrl, action, title, description, eligibleListKind }) {
  const [br, setBr] = useState('');
  const [dob, setDob] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [selectedEventNames, setSelectedEventNames] = useState(() => new Set());
  const [listSearch, setListSearch] = useState('');
  const [eventBundles, setEventBundles] = useState(() => /** @type {Record<string, EventBundle>} */ ({}));
  const [listLoading, setListLoading] = useState(false);
  const [listErr, setListErr] = useState('');
  const [rowCheckInKey, setRowCheckInKey] = useState('');
  const [listRowMsg, setListRowMsg] = useState({ type: '', text: '' });

  const isBackstageEligible = eligibleListKind === 'backstage';
  const listEligibleAction = isBackstageEligible ? 'adminBackstageEligibleLists' : 'adminOnStageEligibleLists';
  const rowCheckInAction = isBackstageEligible ? 'adminBackstageRowCheckIn' : 'adminOnStageRowCheckIn';

  const bucketEvents = useMemo(() => eventsEligibleForBr(br), [br]);
  const bucketHint = useMemo(() => brBucketLabel(br), [br]);

  const eventsUnder15Sorted = useMemo(
    () => [...eventsUnder15].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const eventsOver15Sorted = useMemo(
    () => [...eventsOver15].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  /** Event names from the last successful “Load participant lists”. */
  const [loadedEventNames, setLoadedEventNames] = useState([]);

  const loadedUnder15Events = useMemo(() => {
    const set = new Set(loadedEventNames);
    return eventsUnder15Sorted.filter((ev) => set.has(ev.name));
  }, [eventsUnder15Sorted, loadedEventNames]);

  const loadedOver15Events = useMemo(() => {
    const set = new Set(loadedEventNames);
    return eventsOver15Sorted.filter((ev) => set.has(ev.name));
  }, [eventsOver15Sorted, loadedEventNames]);

  const selectionMatchesLoaded = useMemo(() => {
    if (selectedEventNames.size !== loadedEventNames.length) return false;
    for (const n of loadedEventNames) {
      if (!selectedEventNames.has(n)) return false;
    }
    return true;
  }, [selectedEventNames, loadedEventNames]);

  const filterParticipants = useCallback((rows) => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) =>
      [p.br, p.whatsappNo, p.phoneAlternate, p.dob].some((x) => String(x ?? '').toLowerCase().includes(q))
    );
  }, [listSearch]);

  const rowCheckInKeyFor = (p, eventName) =>
    `${String(eventName || '')}|${String(p.br || '')}|${String(p.dob || '')}`;

  const onRowDailyStageCheckIn = useCallback(
    async (p, eventName) => {
      if (!eventName) return;
      const dobIso = String(p.dob || '').trim();
      if (!dobIso || !/^\d{4}-\d{2}-\d{2}$/.test(dobIso)) {
        setListRowMsg({ type: 'err', text: 'This row has no valid DOB on the sheet.' });
        return;
      }
      const key = rowCheckInKeyFor(p, eventName);
      setListRowMsg({ type: '', text: '' });
      setRowCheckInKey(key);
      try {
        const data = await postBulandiWebApp(
          webAppUrl,
          buildAdminBody(rowCheckInAction, {
            br: String(p.br || '').trim(),
            dob: dobIso,
            eventName,
          })
        );
        const at = data.checkedInAt ? String(data.checkedInAt) : '';
        const patchField = isBackstageEligible ? 'backstageCheckedInAt' : 'onStageCheckedInAt';
        setEventBundles((prev) => {
          const bundle = prev[eventName];
          if (!bundle?.participants) return prev;
          const innerKey = `${String(p.br || '')}|${String(p.dob || '')}`;
          return {
            ...prev,
            [eventName]: {
              ...bundle,
              participants: bundle.participants.map((r) =>
                `${String(r.br || '')}|${String(r.dob || '')}` === innerKey ? { ...r, [patchField]: at } : r
              ),
            },
          };
        });
        setListRowMsg({
          type: 'ok',
          text: `Checked in ${p.br || 'participant'} (${eventName})${at ? ` at ${at}` : ''}.`,
        });
      } catch (e) {
        setListRowMsg({ type: 'err', text: e?.message || 'Check-in failed.' });
      } finally {
        setRowCheckInKey('');
      }
    },
    [webAppUrl, rowCheckInAction, isBackstageEligible]
  );

  const toggleListEvent = useCallback((name) => {
    setListRowMsg({ type: '', text: '' });
    setSelectedEventNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const loadParticipantLists = useCallback(async () => {
    const names = [...selectedEventNames].sort((a, b) => a.localeCompare(b));
    setListRowMsg({ type: '', text: '' });
    if (names.length === 0) {
      setListErr('Select at least one event, then tap “Load participant lists”.');
      setEventBundles({});
      setLoadedEventNames([]);
      return;
    }
    setListLoading(true);
    setListErr('');
    setEventBundles({});
    setLoadedEventNames([]);
    try {
      const data = await postBulandiWebApp(
        webAppUrl,
        buildAdminBody(listEligibleAction, { eventNames: names })
      );
      const byEvent = data.byEvent && typeof data.byEvent === 'object' ? data.byEvent : {};
      const next = /** @type {Record<string, EventBundle>} */ ({});
      const failures = [];
      for (const eventName of names) {
        const slice = byEvent[eventName];
        if (!slice) {
          const err = 'No data returned for this event.';
          failures.push(`${eventName}: ${err}`);
          next[eventName] = { participants: [], error: err };
          continue;
        }
        if (slice.error) {
          failures.push(`${eventName}: ${slice.error}`);
          next[eventName] = { participants: [], error: String(slice.error) };
          continue;
        }
        const participants = Array.isArray(slice.participants) ? slice.participants : [];
        if (isBackstageEligible) {
          next[eventName] = {
            participants,
            deskColumn: data.deskColumn || '',
            stageColumn: data.backstageColumn || '',
            note: slice.note || '',
          };
        } else {
          next[eventName] = {
            participants,
            backstageGateColumn: data.backstageColumn || '',
            stageColumn: data.onStageColumn || '',
            note: slice.note || '',
          };
        }
      }
      setEventBundles(next);
      setLoadedEventNames(names);
      if (failures.length === names.length) {
        setListErr(failures.join(' '));
      } else {
        setListErr('');
      }
    } catch (e) {
      setEventBundles({});
      setLoadedEventNames([]);
      setListErr(e?.message || 'Could not load lists.');
    } finally {
      setListLoading(false);
    }
  }, [selectedEventNames, webAppUrl, listEligibleAction, isBackstageEligible]);

  useEffect(() => {
    const allowed = new Set(bucketEvents.map((e) => e.id));
    setSelectedIds((prev) => new Set([...prev].filter((id) => allowed.has(id))));
  }, [bucketEvents]);

  const verify = useCallback(async () => {
    setMsg({ type: '', text: '' });

    if (!parseBrNumeric(br)) {
      setMsg({ type: 'err', text: 'Enter a valid B number.' });
      return;
    }
    if (!dob) {
      setMsg({ type: 'err', text: 'Enter date of birth.' });
      return;
    }

    setVerifyLoading(true);
    try {
      const { headers: h, rows } = await fetchBulandiRegistrationTable(
        sheetId,
        bulandi2026Meta.eventRegistrationSheetGid,
        fetchUrl,
        { skipCache: true }
      );
      findMatchingRegistrationRow(rows, h, br, dob);
      setMsg({ type: 'ok', text: 'B number and DOB match the sheet.' });
    } catch (e) {
      setMsg({ type: 'err', text: e?.message || 'Could not verify.' });
    } finally {
      setVerifyLoading(false);
    }
  }, [br, dob, sheetId, fetchUrl]);

  const checkIn = useCallback(async () => {
    const picked = bucketEvents.filter((e) => selectedIds.has(e.id)).map((e) => e.name);
    if (picked.length === 0) {
      setMsg({ type: 'err', text: 'Select at least one event.' });
      return;
    }
    setCheckLoading(true);
    try {
      const data = await postBulandiWebApp(
        webAppUrl,
        buildAdminBody(action, { br: br.trim(), dob, eventNames: picked })
      );
      const at = data.checkedInAt ? ` at ${data.checkedInAt}` : '';
      setMsg({
        type: 'ok',
        text: `Checked in${at}: ${(data.updated || picked).join(', ')}.`,
      });
    } catch (e) {
      setMsg({ type: 'err', text: e?.message || 'Check-in failed.' });
    } finally {
      setCheckLoading(false);
    }
  }, [action, br, dob, bucketEvents, selectedIds, webAppUrl]);

  function renderEventPickRow(ev) {
    const on = selectedEventNames.has(ev.name);
    return (
      <li key={ev.id}>
        <button
          type="button"
          onClick={() => toggleListEvent(ev.name)}
          aria-pressed={on}
          className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
            on
              ? 'border-emerald-400/50 bg-emerald-950/35 text-white'
              : 'border-white/15 bg-white/5 text-violet-100 hover:bg-white/10'
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 ${
              on ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100' : 'border-white/25 bg-slate-900/60 text-transparent'
            }`}
            aria-hidden
          >
            <Check className="w-4 h-4" strokeWidth={2.75} />
          </span>
          <span className="font-medium leading-snug">{ev.name}</span>
        </button>
      </li>
    );
  }

  function renderLoadedEventCard(ev) {
    const bundle = eventBundles[ev.name];
    if (!bundle) return null;
    const filteredRows = filterParticipants(bundle.participants);
    return (
      <div key={ev.id} className="rounded-xl border border-white/15 bg-slate-900/25 overflow-hidden">
        <div className="border-b border-white/10 bg-white/5 px-3 py-2.5 sm:px-4">
          <h3 className="text-sm font-bold text-white">{ev.name}</h3>
          <p className="text-[11px] text-violet-300/90 mt-0.5">
            {bundle.error
              ? bundle.error
              : `${bundle.participants.length} eligible${listSearch.trim() ? ` · ${filteredRows.length} match search` : ''}`}
          </p>
          {!bundle.error && bundle.note ? (
            <p className="text-xs text-amber-200/95 mt-2 rounded-lg border border-amber-500/30 bg-amber-950/35 px-2.5 py-1.5">
              {bundle.note}
            </p>
          ) : null}
        </div>
        {bundle.error ? null : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/60 text-violet-200">
                  <th className="px-3 py-2 font-semibold">B number</th>
                  <th className="px-3 py-2 font-semibold">WhatsApp</th>
                  <th className="px-3 py-2 font-semibold">Phone alternate</th>
                  <th className="px-3 py-2 font-semibold min-w-[7rem]">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-violet-300/80 text-center">
                      No rows match
                      {listSearch.trim() ? ' this search' : ' (or none eligible for this event today).'}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => {
                    const rk = rowCheckInKeyFor(row, ev.name);
                    const busy = rowCheckInKey === rk;
                    const dobOk = row.dob && /^\d{4}-\d{2}-\d{2}$/.test(String(row.dob));
                    const checkedInAt = String(
                      (isBackstageEligible ? row.backstageCheckedInAt : row.onStageCheckedInAt) || ''
                    ).trim();
                    const alreadyIn = checkedInAt.length > 0;
                    return (
                      <tr key={`${rk}-${i}`} className="border-b border-white/10 text-white/95">
                        <td className="px-3 py-2 font-mono">{row.br || '—'}</td>
                        <td className="px-3 py-2 font-mono">{row.whatsappNo || '—'}</td>
                        <td className="px-3 py-2 font-mono">{row.phoneAlternate || '—'}</td>
                        <td className="px-3 py-2 align-top">
                          {alreadyIn ? (
                            <div
                              className="w-full min-h-[48px] rounded-xl border border-emerald-500/45 bg-emerald-950/45 px-3 py-2 flex flex-col items-center justify-center gap-0.5"
                              role="status"
                            >
                              <span className="w-full text-center text-xs font-bold uppercase tracking-wide text-emerald-200">
                                Checked in
                              </span>
                              <span className="w-full text-center text-[11px] sm:text-xs font-mono text-emerald-100/95 leading-tight break-all">
                                {checkedInAt}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onRowDailyStageCheckIn(row, ev.name)}
                              disabled={busy || !dobOk}
                              title={!dobOk ? 'DOB missing on sheet for this row' : undefined}
                              className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 inline-flex items-center justify-center gap-2"
                            >
                              {busy ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                                  Check-in…
                                </>
                              ) : (
                                'Check-in'
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const hasLoadedGroups =
    !listLoading && (loadedUnder15Events.length > 0 || loadedOver15Events.length > 0);

  return (
    <section
      className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5 sm:p-6 shadow-xl"
      aria-labelledby={`panel-${action}-heading`}
    >
      <h2 id={`panel-${action}-heading`} className="text-lg font-bold text-white mb-1">
        {title}
      </h2>
      {String(description ?? '').trim() ? (
        <p className="text-sm text-violet-200/88 leading-relaxed mb-4">{description}</p>
      ) : null}

      {eligibleListKind ? (
        <div className="mb-6 space-y-3">
          <fieldset className="rounded-xl border border-white/15 bg-slate-900/30 p-3 sm:p-4">
            <legend className="px-1 text-xs font-semibold text-violet-200">
              Events — check all you need, then load once (no request when toggling checkboxes)
            </legend>
            <div
              className="mt-3 space-y-5 max-h-[min(52vh,420px)] overflow-y-auto pr-1"
              aria-label="Events to include in the next participant fetch"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-violet-300 mb-2">
                  Under 15 (B 1500–2999)
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">{eventsUnder15Sorted.map(renderEventPickRow)}</ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-violet-300 mb-2">
                  15 years and above (B 3000+)
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">{eventsOver15Sorted.map(renderEventPickRow)}</ul>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={loadParticipantLists}
                disabled={listLoading}
                className="w-full sm:w-auto min-h-[48px] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {listLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                    Loading lists…
                  </>
                ) : (
                  'Load participant lists'
                )}
              </button>
            </div>
          </fieldset>

          {!selectionMatchesLoaded && loadedEventNames.length > 0 && !listLoading ? (
            <p className="text-xs text-amber-200/95 rounded-lg border border-amber-500/35 bg-amber-950/35 px-3 py-2">
              Checkbox selection no longer matches the tables below — tap “Load participant lists” again to refresh.
            </p>
          ) : null}

          <div>
            <label
              htmlFor={`admin-eligible-${eligibleListKind}-search`}
              className="block text-xs font-semibold text-violet-200 mb-1"
            >
              Search (B number / WhatsApp / alternate phone / DOB)
            </label>
            <input
              id={`admin-eligible-${eligibleListKind}-search`}
              type="search"
              autoComplete="off"
              placeholder="Filters loaded event sections below…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              disabled={loadedEventNames.length === 0}
              className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-violet-400/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
            />
          </div>

          {listErr ? (
            <p className="text-sm text-red-200 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2" role="alert">
              {listErr}
            </p>
          ) : null}
          {listRowMsg.text ? (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${
                listRowMsg.type === 'ok'
                  ? 'bg-emerald-950/60 text-emerald-100 border border-emerald-500/30'
                  : 'bg-red-950/50 text-red-100 border border-red-500/30'
              }`}
              role={listRowMsg.type === 'err' ? 'alert' : 'status'}
            >
              {listRowMsg.text}
            </p>
          ) : null}

          {hasLoadedGroups ? (
            <div className="space-y-8">
              {loadedUnder15Events.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-violet-300 border-b border-white/10 pb-2">
                    Under 15 (B 1500–2999)
                  </h3>
                  <div className="space-y-3">{loadedUnder15Events.map((ev) => renderLoadedEventCard(ev))}</div>
                </div>
              ) : null}
              {loadedOver15Events.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-violet-300 border-b border-white/10 pb-2">
                    15 years and above (B 3000+)
                  </h3>
                  <div className="space-y-3">{loadedOver15Events.map((ev) => renderLoadedEventCard(ev))}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {!eligibleListKind ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor={`admin-${action}-br`} className="block text-xs font-semibold text-violet-200 mb-1">
                B number
              </label>
              <input
                id={`admin-${action}-br`}
                type="text"
                autoComplete="off"
                placeholder="e.g. B1511 or B3001"
                value={br}
                onChange={(e) => setBr(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-violet-400/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <p className="mt-1.5 text-[11px] text-violet-400/90 leading-snug">
                B 1500–2999 → under-15 events. B 3000+ → 15+ events.
              </p>
            </div>
            <div>
              <label htmlFor={`admin-${action}-dob`} className="block text-xs font-semibold text-violet-200 mb-1">
                Date of birth
              </label>
              <input
                id={`admin-${action}-dob`}
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={verify}
            disabled={verifyLoading}
            className="mb-4 inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/50 bg-violet-600/20 px-5 py-2.5 text-sm font-bold text-violet-100 hover:bg-violet-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
          >
            {verifyLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Verifying…
              </>
            ) : (
              'Verify participant'
            )}
          </button>

          {msg.text ? (
            <p
              className={`mb-4 text-sm rounded-lg px-3 py-2 ${
                msg.type === 'ok' ? 'bg-emerald-950/60 text-emerald-100 border border-emerald-500/30' : 'bg-red-950/50 text-red-100 border border-red-500/30'
              }`}
              role={msg.type === 'err' ? 'alert' : 'status'}
            >
              {msg.text}
            </p>
          ) : null}

          {parseBrNumeric(br) != null && bucketEvents.length === 0 ? (
            <p className="mb-4 text-xs text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2">
              {brBucketLabel(br)}
            </p>
          ) : null}

          {bucketEvents.length > 0 ? (
            <div className="border-t border-white/10 pt-4 mt-2">
              <label htmlFor={`admin-${action}-events`} className="block text-xs font-bold uppercase tracking-wide text-violet-300 mb-1">
                Events
              </label>
              {bucketHint ? (
                <p className="text-[11px] text-violet-400/85 mb-2">{bucketHint}</p>
              ) : null}
              <p className="text-[11px] text-violet-400/70 mb-2">Hold Ctrl/Cmd (or long-press on mobile) to select multiple.</p>
              <select
                id={`admin-${action}-events`}
                multiple
                size={Math.min(12, Math.max(4, bucketEvents.length))}
                value={Array.from(selectedIds)}
                onChange={(e) => {
                  const next = Array.from(e.target.selectedOptions, (o) => o.value);
                  setSelectedIds(new Set(next));
                }}
                className="mb-4 w-full rounded-lg border border-white/20 bg-slate-900/90 px-2 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 [&>option]:py-1"
              >
                {bucketEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={checkIn}
                disabled={checkLoading}
                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {checkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    Check-in…
                  </>
                ) : (
                  'Check-in'
                )}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
