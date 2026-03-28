import React from 'react';
import { EventListPrizeColumn } from './BulandiPrizeBlocks';

export function BulandiSelectableEventList({
  events,
  eventRegSelectedIds,
  setEventRegSelectedIds,
  eventRegFromSheetIds,
  setRulesEvent,
  setEventRegSuccessModalOpen,
}) {
  return (
    <ul className="space-y-2.5">
      {events.map((event) => {
        const checked = eventRegSelectedIds.has(event.id);
        const wasOnRecord = eventRegFromSheetIds.has(event.id);
        const inputId = `bulandi-event-choice-${event.id}`;
        return (
          <li
            key={event.id}
            className="rounded-xl border border-violet-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:gap-4 sm:items-center px-3 py-3 sm:px-4 sm:py-3.5">
              {/*
                display:contents so this label’s children slot into the parent grid; clicking
                name or prizes toggles the checkbox. Rules stays outside the label.
              */}
              <label
                htmlFor={inputId}
                className="contents cursor-pointer select-none"
              >
                <div className="flex min-w-0 items-start gap-2 sm:gap-3 sm:pr-2">
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
                    className="mt-0.5 sm:mt-0 sm:self-center h-4 w-4 shrink-0 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                    aria-label={`Select ${event.name}`}
                  />
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                      {event.name}
                    </span>
                    {wasOnRecord ? (
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full w-fit">
                        Already registered
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="min-w-0 flex justify-start">
                  <EventListPrizeColumn prizes={event.prizes} />
                </div>
              </label>
              <button
                type="button"
                onClick={() => setRulesEvent(event)}
                className="flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 sm:w-[11rem]"
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
