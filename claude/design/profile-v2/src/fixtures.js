// fixtures.js — one dataset per state. Every string on every screen is derived from here.
// In production these come from proof rows; see README "Stats — one query each".

export const DAY_STATE = { VERIFIED: 'verified', MISSED: 'missed', TODAY: 'today', FUTURE: 'future' };

/** cell size for the due-day strip: never wider than the card's inner width */
export function cellWidth(count, innerWidth = 298, gap = 4, max = 24, min = 6) {
  if (!count) return 0;
  return Math.max(min, Math.min(max, Math.floor((innerWidth - (count - 1) * gap) / count)));
}

/** one entry per day of a challenge: verified / missed / today / future */
export function runStates(length, elapsed, misses = []) {
  return Array.from({ length }, (_, i) =>
    i < elapsed ? (misses.includes(i) ? DAY_STATE.MISSED : DAY_STATE.VERIFIED)
    : i === elapsed ? DAY_STATE.TODAY : DAY_STATE.FUTURE);
}

/** verdict word from the closed-due-day rate; no word under 7 due days */
export function verdictFor(rate, closedDueDays) {
  if (closedDueDays < 7) return '';
  if (rate >= 0.9) return 'Locked in';
  if (rate >= 0.75) return 'Solid';
  if (rate >= 0.5) return 'Slipping';
  return 'Rebuilding';
}

export function weeklyAverage(weeks) {
  const live = weeks.filter((w) => w !== null);
  return live.length ? live.reduce((a, b) => a + b, 0) / live.length : 0;
}

const V = DAY_STATE.VERIFIED, M = DAY_STATE.MISSED, T = DAY_STATE.TODAY;

export const FIXTURES = {
  // A — 12 due days (11 closed). Read Something from 25 Aug, day 4 missed; Cold Plunge from 3 Sep.
  twelve: {
    id: 'twelve',
    label: '12 due days',
    identity: { name: 'Yaseen', handle: 'bobabdel', followers: 34, following: 21,
      bio: 'Two challenges deep. Cold mornings, ten pages, phone down by ten.' },
    streak: { current: 7, best: 7, since: '29 Aug' },
    consistency: { rate: '91%', verdict: 'Locked in', line: '10 of 11 due days verified. 1 due today.',
      strip: [V, V, V, M, V, V, V, V, V, V, V, T],
      weeks: Array.from({ length: 26 }, (_, i) => (i === 24 ? 0.86 : i === 25 ? 1 : null)) },
    runs: [
      { name: 'Read Something', day: 'Day 12 of 30', meta: '10 verified · 1 missed · 2 tasks daily', days: runStates(30, 11, [3]) },
      { name: 'Cold Plunge Ladder', day: 'Day 3 of 14', meta: '2 verified · 0 missed · 2 tasks daily', days: runStates(14, 2) },
    ],
    completed: [],
    proofDays: [11, 10, 9, 8, 7, 6, 5, 3, 2, 1],
    badgeDates: { 3: '31 Aug 2026', 7: '4 Sep 2026' },
    detail: { totalVerified: 10, completion: '10 of 11 due days', firstProof: '25 Aug 2026',
      months: [{ label: 'Sep 2026', value: '4 of 4', pct: 1 }, { label: 'Aug 2026', value: '6 of 7', pct: 0.86 }],
      byChallenge: [{ label: 'Read Something', value: '10 of 11' }, { label: 'Cold Plunge Ladder', value: '2 of 2' }] },
  },

  // B — 3 due days (2 closed). Under 7 due days: no percentage, no verdict word.
  three: {
    id: 'three',
    label: '3 due days',
    identity: { name: 'Yaseen', handle: 'bobabdel', followers: 0, following: 0, bio: '' },
    streak: { current: 2, best: 2, since: '3 Sep' },
    consistency: { rate: '2 of 2', verdict: '', line: 'Day 3 of 30. Today\u2019s proof is due.',
      strip: [V, V, T],
      weeks: Array.from({ length: 26 }, (_, i) => (i === 25 ? 1 : null)) },
    runs: [{ name: 'Read Something', day: 'Day 3 of 30', meta: '2 verified · 0 missed · 2 tasks daily', days: runStates(30, 2) }],
    completed: [],
    proofDays: [2, 1],
    badgeDates: {},
    detail: { totalVerified: 2, completion: '2 of 2 due days', firstProof: '3 Sep 2026',
      months: [{ label: 'Sep 2026', value: '2 of 2', pct: 1 }],
      byChallenge: [{ label: 'Read Something', value: '2 of 2' }] },
  },

  // D — 30 due days: the widest one row of cells can get (6px cells).
  thirty: {
    id: 'thirty',
    label: '30 due days',
    identity: { name: 'Yaseen', handle: 'bobabdel', followers: 34, following: 21,
      bio: 'Two challenges deep. Cold mornings, ten pages, phone down by ten.' },
    streak: { current: 17, best: 17, since: '19 Aug' },
    consistency: { rate: '93%', verdict: 'Locked in', line: '27 of 29 due days verified. 1 due today.',
      strip: Array.from({ length: 30 }, (_, i) => (i === 29 ? T : i === 3 || i === 11 ? M : V)),
      weeks: Array.from({ length: 26 }, (_, i) => (i === 21 ? 0.71 : i >= 22 ? 1 : null)) },
    runs: [{ name: 'Read Something', day: 'Day 30 of 30', meta: '27 verified · 2 missed · 2 tasks daily', days: runStates(30, 29, [3, 11]) }],
    completed: [],
    proofDays: [29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18],
    badgeDates: { 3: '21 Aug 2026', 7: '25 Aug 2026', 14: '1 Sep 2026' },
    detail: { totalVerified: 27, completion: '27 of 29 due days', firstProof: '7 Aug 2026',
      months: [{ label: 'Sep 2026', value: '4 of 4', pct: 1 }, { label: 'Aug 2026', value: '23 of 25', pct: 0.92 }],
      byChallenge: [{ label: 'Read Something', value: '27 of 29' }] },
  },

  // C — no challenge running: 0 due days.
  none: {
    id: 'none',
    label: 'No challenge',
    identity: { name: 'Yaseen', handle: 'bobabdel', followers: 0, following: 0, bio: '' },
    streak: { current: 0, best: 0, since: '' },
    consistency: { rate: 'No due days', verdict: '', line: 'Join a challenge and the strip starts filling.',
      strip: [], weeks: Array.from({ length: 26 }, () => null) },
    runs: [], completed: [], proofDays: [], badgeDates: {},
    detail: { totalVerified: 0, completion: '—', firstProof: '—', months: [], byChallenge: [] },
  },
};

