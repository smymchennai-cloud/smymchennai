import React from 'react';

export function BulandiSelectableEventList({
  events,
  eventRegSelectedIds,
  setEventRegSelectedIds,
  eventRegFromSheetIds,
  setRulesEvent,
  setEventRegSuccessModalOpen,
}) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {events.map((event) => {
        const checked = eventRegSelectedIds.has(event.id);
        const wasOnRecord = eventRegFromSheetIds.has(event.id);
        const inputId = `bulandi-event-choice-${event.id}`;
        const blurb = String(event.shortDescription || '').trim();
        return (
          <li
            key={event.id}
            className="rounded-xl border border-violet-100 bg-white shadow-sm overflow-hidden flex flex-col min-h-0"
          >
            <div className="flex flex-col flex-1 gap-3 p-3 sm:p-4">
              <label htmlFor={inputId} className="flex min-w-0 cursor-pointer select-none flex-col gap-1.5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setEventRegSelectedIds((prev) => {
                        const n = new Set(prev);
                        if (n.has(event.id)) n.delete(event.id);
                        else n.add(event.id);
                        return n;
                      });
                      setEventRegSuccessModalOpen(false);
                    }}
                    className="h-4 w-4 shrink-0 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                    aria-label={`Select ${event.name}`}
                  />
                  <span className="min-w-0 font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                    {event.name}
                  </span>
                  {wasOnRecord ? (
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      Already registered
                    </span>
                  ) : null}
                </div>
                {blurb ? (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">
                    {blurb}
                  </p>
                ) : null}
              </label>
              <button
                type="button"
                onClick={() => setRulesEvent(event)}
                className="mt-auto flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
              >
                Rules and regulations
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
