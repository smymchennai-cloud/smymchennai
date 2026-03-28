/**
 * Bulandi 2026 — main registration + sub-events.
 * Set mainRegistrationUrl, scheduleUrl, workshopRegistrationUrl, registrationWebAppUrl, per-event URLs when live.
 */

import bulandiWebApp from '../config/bulandiWebApp.json';

/**
 * One bound Apps Script deployment should handle both POST (registration) and GET (sheet → gviz for event verify).
 * Single source of truth: `src/config/bulandiWebApp.json` (also read by src/setupProxy.js for npm start).
 * @see scripts/bulandiRegistrationBoundWebApp.gs
 */
const BULANDI_REGISTRATION_WEB_APP_URL = bulandiWebApp.execUrl;

/**
 * In development, CRA (setupProxy.js) proxies this path to the real /exec URL so the browser stays same-origin.
 * Production uses the full Google URL — the web app must be deployed with “Who has access: Anyone” (including anonymous)
 * or the browser will block the request (CORS / “failed to fetch”).
 */
const BULANDI_WEB_APP_BROWSER_URL =
  process.env.NODE_ENV === 'development' ? '/bulandi-sheet-exec' : BULANDI_REGISTRATION_WEB_APP_URL;

export const bulandi2026Meta = {
  title: 'Bulandi 2026',
  date: '2026-07-26',
  venueNote: 'Venue and schedule — to be announced',
  mainRegistrationUrl: '',
  /** PDF, Google Doc, or page with the day’s programme */
  scheduleUrl: '',
  /** External form or page for Bulandi workshops — empty until live */
  workshopRegistrationUrl: '',
  /**
   * Google Apps Script web app URL for the Bulandi registration form (POST). Must end with `/exec`.
   * Paste the URL from Apps Script → Deploy → Web app.
   */
  registrationWebAppUrl: BULANDI_WEB_APP_BROWSER_URL,
  /** Optional — if set in Apps Script as SUBMIT_SECRET, use the same value here */
  registrationSubmitSecret: '',

  /**
   * Spreadsheet id — used only if `eventRegistrationSheetFetchUrl` is empty (direct gviz from the browser; often blocked by CORS).
   * When using the bound web app GET, you can leave this set for documentation; the app reads data from the script, not this URL.
   * @see https://docs.google.com/spreadsheets/d/1X6wXE1AIpR7edkmmtosGq3z4l0s-fPohOeO8qI45Ig4
   */
  eventRegistrationSpreadsheetId: '1X6wXE1AIpR7edkmmtosGq3z4l0s-fPohOeO8qI45Ig4',
  /** Sheet tab id (only used for direct gviz when fetch URL is empty) */
  eventRegistrationSheetGid: '0',
  /**
   * GET — must return gviz JSON (`google.visualization.Query.setResponse(...)`). Use the same `/exec` URL as `registrationWebAppUrl`.
   */
  eventRegistrationSheetFetchUrl: BULANDI_WEB_APP_BROWSER_URL,
};

/** App route for the Bulandi 2026 page (must match `App.js`). */
export const BULANDI_2026_PATH = '/bulandi-2026';

/**
 * Deep links: same page, tab from the hash. Bulandi2026Page reads `location.hash` on load and on `hashchange`.
 * Use these `href` values in emails, WhatsApp, Events, etc.
 */
export const BULANDI_2026_LINKS = {
  bulandiRegistration: `${BULANDI_2026_PATH}#bulandi-registration`,
  eventRegistration: `${BULANDI_2026_PATH}#event-registration`,
  workshopRegistration: `${BULANDI_2026_PATH}#workshop-registration`,
  sponsors: `${BULANDI_2026_PATH}#sponsors`,
};

/**
 * UPI QR for Bulandi main registration (PNG/WebP in `public/`). Leave empty to show a short note instead of an image.
 * Example: `'/bulandi-upi-qr.png'`
 */
export const bulandiRegistrationUpiQrUrl = '';

/**
 * Bulandi sponsors by tier. Use public paths e.g. `/photos/sponsor-name.png` for imageUrl.
 * @typedef {{ name: string, imageUrl: string, websiteUrl?: string }} BulandiSponsorEntry
 */

