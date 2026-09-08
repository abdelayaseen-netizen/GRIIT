/** Free-tier cap: active enrollments (created or joined), not lifetime creates. */

export const FREE_ACTIVE_CHALLENGES_LIMIT = 3;

export const FREE_ACTIVE_LIMIT_MESSAGE =
  "Free accounts can be in 3 challenges at a time. Finish or leave one, or upgrade to GRIIT Pro.";

export function countActiveEnrollments(
  enrollments: readonly { status: string }[],
): number {
  return enrollments.filter((e) => e.status === "active").length;
}

export function isFreeActiveLimitReached(
  enrollments: readonly { status: string }[],
): boolean {
  return countActiveEnrollments(enrollments) >= FREE_ACTIVE_CHALLENGES_LIMIT;
}
