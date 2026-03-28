import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, Loader2, Mic2, Theater } from 'lucide-react';
import { bulandi2026Meta, BULANDI_2026_PATH } from '../../data/bulandi2026Data';
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
    hint: 'Main desk arrival — timestamp in today’s ddMMyyyyregistered column (no hyphens; legacy sheet headers still work).',
  },
  {
    id: 'backstage',
    label: 'Back stage check-in',
    icon: Theater,
    hint: '',
  },
  {
    id: 'onstage',
    label: 'On stage check-in',
    icon: Mic2,
    hint: '',
  },
];

/** BR 1500–2999 → under-15 list; BR 3000+ → 15+ list (matches registration rules). */
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
  if (isUnder15BrRange(n)) return 'Under 15 (BR 1500–2999)';
  if (n >= 3000) return '15 years and above (BR 3000+)';
  return 'BR must be in range 1500+ (under 15: 1500–2999, 15+: 3000+)';
}

/** One entry per event name (sheet headers match these display names). */
function allBulandiEventsDistinctSorted() {
  const byName = new Map();
  for (const e of eventsUnder15) byName.set(e.name, e);
  for (const e of eventsOver15) byName.set(e.name, e);
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function buildAdminBody(action, rest) {
  const secret = (bulandi2026Meta.registrationSubmitSecret || '').trim();
  return { action, ...rest, ...(secret ? { secret } : {}) };
}

export default function Bulandi2026AdminPage() {
  const [activeTab, setActiveTab] = useState('desk');

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
            Venue volunteers: enter BR and DOB as on registration. Updates go to the Bulandi Google Sheet.
          </p>
        </header>
        <nav
          className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3"
          aria-label="Admin sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  on
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                    : 'bg-white/10 text-violet-100 hover:bg-white/15 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                {label}
              </button>
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
      setMsg({ type: 'err', text: 'Enter a valid BR number (e.g. BR1511).' });
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
      <p className="text-sm text-violet-200/85 mb-4">
        BR + DOB must match the sheet (hyphens in BR or DOB are ignored). Today’s column is{' '}
        <span className="font-mono text-violet-100">ddMMyyyyregistered</span> (e.g. 29032026registered; server date).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="admin-desk-br" className="block text-xs font-semibold text-violet-200 mb-1">
            BR number
          </label>
          <input
            id="admin-desk-br"
            type="text"
            autoComplete="off"
            placeholder="e.g. BR1511"
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

function EventCheckInPanel({ webAppUrl, sheetId, fetchUrl, action, title, description, eligibleListKind }) {
  const [br, setBr] = useState('');
  const [dob, setDob] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [filterEventName, setFilterEventName] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [eligibleRows, setEligibleRows] = useState([]);
  const [eligibleMeta, setEligibleMeta] = useState({
    deskColumn: '',
    backstageGateColumn: '',
    stageColumn: '',
    note: '',
  });
  const [listLoading, setListLoading] = useState(false);
  const [listErr, setListErr] = useState('');
  const [rowCheckInKey, setRowCheckInKey] = useState('');
  const [listRowMsg, setListRowMsg] = useState({ type: '', text: '' });

  const bucketEvents = useMemo(() => eventsEligibleForBr(br), [br]);
  const bucketHint = useMemo(() => brBucketLabel(br), [br]);

  const distinctEvents = useMemo(() => allBulandiEventsDistinctSorted(), []);

  const filteredEligible = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return eligibleRows;
    return eligibleRows.filter((p) =>
      [p.br, p.whatsappNo, p.phoneAlternate, p.dob].some((x) => String(x ?? '').toLowerCase().includes(q))
    );
  }, [eligibleRows, listSearch]);

  const rowCheckInKeyFor = (p) => `${String(p.br || '')}|${String(p.dob || '')}`;

  const isBackstageEligible = eligibleListKind === 'backstage';
  const listEligibleAction = isBackstageEligible ? 'adminBackstageEligibleList' : 'adminOnStageEligibleList';
  const rowCheckInAction = isBackstageEligible ? 'adminBackstageRowCheckIn' : 'adminOnStageRowCheckIn';

  const onRowDailyStageCheckIn = useCallback(
    async (p) => {
      if (!filterEventName) return;
      const dobIso = String(p.dob || '').trim();
      if (!dobIso || !/^\d{4}-\d{2}-\d{2}$/.test(dobIso)) {
        setListRowMsg({ type: 'err', text: 'This row has no valid DOB on the sheet.' });
        return;
      }
      const key = rowCheckInKeyFor(p);
      setListRowMsg({ type: '', text: '' });
      setRowCheckInKey(key);
      try {
        const data = await postBulandiWebApp(
          webAppUrl,
          buildAdminBody(rowCheckInAction, {
            br: String(p.br || '').trim(),
            dob: dobIso,
            eventName: filterEventName,
          })
        );
        const at = data.checkedInAt ? String(data.checkedInAt) : '';
        const patchField = isBackstageEligible ? 'backstageCheckedInAt' : 'onStageCheckedInAt';
        setEligibleRows((prev) =>
          prev.map((r) => (rowCheckInKeyFor(r) === key ? { ...r, [patchField]: at } : r))
        );
        setListRowMsg({
          type: 'ok',
          text: `Checked in ${p.br || 'participant'}${at ? ` at ${at}` : ''}.`,
        });
      } catch (e) {
        setListRowMsg({ type: 'err', text: e?.message || 'Check-in failed.' });
      } finally {
        setRowCheckInKey('');
      }
    },
    [filterEventName, webAppUrl, rowCheckInAction, isBackstageEligible]
  );

  useEffect(() => {
    if (!eligibleListKind || !filterEventName) {
      setEligibleRows([]);
      setEligibleMeta({ deskColumn: '', backstageGateColumn: '', stageColumn: '', note: '' });
      setListErr('');
      return;
    }
    let cancelled = false;
    setListLoading(true);
    setListErr('');
    (async () => {
      try {
        const data = await postBulandiWebApp(
          webAppUrl,
          buildAdminBody(listEligibleAction, { eventName: filterEventName })
        );
        if (cancelled) return;
        setEligibleRows(Array.isArray(data.participants) ? data.participants : []);
        if (isBackstageEligible) {
          setEligibleMeta({
            deskColumn: data.deskColumn || '',
            backstageGateColumn: '',
            stageColumn: data.backstageColumn || '',
            note: data.note || '',
          });
        } else {
          setEligibleMeta({
            deskColumn: '',
            backstageGateColumn: data.backstageColumn || '',
            stageColumn: data.onStageColumn || '',
            note: data.note || '',
          });
        }
      } catch (e) {
        if (!cancelled) {
          setEligibleRows([]);
          setEligibleMeta({ deskColumn: '', backstageGateColumn: '', stageColumn: '', note: '' });
          setListErr(e?.message || 'Could not load list.');
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eligibleListKind, filterEventName, webAppUrl, listEligibleAction, isBackstageEligible]);

  useEffect(() => {
    const allowed = new Set(bucketEvents.map((e) => e.id));
    setSelectedIds((prev) => new Set([...prev].filter((id) => allowed.has(id))));
  }, [bucketEvents]);

  const verify = useCallback(async () => {
    setMsg({ type: '', text: '' });

    if (!parseBrNumeric(br)) {
      setMsg({ type: 'err', text: 'Enter a valid BR number.' });
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
      setMsg({ type: 'ok', text: 'BR and DOB match the sheet.' });
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
          <div>
            <label
              htmlFor={`admin-eligible-${eligibleListKind}-event`}
              className="block text-xs font-semibold text-violet-200 mb-1"
            >
              Event
            </label>
            <select
              id={`admin-eligible-${eligibleListKind}-event`}
              value={filterEventName}
              onChange={(e) => {
                setFilterEventName(e.target.value);
                setListRowMsg({ type: '', text: '' });
              }}
              className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">Select event…</option>
              {distinctEvents.map((ev) => (
                <option key={ev.id} value={ev.name}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`admin-eligible-${eligibleListKind}-search`}
              className="block text-xs font-semibold text-violet-200 mb-1"
            >
              Search (BR / WhatsApp / alternate phone / DOB)
            </label>
            <input
              id={`admin-eligible-${eligibleListKind}-search`}
              type="search"
              autoComplete="off"
              placeholder="Type to filter the table…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              disabled={!filterEventName}
              className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-violet-400/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
            />
          </div>

          {eligibleMeta.deskColumn ? (
            <p className="text-[11px] text-violet-400/90 space-y-0.5">
              <span className="block">
                Desk column today: <span className="font-mono text-violet-200">{eligibleMeta.deskColumn}</span>
                {` · ${eligibleRows.length} listed`}
              </span>
              {eligibleMeta.stageColumn ? (
                <span className="block">
                  Back stage column today:{' '}
                  <span className="font-mono text-violet-200">{eligibleMeta.stageColumn}</span>
                </span>
              ) : null}
            </p>
          ) : null}
          {!isBackstageEligible && (eligibleMeta.backstageGateColumn || eligibleMeta.stageColumn) ? (
            <p className="text-[11px] text-violet-400/90 space-y-0.5">
              {eligibleMeta.backstageGateColumn ? (
                <span className="block">
                  Listed after back stage today:{' '}
                  <span className="font-mono text-violet-200">{eligibleMeta.backstageGateColumn}</span>
                  {` · ${eligibleRows.length} listed`}
                </span>
              ) : null}
              {eligibleMeta.stageColumn ? (
                <span className="block">
                  On stage column today:{' '}
                  <span className="font-mono text-violet-200">{eligibleMeta.stageColumn}</span>
                </span>
              ) : null}
            </p>
          ) : null}
          {eligibleMeta.note ? (
            <p className="text-xs text-amber-200/95 rounded-lg border border-amber-500/30 bg-amber-950/35 px-3 py-2">
              {eligibleMeta.note}
            </p>
          ) : null}
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

          {listLoading ? (
            <p className="inline-flex items-center gap-2 text-sm text-violet-200">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
              Loading…
            </p>
          ) : null}

          {filterEventName && !listLoading && !listErr ? (
            <div className="overflow-x-auto rounded-lg border border-white/15">
              <table className="w-full min-w-[360px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-slate-900/60 text-violet-200">
                    <th className="px-3 py-2 font-semibold">BR number</th>
                    <th className="px-3 py-2 font-semibold">WhatsApp</th>
                    <th className="px-3 py-2 font-semibold">Phone alternate</th>
                    <th className="px-3 py-2 font-semibold min-w-[7rem]">Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEligible.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-violet-300/80 text-center">
                        No rows match{listSearch.trim() ? ' this search' : ' (or none eligible for this event today).'}
                      </td>
                    </tr>
                  ) : (
                    filteredEligible.map((row, i) => {
                      const rk = rowCheckInKeyFor(row);
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
                                onClick={() => onRowDailyStageCheckIn(row)}
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
          ) : null}
        </div>
      ) : null}

      {!eligibleListKind ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor={`admin-${action}-br`} className="block text-xs font-semibold text-violet-200 mb-1">
                BR number
              </label>
              <input
                id={`admin-${action}-br`}
                type="text"
                autoComplete="off"
                placeholder="e.g. BR1511 or BR3001"
                value={br}
                onChange={(e) => setBr(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-violet-400/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <p className="mt-1.5 text-[11px] text-violet-400/90 leading-snug">
                BR 1500–2999 → under-15 events. BR 3000+ → 15+ events.
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
