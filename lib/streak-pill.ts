/**
 * Streak pill copy — singular "day" always, no hyphen.
 * Spec: "1 day streak", "23 day streak".
 */
export function formatStreakPillLabel(streakCount: number): string {
  const n = Number.isFinite(streakCount) ? Math.max(0, Math.floor(streakCount)) : 0;
  return `${n} day streak`;
}
