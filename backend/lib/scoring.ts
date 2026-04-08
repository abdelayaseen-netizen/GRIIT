/**
 * Leaderboard scoring for friends and challenge boards.
 *
 * Primary rank: secured days this week (0-7).
 * Tiebreaker: current streak (rewards consistency without making new users uncompetitive).
 *
 * The score is designed so weekly effort is always dominant:
 * - Each secured day = 100 points
 * - Streak tiebreaker = 1 point per streak day (max contribution: ~1% of a weekly day)
 *
 * This means someone with 7 secured days this week (700 pts) ALWAYS outranks
 * someone with 6 secured days (600 pts) regardless of streak length.
 */
export function consistencyScore(weeklySecuredDays: number, currentStreak: number): number {
  return weeklySecuredDays * 100 + Math.min(currentStreak, 99);
}
