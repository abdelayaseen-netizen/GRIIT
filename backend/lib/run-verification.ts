/**
 * Run verification response shaper for checkins.complete.
 * Rows are facts the server actually evaluated — never client fiction.
 * Run facts persist in verification_gates.run_log (not proof_payload_json).
 */

import {
  CAMERA_IN_APP_RECORD_LABEL,
  type ScheduleWindowEval,
} from "./photo-verification";
import type { VerificationRow } from "./verification-row";

export type RunEntryMode = "hand" | "timer";

export type RunVerificationRow = VerificationRow;

export type RunVerification = {
  rows: RunVerificationRow[];
};

export type RunLogFacts = {
  distance_km: number;
  duration_min: number;
  entry_mode: RunEntryMode;
};

/** Format km for verifying / secured copy (trim trailing zeros). */
export function formatRunKm(km: number): string {
  if (!Number.isFinite(km)) return "0";
  const rounded = Math.round(km * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function formatLoggedWindowLabel(hhmm: string, inside: boolean): string {
  return inside
    ? `Logged ${hhmm} — inside the window`
    : `Logged ${hhmm} — outside the window`;
}

export function formatRunEntryLabel(
  entryMode: RunEntryMode,
  distanceKm: number,
  durationMin: number
): string {
  const km = formatRunKm(distanceKm);
  const min = Math.max(0, Math.round(durationMin));
  if (entryMode === "timer") {
    return `Timed in-app · ${km} km in ${min} min`;
  }
  return `Entered by hand · ${km} km in ${min} min`;
}

/**
 * Build run verifying rows from server-evaluated facts.
 * - Time row only when a window was configured/evaluated.
 * - Entry row only when distance + duration + entry_mode are present.
 * - In-app photo row only when photo + captured_in_app === true.
 */
export function buildRunVerification(opts: {
  window: ScheduleWindowEval;
  runLog?: RunLogFacts | null;
  photoPresent: boolean;
  proofPayload?: { capturedAt: string; captured_in_app: boolean } | null;
}): RunVerification {
  const rows: RunVerificationRow[] = [];

  if (opts.window.hasWindow) {
    rows.push({
      key: "time_window",
      label: formatLoggedWindowLabel(
        opts.window.checkedAtHHMM,
        opts.window.passed
      ),
      verified: opts.window.passed,
      role: "check",
    });
  }

  if (
    opts.runLog &&
    Number.isFinite(opts.runLog.distance_km) &&
    Number.isFinite(opts.runLog.duration_min) &&
    (opts.runLog.entry_mode === "hand" || opts.runLog.entry_mode === "timer")
  ) {
    rows.push({
      key: "run_entry",
      label: formatRunEntryLabel(
        opts.runLog.entry_mode,
        opts.runLog.distance_km,
        opts.runLog.duration_min
      ),
      verified: true,
      role: "record",
    });
  }

  if (opts.proofPayload?.captured_in_app === true && opts.photoPresent) {
    rows.push({
      key: "camera_in_app",
      label: CAMERA_IN_APP_RECORD_LABEL,
      verified: true,
      role: "record",
    });
  }

  return { rows };
}