export const BADGES = [
  { need: 3, name: '3 days', rule: 'Three consecutive verified days', source: 'bestStreak' },
  { need: 7, name: '7 days', rule: 'Seven consecutive verified days', source: 'bestStreak' },
  { need: 14, name: '14 days', rule: 'Fourteen consecutive verified days', source: 'bestStreak' },
  { need: 30, name: '30 days', rule: 'Thirty consecutive verified days', source: 'bestStreak' },
  { need: 100, name: '100 verified', rule: 'One hundred verified days in total', source: 'verifiedDays' },
];

export function badgeRows(fx) {
  return BADGES.map((b) => {
    const have = b.source === 'verifiedDays' ? fx.detail.totalVerified : fx.streak.best;
    const earned = have >= b.need;
    return {
      ...b,
      earned,
      state: earned ? (fx.badgeDates[b.need] ? `Earned ${fx.badgeDates[b.need]}` : 'Earned') : `${have} / ${b.need}`,
      progress: Math.min(1, have / b.need),
    };
  });
}

export const VISITOR = {
  name: 'Marcus Hale', handle: 'marcus',
  bio: 'Up at 5. Cold water, long runs, early nights.',
  streak: { current: 47, best: 132, note: 'Unbroken since 21 Jul. 418 days verified since Aug 2024.' },
  consistency: { rate: '100%', verdict: 'Locked in', line: '29 of 29 due days verified. 1 due today.',
    strip: Array.from({ length: 30 }, (_, i) => (i === 29 ? T : V)),
    weeks: Array.from({ length: 26 }, (_, i) => (i >= 19 ? 1 : i >= 14 ? 0.86 : i >= 8 ? 0.71 : 0.86)) },
  runs: [{ name: '75 Hard', day: 'Day 47 of 75', meta: '46 verified · 0 missed · 5 tasks daily', days: runStates(75, 46) }],
  proofDays: [46, 45, 44, 43, 42, 41],
};
