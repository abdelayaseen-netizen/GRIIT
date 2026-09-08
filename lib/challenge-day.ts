/**
 * Single source for user-facing challenge day numbers.
 * From active_challenges.current_day — not streak counts.
 * Format: "Day 1" — lowercase Day, no zero-padding, floor at 1.
 *
 * secure_day increments current_day immediately, so after securing day N
 * the column is N+1. Display and the secured_day feed event use displayDay.
 */

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}

/**
 * Day number shown in the UI.
 * secured_today true → current_day − 1 (the day just secured). Else current_day.
 * Floors at 1.
 */
export function displayDay(current_day: number, secured_today: boolean): number {
  const n = challengeDayNumber(current_day);
  return secured_today ? challengeDayNumber(n - 1) : n;
}

/**
 * Raw `current_day` for a secured_day feed row so the renderer can call
 * displayDay(n, true). Old writes stored post-increment current_day; this PR
 * stores the day actually secured. Reconstruct the column either way.
 */
export function feedSecuredCurrentDay(
  day_number: number | null | undefined,
  current_day: number | null | undefined,
): number {
  const live = challengeDayNumber(current_day);
  if (typeof day_number === "number" && Number.isFinite(day_number) && day_number !== live) {
    return challengeDayNumber(day_number + 1);
  }
  return live;
}

/** @deprecated use displayDay */
export function challengeDisplayDay(
  currentDay: number | null | undefined,
  todaySecured: boolean,
): number {
  return displayDay(challengeDayNumber(currentDay), todaySecured);
}
