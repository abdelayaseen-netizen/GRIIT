/**
 * Simple / self-report Ask + Secured copy (task-states-v2).
 * No verifying phase — I did it lands directly on Secured.
 */

export const SIMPLE_ASK_HEADING = "Did you do it today?" as const;

export const SIMPLE_ASK_HONESTY = "Self-reported. Nothing is checked." as const;

export const SIMPLE_ASK_CTA = "I did it" as const;

export const SIMPLE_ASK_NOT_YET = "Not yet" as const;

export const SIMPLE_READY_SUBTYPE = "Self-report" as const;

export const SELF_REPORT_RECORDS_HEADING = "What this records" as const;

export const SELF_REPORT_RECORDS_ROWS = [
  "You said you did it",
  "Nothing is checked",
  "No camera proof",
] as const;

/** Secured meta — verbatim standing cut. */
export function formatSimpleSecuredMeta(): string {
  return "Self-reported · nothing checked";
}
