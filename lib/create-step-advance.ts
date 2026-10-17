/**
 * Build 90 06.8: one Continue press moves one step.
 * The wizard's primary handler used to close over `state`; a second tap landing after the
 * re-render saw step 2 and, with a pack already chosen, went straight to step 3. The
 * advance is now computed from the previous state and a short lock swallows the echo tap.
 */
export const ADVANCE_LOCK_MS = 600;

export function nextStepAfterPrimary<S extends { step: 1 | 2 | 3 }>(
  prev: S,
  can: { step1: (s: S) => boolean; step2: (s: S) => boolean },
): 1 | 2 | 3 {
  if (prev.step === 1) return can.step1(prev) ? 2 : 1;
  if (prev.step === 2) return can.step2(prev) ? 3 : 2;
  return 3;
}

/** True when a press should be ignored because the last advance was under the lock. */
export function pressIsEcho(lastAdvanceAt: number, now: number, lockMs = ADVANCE_LOCK_MS): boolean {
  return now - lastAdvanceAt < lockMs;
}
