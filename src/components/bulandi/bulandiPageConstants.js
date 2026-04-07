import { bulandiSubEvents } from '../../data/bulandi2026Data';

export const eventsUnder15 = bulandiSubEvents.filter((e) => e.ageGroup === 'under15');
export const eventsOver15 = bulandiSubEvents.filter((e) => e.ageGroup === 'over15');

export const BULANDI_PAGE_TABS = [
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'bulandi-registration', label: 'Bulandi Registration' },
  { id: 'event-registration', label: 'Event Registration' },
  { id: 'workshop-registration', label: 'Workshop registration' },
];

export const BULANDI_VALID_TAB_IDS = new Set(BULANDI_PAGE_TABS.map((t) => t.id));

/** First tab in `BULANDI_PAGE_TABS` when the URL has no valid hash. */
export const BULANDI_DEFAULT_TAB_ID = BULANDI_PAGE_TABS[0].id;

export function readBulandiTabFromHash() {
  if (typeof window === 'undefined') return BULANDI_DEFAULT_TAB_ID;
  const raw = window.location.hash.replace(/^#/, '').trim();
  return BULANDI_VALID_TAB_IDS.has(raw) ? raw : BULANDI_DEFAULT_TAB_ID;
}
