export const CONSISTENCY_TITLE = "Consistency";
export const DAYS_SECURED_LABEL = "Days secured";
export const LONGEST_STREAK_LABEL = "Longest streak";
export const TOTAL_SECURED_LABEL = "Total secured";
export const COMPLETION_LABEL = "Completion";
export const FIRST_PROOF_LABEL = "First proof";
export const CAMERA_PROOF_LABEL = "Camera proof";
export const SELF_REPORTED_LABEL = "Self-reported";
export const BY_MONTH_LABEL = "By month";
export const BY_CHALLENGE_LABEL = "By challenge";
export const DAYS_CAPTION = "days";
export const CONSISTENCY_FOOTER =
  "A day counts as secured when every task in it was done. Self-reported days count toward the streak and are listed separately above. Nothing here is a claim that they were checked.";

export function ofElapsed(elapsed: number): string {
  return `of ${elapsed}`;
}

export function heroDayLine(day: number, total: number): string {
  return `Day ${day} of ${total}.`;
}

export function daysValue(n: number): string {
  return `${n} days`;
}

export function challengeProofCaption(camera: number, selfReported: number): string {
  return `${camera} camera proof, ${selfReported} self-reported`;
}

/** Percentage of days elapsed. Never duration_days. */
export function completionPct(verifiedClosed: number, closedDueDays: number): string {
  if (closedDueDays <= 0) return "—";
  return `${Math.round((verifiedClosed / closedDueDays) * 100)}%`;
}
