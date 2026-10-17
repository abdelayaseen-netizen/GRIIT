/**
 * Simple / self-report Ask + Secured copy (task-states-v2).
 * No verifying phase — I did it lands directly on Secured.
 */

export const SIMPLE_ASK_HEADING = "Did you do it today?" as const;

export const SIMPLE_ASK_HONESTY = "Self-reported." as const;

/** Build 90 06.1: the first self-reported task says what the word means. */
export const SELF_REPORT_FIRST = "You're telling us you did it. No photo needed." as const;

/**
 * Build 90 06.2: the honesty line under the title is the screen's one "Self-reported".
 * The footer caption only appears when it says something else (a closing window).
 */
export function askHonestyLine(first: boolean | null): string {
  return first ? SELF_REPORT_FIRST : SIMPLE_ASK_HONESTY;
}
export function askFooterCaption(caption: string | undefined): string | null {
  const c = (caption ?? "").trim();
  return c && c !== SIMPLE_ASK_CAPTION ? c : null;
}

export const SIMPLE_ASK_CTA = "Done" as const;

export const SIMPLE_ASK_SAVING = "Saving…" as const;

export const SIMPLE_ASK_CAPTION = "Self-reported." as const;

export const SIMPLE_ASK_NOT_YET = "Not yet" as const;

export const SIMPLE_READY_SUBTYPE = "Self-report" as const;

export const SELF_REPORT_RECORDS_HEADING = "What this records" as const;

export const SELF_REPORT_RECORDS_ROWS = [
  "Today is marked done for this task",
  "Your challenge shows it without a photo",
  "No camera, no time window, no location",
] as const;

export const SAVING_TAKEOVER_HEADING = "Saving your day" as const;

export const SECURED_STREAK_LABEL = "Current streak" as const;

export const SECURED_PILL_SELF = "Self-reported." as const;

export const SECURED_PILL_CAMERA = "Camera proof. Checked on the server." as const;

export const SECURED_TODAY_PROOF = "Today's proof" as const;

export const SECURED_DONE = "Done" as const;

export function formatSecuredStateLine(day: number, camera: boolean): string {
  // 06.2: the chip under this line already says "Self-reported."; say it once.
  return camera ? `Day ${day}. Camera proof.` : `Day ${day}.`;
}

export function formatSecuredKeepCount(remaining: number): string {
  return `${remaining} more days this week to keep the count.`;
}

/** Secured meta — verbatim standing cut. */
export function formatSimpleSecuredMeta(): string {
  return "Self-reported · nothing checked";
}
