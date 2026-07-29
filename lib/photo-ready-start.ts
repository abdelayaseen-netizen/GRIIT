/**
 * Photo · Ready Start CTA enable/disable decision (task-states-v2).
 * Out-of-window → disabled with "Opens at {HH:MM}"; in-window / no window → enabled.
 * Server checkins.complete remains the enforcement backstop.
 */

import type { ScheduleWindowStatus } from "@/lib/schedule-window";

export type PhotoReadyStartDecision = {
  canStart: boolean;
  /** Shown on the disabled CTA — e.g. "Opens at 07:00". */
  disabledReason?: string;
};

/** Normalize config HH:mm → zero-padded HH:MM for CTA copy. */
export function formatOpensAtLabel(windowStart: string): string {
  const trimmed = windowStart.trim();
  const [hRaw, mRaw] = trimmed.split(":");
  const h = (hRaw ?? "00").padStart(2, "0");
  const m = (mRaw ?? "00").padStart(2, "0");
  return `Opens at ${h}:${m}`;
}

/**
 * Decide whether Photo · Ready Start is enabled from a live schedule evaluation.
 * - `none` / `in_window` → enabled
 * - `out_of_window` → disabled; reason uses window start in task timezone wall clock
 */
export function decidePhotoReadyStart(opts: {
  status: ScheduleWindowStatus;
  windowStart?: string | null;
}): PhotoReadyStartDecision {
  if (opts.status !== "out_of_window") {
    return { canStart: true };
  }
  const start =
    typeof opts.windowStart === "string" ? opts.windowStart.trim() : "";
  if (!start) {
    return { canStart: false, disabledReason: "Opens at —" };
  }
  return {
    canStart: false,
    disabledReason: formatOpensAtLabel(start),
  };
}
