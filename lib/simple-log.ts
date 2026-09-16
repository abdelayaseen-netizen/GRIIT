/**
 * Simple / self-report Ask + Secured copy (task-states-v2).
 * No verifying phase — I did it lands directly on Secured.
 */

export const SIMPLE_ASK_HEADING = "Did you do it today?" as const;

export const SIMPLE_ASK_HONESTY = "Self-reported. Nothing is checked." as const;

export const SIMPLE_ASK_CTA = "I did it" as const;

export const SIMPLE_ASK_SAVING = "Saving…" as const;

export const SIMPLE_ASK_CAPTION = "Nothing is secured until the server says so." as const;

export const SIMPLE_ASK_NOT_YET = "Not yet" as const;

export const SIMPLE_READY_SUBTYPE = "Self-report" as const;

export const SELF_REPORT_RECORDS_HEADING = "What this records" as const;

export const SELF_REPORT_RECORDS_ROWS = [
  "Today is marked done for this task",
  "Your challenge sees it as self-reported",
  "No camera, no time window, no location",
] as const;

export const SAVING_TAKEOVER_HEADING = "Saving your day" as const;

export const SECURED_STREAK_LABEL = "Current streak" as const;

export const SECURED_PILL_SELF = "Self-reported. Nothing was checked." as const;

export const SECURED_PILL_CAMERA = "Camera proof. Checked on the server." as const;

export const SECURED_TODAY_PROOF = "Today's proof" as const;

export const SECURED_DONE = "Done" as const;

export function formatSecuredStateLine(day: number, camera: boolean): string {
  return camera ? `Day ${day}. Camera proof.` : `Day ${day}. Self reported.`;
}

export function formatSecuredKeepCount(remaining: number): string {
  return `${remaining} more days this week to keep the count.`;
}

/** Secured meta — verbatim standing cut. */
export function formatSimpleSecuredMeta(): string {
  return "Self-reported · nothing checked";
}
