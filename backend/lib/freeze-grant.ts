/**
 * Earned freezes. A multiple of 7 secured days grants one, up to the hold cap.
 * A freeze-held day does not add to that count and does not end the run.
 */

import { nextEarnStreak } from "../../lib/freeze-earn";

export { nextEarnStreak };

export const FREEZE_HOLD_CAP_FREE = 2;
export const FREEZE_HOLD_CAP_PRO = 4;

export function freezeHoldCap(isPro: boolean): number {
  return isPro ? FREEZE_HOLD_CAP_PRO : FREEZE_HOLD_CAP_FREE;
}

export function shouldGrantEarnedFreeze(input: {
  streak: number;
  held: number;
  cap: number;
  alreadyGrantedForDate: boolean;
}): boolean {
  if (input.alreadyGrantedForDate) return false;
  if (input.cap <= 0 || input.held >= input.cap) return false;
  const streak = Math.floor(input.streak);
  return streak >= 7 && streak % 7 === 0;
}

/** Milestone reached, but the hold cap blocked the grant. */
export function earnedFreezeBlockedByCap(input: {
  streak: number;
  held: number;
  cap: number;
  alreadyGrantedForDate: boolean;
}): boolean {
  if (input.alreadyGrantedForDate) return false;
  const streak = Math.floor(input.streak);
  if (streak < 7 || streak % 7 !== 0) return false;
  return input.held >= input.cap;
}
