/** Always a number — checkins.complete must never omit this field. */
export function requiredRemainingCount(
  requiredTaskCount: number,
  completedRequiredCount: number,
): number {
  return Math.max(0, requiredTaskCount - completedRequiredCount);
}
