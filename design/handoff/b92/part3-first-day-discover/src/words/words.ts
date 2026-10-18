// 3.5 · one definition each; shown once at the moment, then a small "i"
export const WORDS = {
  Secured: 'Every task today is done, so the day counts toward your streak.',
  Freeze: 'Covers one missed day so your streak doesn’t break. You earn one every 7 days in a row.',
  'Self-reported': 'You marked it done yourself, with no photo or app proof.',
  Verified: 'Proven by the camera or Strava.',
} as const;
export const FIRST_MOMENT = { Secured: 'first_day_secured', Freeze: 'first_freeze_earned', 'Self-reported': 'first_self_reported', Verified: 'first_verified' } as const; // users.seen_* flags
export const FREEZE_EARNED = { title: 'You earned a freeze.', body: WORDS.Freeze, count: (n: number, cap: number, proCap: number) => `You have ${n}. Hold up to ${cap} (${proCap} with Pro).` };
export const FREEZE_HELD = (n: number) => `A freeze covered yesterday. Your ${n}-day streak is safe.`;
export const SELF_REPORTED_FIRST = 'Self-reported: you marked it done yourself, with no photo or app proof.';
