import React from 'react';
import { Trophy } from 'lucide-react';

export const parsePrizeTiers = (prizes) => {
  if (!prizes || typeof prizes !== 'string') return null;
  const parts = prizes.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  return { first: parts[0], second: parts[1], third: parts[2] };
};

export const PrizeBadgesRow = ({ prizes, inline = false }) => {
  const tiers = parsePrizeTiers(prizes);
  if (!tiers) {
    return (
      <span
        className={`text-xs font-medium text-violet-700 tabular-nums ${inline ? 'inline' : 'mt-1 block'}`}
      >
        {prizes}
      </span>
    );
  }
  return (
    <div
      className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${inline ? 'inline-flex' : 'mt-2'}`}
      role="group"
      aria-label="Prize money for 1st, 2nd, and 3rd place"
    >
      <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-white shadow-sm ring-1 ring-violet-400/50 tabular-nums">
        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-white/95" aria-hidden />
        <span className="sr-only">1st place: </span>
        {tiers.first}
      </span>
      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-400 to-violet-700 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm tabular-nums">
        <span className="sr-only">2nd place: </span>
        {tiers.second}
      </span>
      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-800 to-violet-950 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-violet-50 shadow-sm tabular-nums">
        <span className="sr-only">3rd place: </span>
        {tiers.third}
      </span>
    </div>
  );
};

/** Horizontal 1st / 2nd / 3rd prizes for the event registration list (same badges as elsewhere). */
export const EventListPrizeColumn = ({ prizes }) => {
  const tiers = parsePrizeTiers(prizes);
  if (!tiers) {
    return (
      <div className="w-full min-w-0 shrink">
        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 mb-1">Prizes</p>
        <p className="text-xs font-semibold text-violet-900 tabular-nums leading-snug">{prizes}</p>
      </div>
    );
  }
  return (
    <div
      className="w-full min-w-0 shrink"
      role="group"
      aria-label="Prize money for 1st, 2nd, and 3rd place"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 mb-1.5 sm:mb-0 sm:sr-only">
        Prizes
      </p>
      <PrizeBadgesRow prizes={prizes} inline />
    </div>
  );
};

export const PrizePodiumCard = ({ prizes }) => {
  const tiers = parsePrizeTiers(prizes);
  if (!tiers) {
    return (
      <span className="text-xs font-semibold text-violet-900 bg-violet-100 px-2.5 py-1 rounded-full">{prizes}</span>
    );
  }
  return (
    <div className="w-full rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/90 p-3 sm:p-4 shadow-md ring-1 ring-violet-200/50">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-violet-800/85 mb-3">
        Win big — prize pool
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-violet-400 to-violet-700 px-1.5 pt-3 pb-2.5 text-center text-white shadow-lg ring-1 ring-white/25">
          <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">2nd</span>
          <span className="mt-1 text-sm sm:text-base font-bold tabular-nums leading-none">{tiers.second}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-fuchsia-500 via-purple-600 to-violet-800 px-1.5 pt-2 pb-3 text-center text-white shadow-xl ring-2 ring-fuchsia-300/70 scale-[1.03] sm:scale-105 z-[1]">
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 mb-1 drop-shadow-sm text-white" strokeWidth={2} aria-hidden />
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/95">Winner</span>
          <span className="mt-1 text-base sm:text-lg font-black tabular-nums leading-none">{tiers.first}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-indigo-900 to-violet-950 px-1.5 pt-3 pb-2.5 text-center text-violet-50 shadow-lg ring-1 ring-violet-900/30">
          <span className="text-[10px] font-bold uppercase tracking-wide text-violet-100/90">3rd</span>
          <span className="mt-1 text-sm sm:text-base font-bold tabular-nums leading-none">{tiers.third}</span>
        </div>
      </div>
    </div>
  );
};
