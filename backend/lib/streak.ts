/**
 * Pure streak calculation for secureDay. Used by checkins route and tests.
 */
export interface StreakRow {
  last_completed_date_key: string | null;
  active_streak_count: number | null;
  longest_streak_count: number | null;
}

export function computeNewStreakCount(
  todayKey: string,
  streak: StreakRow | null
): { newStreakCount: number; longestStreak: number } {
  const yesterday = new Date(todayKey);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  let newStreakCount = 1;
  if (streak?.last_completed_date_key === yesterdayKey) {
    newStreakCount = (streak.active_streak_count || 0) + 1;
  }

  const longestStreak = Math.max(newStreakCount, streak?.longest_streak_count || 0);
  return { newStreakCount, longestStreak };
}
