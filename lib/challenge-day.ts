/**
 * Single source for user-facing challenge day numbers.
 * From active_challenges.current_day — not streak counts.
 * Format: "Day 1" — lowercase Day, no zero-padding, floor at 1.
 */

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}