/** Single title sponsor — name + portrait/logo. */
export const bulandiTitleSponsor = {
  name: '',
  imageUrl: '',
  websiteUrl: '',
};

/** Six platinum-tier sponsors (image + name each). */
export const bulandiPlatinumSponsors = [
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
];

/** Ten gold-tier sponsors (image + name each). */
export const bulandiGoldSponsors = [
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
  { name: '', imageUrl: '', websiteUrl: '' },
];

/** @typedef {'under15' | 'over15'} BulandiAgeGroup */

export const bulandiSubEvents = [
  // —— Under 15 years ——
  {
    id: 'car-race-u15',
    name: 'Car Race',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the age cut-off date announced by SMYM.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nFormat, equipment, track rules, and safety guidelines will be shared by the coordinators.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'solo-dance-u15',
    name: 'Solo Dance',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nDuration, music submission, costume, and stage rules will be published in the detailed circular.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'story-telling-sacred-narratives-u15',
    name: 'Story Telling Sacred Narratives',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nStories should draw from sacred / devotional narratives as briefed by the jury. Time limit, language, and presentation format will be confirmed by the organising team.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'gk-crossword-u15',
    name: 'GK Crossword',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nGeneral-knowledge crossword format, time limit, materials, and tie-breakers will be specified at the event.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'fortune-draw-u15',
    name: 'Fortune Draw',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nDraw mechanics, eligibility for each round, and conduct rules will be announced by the coordinators.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'masterchef-solo-u15',
    name: 'Masterchef Solo (without fire)',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nNo open flame or fire cooking. Dish scope, ingredients, prep safety, time limit, and judging (taste, presentation, hygiene) will be defined in the event brief. Parent / guardian supervision rules if any will be specified.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'master-miss-bulandi-u15',
    name: 'Master and Miss Bulandi',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nRounds, theme, dress code (modest, community-appropriate), and judging criteria will follow the coordinator circular.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'creative-tinkering-u15',
    name: 'Creative Tinkering',
    ageGroup: 'under15',
    ageGroupLabel: 'Over 5 and under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nBrief, materials, build time, and display/judging rules will be shared before the competition.',
    registrationUrl: '',
    resultsUrl: '',
  },
  // —— 15 years and above ——
  {
    id: 'dancing-jodi-o15',
    name: 'Dancing Jodi',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹21,000 / ₹15,000 / ₹10,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off. Pair (duo) entry.\n\nPrizes (1st / 2nd / 3rd): ₹21,000 / ₹15,000 / ₹10,000.\n\nStyle, duration, music, and costume rules will be published by the organising team. Both members must complete main Bulandi registration.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'black-box-o15',
    name: 'Black Box',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nFormat (improv / spontaneous performance / props-in-a-box, etc.), time limits, and judging rubric will be explained at the briefing.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'trade-off-quiz-o15',
    name: 'Trade Off Quiz',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nTeam size, “trade-off” mechanics, rounds, and no-aid rules will be specified by the quizmaster. Tie-breaker procedure applies.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'masterchef-duel-o15',
    name: 'Masterchef Duel',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹6,000 / ₹4,000 / ₹2,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹6,000 / ₹4,000 / ₹2,000.\n\nDuel format (head-to-head rounds), ingredients, time boxes, and safety/hygiene norms will be shared in the detailed brief.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'tote-bag-designing-o15',
    name: 'Tote Bag Designing',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nMaterials, theme, duration, and submission/display rules will be shared before the competition.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'case-study-o15',
    name: 'Case Study',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nCase brief, time per team, judging criteria, and use of props/slides will follow the coordinator circular.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'murder-mystery-o15',
    name: 'Murder Mystery',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nSession structure (roles, clues, discussion rounds), duration, and conduct rules will be set by the game host. Content stays appropriate for a family audience.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'hindi-writing-o15',
    name: 'Hindi Writing',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nTopic or prompt, word/time limits, script (Devanagari), and submission format will be shared by coordinators. Original work only; plagiarism leads to disqualification.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'ai-wars-o15',
    name: 'AI wars',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nChallenge format, allowed tools, time limits, and judging criteria will be published by the organising team.',
    registrationUrl: '',
    resultsUrl: '',
  },
];
