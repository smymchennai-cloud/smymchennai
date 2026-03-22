/**
 * Bulandi 2026 — main registration + sub-events.
 * Set mainRegistrationUrl, scheduleUrl, workshopRegistrationUrl, registrationWebAppUrl, per-event URLs when live.
 */

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
  registrationWebAppUrl: 'https://script.google.com/macros/s/AKfycbzTQ3HKaFeBfZNbwCIZh0eDORkdku7k0iSqag3IWZWv5XsxQaZSJF5wvIQGdOEtoV0Q/exec',
  /** Optional — if set in Apps Script as SUBMIT_SECRET, use the same value here */
  registrationSubmitSecret: '',
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
    id: 'car-racing-u15',
    name: 'Car Racing',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
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
    ageGroupLabel: 'Under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nDuration, music submission, costume, and stage rules will be published in the detailed circular.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'story-telling-sacred-u15',
    name: 'Story Telling (Sacred Narratives)',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nStories should draw from sacred / devotional narratives as briefed by the jury. Time limit, language, and presentation format will be confirmed by the organising team.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'sudoku-challenge-u15',
    name: 'Sudoku Challenge',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nDifficulty tiers, time limits, and tie-breakers will be specified at the event. No external aids unless notified.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'tote-bag-designing-u15',
    name: 'Tote Bag Designing',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nMaterials, theme, duration, and submission/display rules will be shared before the competition.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'hindi-handwriting-u15',
    name: 'Hindi Handwriting',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nScript style, passage, duration, and paper rules will be notified by coordinators. Neatness, formation, and consistency will guide judging.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'masterchef-solo-u15',
    name: 'Masterchef Solo',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nDish scope, ingredients, kitchen safety, time limit, and judging criteria (taste, presentation, hygiene) will be defined in the event brief. Parent / guardian supervision rules if any will be specified.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'fashion-show-u15',
    name: 'Fashion Show',
    ageGroup: 'under15',
    ageGroupLabel: 'Under 15 years',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: under 15 years as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nTheme, walk timing, music, team size, and dress code (modest, community-appropriate) will follow the coordinator circular.',
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
    id: 'design-a-character-o15',
    name: 'Design a Character',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nMedium (digital / on-paper), theme, submission format, and originality requirements will be announced by coordinators.',
    registrationUrl: '',
    resultsUrl: '',
  },
  {
    id: 'fish-tank-o15',
    name: 'Fish Tank',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹11,000 / ₹8,000 / ₹5,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹11,000 / ₹8,000 / ₹5,000.\n\nPitch format, time per team, judging criteria, and use of props/slides will follow the coordinator circular (inspired by a pitch-style showcase).',
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
    name: 'Hindi Writing Competition',
    ageGroup: 'over15',
    ageGroupLabel: '15 years and above',
    prizes: '₹3,000 / ₹2,000 / ₹1,000',
    rules:
      'Eligibility: 15 years and above as on the announced cut-off.\n\nPrizes (1st / 2nd / 3rd): ₹3,000 / ₹2,000 / ₹1,000.\n\nTopic or prompt, word/time limits, script (Devanagari), and submission format will be shared by coordinators. Original work only; plagiarism leads to disqualification.',
    registrationUrl: '',
    resultsUrl: '',
  },
];
