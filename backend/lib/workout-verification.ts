/**
 * Workout verification response shaper for checkins.complete.
 * Facts persist in verification_gates.workout_log (not proof_payload_json).
 * entry_mode is always stored even when the short copy doesn't cite it.
 */

import type { ScheduleWindowEval } from "./photo-verification";

export type WorkoutEntryMode = "hand" | "timer";

export type WorkoutVerificationRow = {
  key: string;
  label: string;
  verified: boolean;
};

export type WorkoutVerification = {
  rows: WorkoutVerificationRow[];
};

export type WorkoutLogFacts = {
  kind: string;
  duration_min: number;
  /** null when no floor was configured. */
  floor_min: number | null;
  entry_mode: WorkoutEntryMode;
};

export function formatFinishedWindowLabel(hhmm: string, inside: boolean): string {
  return inside
    ? `Finished ${hhmm} — inside the window`
    : `Finished ${hhmm} — outside the window`;
}

/**
 * Session row copy:
 * - floor + timer → "{Kind} · {actual} min over a {floor} min floor"
 * - no floor + typed → "{Kind} · {actual} min"
 */
export function formatWorkoutSessionLabel(log: WorkoutLogFacts): string {
  const kind = log.kind.trim() || "Workout";
  const actual = Math.max(0, Math.round(log.duration_min));
  const floor =
    typeof log.floor_min === "number" && log.floor_min > 0
      ? Math.round(log.floor_min)
      : null;

  if (floor != null && log.entry_mode === "timer") {
    return `${kind} · ${actual} min over a ${floor} min floor`;
  }
  return `${kind} · ${actual} min`;
}

export function formatWorkoutSecuredMeta(kind: string, durationMin: number): string {
  const k = kind.trim() || "Workout";
  const actual = Math.max(0, Math.round(durationMin));
  return `${k} · ${actual} min`;
}

export function buildWorkoutVerification(opts: {
  window: ScheduleWindowEval;
  workoutLog?: WorkoutLogFacts | null;
  photoPresent: boolean;
  proofPayload?: { capturedAt: string; captured_in_app: boolean } | null;
}): WorkoutVerification {
  const rows: WorkoutVerificationRow[] = [];

  if (opts.window.hasWindow) {
    rows.push({
      key: "time_window",
      label: formatFinishedWindowLabel(
        opts.window.checkedAtHHMM,
        opts.window.passed
      ),
      verified: opts.window.passed,
    });
  }

  if (
    opts.workoutLog &&
    opts.workoutLog.kind.trim() &&
    Number.isFinite(opts.workoutLog.duration_min) &&
    (opts.workoutLog.entry_mode === "hand" ||
      opts.workoutLog.entry_mode === "timer")
  ) {
    rows.push({
      key: "workout_session",
      label: formatWorkoutSessionLabel(opts.workoutLog),
      verified: true,
    });
  }

  if (opts.proofPayload?.captured_in_app === true && opts.photoPresent) {
    rows.push({
      key: "camera_in_app",
      label: "Shot in-app, not from the library",
      verified: true,
    });
  }

  return { rows };
}
