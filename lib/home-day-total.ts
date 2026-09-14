/**
 * Home / Profile "Day X of Y".
 * target_streak wins when it is longer than the enrollment duration_days.
 * Otherwise duration wins.
 */
export function homeDayTotal(
  durationDays: number,
  targetStreak: number | null | undefined
): number {
  if (targetStreak != null && targetStreak > durationDays) return targetStreak;
  return durationDays;
}
