/** Consistency score for friend / challenge leaderboards. */
export function consistencyScore(checkIns: number, streak: number): number {
  return Math.round(checkIns * 20 * (1 + streak * 0.1));
}
