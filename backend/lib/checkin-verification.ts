/**
 * Check-in verification response shaper for checkins.complete.
 * Facts persist in verification_gates.checkin_log.
 * Standing cut: Arrived + On location only — no dwell / stayed language.
 */

import type { ScheduleWindowEval } from "./photo-verification";
import type { VerificationRow } from "./verification-row";

export type CheckinVerificationRow = VerificationRow;

export type CheckinVerification = {
  rows: CheckinVerificationRow[];
};

export type CheckinLogFacts = {
  /** HH:MM (24h) when the check-in was recorded (task TZ). */
  arrived_hhmm: string;
  distance_meters: number;
  location_name?: string | null;
};

export function formatArrivedWindowLabel(hhmm: string, inside: boolean): string {
  return inside
    ? `Arrived ${hhmm} — inside the window`
    : `Arrived ${hhmm} — outside the window`;
}

export function formatOnLocationLabel(distanceMeters: number): string {
  const n = Math.max(0, Math.round(distanceMeters));
  return `On location · ${n} m away`;
}

/** Secured meta — standing cut (no dwell minutes). */
export function formatCheckinSecuredMeta(hasLocationTarget = true): string {
  return hasLocationTarget ? "On location" : "Checked in";
}

export function buildCheckinVerification(opts: {
  window: ScheduleWindowEval;
  checkinLog?: CheckinLogFacts | null;
}): CheckinVerification {
  const rows: CheckinVerificationRow[] = [];

  if (opts.window.hasWindow) {
    rows.push({
      key: "time_window",
      label: formatArrivedWindowLabel(
        opts.window.checkedAtHHMM,
        opts.window.passed
      ),
      verified: opts.window.passed,
      role: "check",
    });
  }

  if (
    opts.checkinLog &&
    Number.isFinite(opts.checkinLog.distance_meters) &&
    opts.checkinLog.distance_meters >= 0
  ) {
    rows.push({
      key: "location",
      label: formatOnLocationLabel(opts.checkinLog.distance_meters),
      verified: true,
      role: "record",
    });
  }

  return { rows };
}
