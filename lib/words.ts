/**
 * Build 92 10.5 (P3-22 to P3-25): Secured, Freeze, Self-reported and Verified get one definition
 * each, shown once per user at its first moment, then a small "i" opens the words sheet.
 */
export const WORDS = {
  Secured: "Every task today is done, so the day counts toward your streak.",
  Freeze: "Covers one missed day so your streak doesn’t break. You earn one every 7 days in a row.",
  "Self-reported": "You marked it done yourself, with no photo or app proof.",
  Verified: "Proven by the camera or Strava.",
} as const;

export type Word = keyof typeof WORDS;

export const WORD_ORDER: readonly Word[] = ["Secured", "Freeze", "Self-reported", "Verified"];

export const WORDS_SHEET_TITLE = "What these words mean";
export const WORDS_INFO_LABEL = "What these words mean";

export const FREEZE_EARNED = {
  title: "You earned a freeze.",
  body: WORDS.Freeze,
  count: (n: number, cap: number, proCap: number) => `You have ${n}. Hold up to ${cap} (${proCap} with Pro).`,
  done: "Got it",
} as const;

export const FREEZE_HELD = (n: number) => `A freeze covered yesterday. Your ${n}-day streak is safe.`;

export const SELF_REPORTED_FIRST = "Self-reported: you marked it done yourself, with no photo or app proof.";
