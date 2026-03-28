import { bulandiSubEvents } from '../../data/bulandi2026Data';

export const eventsUnder15 = bulandiSubEvents.filter((e) => e.ageGroup === 'under15');
export const eventsOver15 = bulandiSubEvents.filter((e) => e.ageGroup === 'over15');

export const BULANDI_PAGE_TABS = [
  { id: 'bulandi-registration', label: 'Bulandi Registration' },
  { id: 'event-registration', label: 'Event Registration' },
  { id: 'workshop-registration', label: 'Workshop registration' },
  { id: 'sponsors', label: 'Sponsors' },
];

export const BULANDI_VALID_TAB_IDS = new Set(BULANDI_PAGE_TABS.map((t) => t.id));

export function readBulandiTabFromHash() {
  if (typeof window === 'undefined') return 'bulandi-registration';
  const raw = window.location.hash.replace(/^#/, '').trim();
  return BULANDI_VALID_TAB_IDS.has(raw) ? raw : 'bulandi-registration';
}
