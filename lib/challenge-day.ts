/**
 * Single source for user-facing challenge day numbers.
 * From active_challenges.current_day — not streak counts.
 * Format: "Day 1" — lowercase Day, no zero-padding, floor at 1.
 *
 * secure_day increments current_day by 1 after securing day N, so
 * post-secure current_day is N+1. For "Day N secured" copy, capture
 * current_day BEFORE secure_day, or use challengeDayJustSecured when
 * you only have the post-increment value and know today was secured.
 */

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}

/**
 * Day just secured, given post-secure current_day (already +1).
 * Use only when today is known secured in the same payload as this current_day.
 */
export function challengeDayJustSecured(
  currentDayAfterSecure: number | null | undefined,
): number {
  return challengeDayNumber(challengeDayNumber(currentDayAfterSecure) - 1);
}
