/**
 * Null only while getStats has not succeeded.
 * A successful read with no streaks row (`activeStreak: null`) is day 0 —
 * getStats intentionally refuses to invent a zero for a missing row
 * (`backend/trpc/routes/profiles-stats.ts`), but Home must not stay on
 * "Updating streak." for a fresh guest.
 */
export function resolveDisplayedStreak(
  statsReady: boolean,
  activeStreak: number | null | undefined
): number | null {
  if (!statsReady) return null;
  return activeStreak ?? 0;
}
