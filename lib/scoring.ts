/**
 * Same formula as backend `consistencyScore` (for UI copy / tooling).
 * Primary: weekly secured days × 100; tiebreaker: streak (capped at 99).
 */
export function consistencyScore(weeklySecuredDays: number, currentStreak: number): number {
  return weeklySecuredDays * 100 + Math.min(currentStreak, 99);
}
