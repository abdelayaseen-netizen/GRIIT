/**
 * Single source for user-facing challenge day numbers.
 * From active_challenges.current_day — not streak counts.
 * Format: "Day 1" — lowercase Day, no zero-padding, floor at 1.
 *
 * secure_day increments current_day by 1 after securing day N, so
 * post-secure current_day is N+1 while today remains the day that was
 * just secured. Gate display with todaySecured (today ∈ securedDateKeys).
 *
 * Completion-screen labels should capture current_day BEFORE secureDay
 * instead of using this helper on a raced post-secure read.
 */

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}

/**
 * Display day for home / proof surfaces.
 * todaySecured from securedDateKeys (server truth):
 *   secured today → current_day − 1 (the day just secured)
 *   otherwise     → current_day (the day in progress)
 * Floors at 1.
 */
export function challengeDisplayDay(
  currentDay: number | null | undefined,
  todaySecured: boolean,
): number {
  const n = challengeDayNumber(currentDay);
  return todaySecured ? challengeDayNumber(n - 1) : n;
}
