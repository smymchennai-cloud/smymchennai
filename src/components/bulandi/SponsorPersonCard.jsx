import React from 'react';

/** Portrait + name; optional website link. */
export function SponsorPersonCard({ entry, size = 'grid' }) {
  const { name, imageUrl, websiteUrl } = entry;
  const label = name?.trim() ? name.trim() : 'To be announced';
  const isTitle = size === 'title';
  const frameClass = isTitle
    ? 'relative w-full max-w-[280px] mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md ring-2 ring-amber-200/50'
    : 'relative w-full aspect-square overflow-hidden rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white shadow-sm';

  const inner = (
    <div className={`flex flex-col items-center ${isTitle ? 'max-w-sm mx-auto' : ''}`}>
      <div className={frameClass}>
        {imageUrl?.trim() ? (
          <img
            src={imageUrl.trim()}
            alt={name?.trim() ? `${name.trim()} (sponsor)` : 'Sponsor'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-amber-700/55 text-xs sm:text-sm font-medium">
            Image coming soon
          </div>
        )}
      </div>
      <p
        className={`mt-2.5 sm:mt-3 font-semibold text-gray-900 text-center px-1 ${
          isTitle ? 'text-base sm:text-lg lg:text-xl' : 'text-xs sm:text-sm'
        }`}
      >
        {label}
      </p>
    </div>
  );

  if (websiteUrl?.trim()) {
    return (
      <a
        href={websiteUrl.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl outline-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        {inner}
      </a>
    );
  }

  return <div className="h-full">{inner}</div>;
}
