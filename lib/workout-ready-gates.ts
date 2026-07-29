/**
 * Gate rows + subtype + helper for Workout · Ready (task-states-v2).
 * Only gates that apply from real task config — honest cut.
 * Floor in helper copy always comes from the task's real min_duration_minutes.
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type WorkoutReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const WORKOUT_READY_SUBTYPE_FALLBACK = "Workout" as const;

export const WORKOUT_READY_HELPER_NO_FLOOR =
  "Log your type and duration. No GPS." as const;

/**
 * Floored helper — interpolates the task's real floor minutes.
 * Call only when floorMin > 0.
 */
export function formatWorkoutReadyHelper(floorMin: number): string {
  const n = Math.max(1, Math.round(floorMin));
  return `A ${n} min minimum turns on the timer.`;
}

/**
 * Header subtype: subtype → label → unit_label → "Workout".
 */
export function resolveWorkoutReadySubtype(config: {
  subtype?: string | null;
  label?: string | null;
  unit_label?: string | null;
}): string {
  for (const key of ["subtype", "label", "unit_label"] as const) {
    const v = config[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return WORKOUT_READY_SUBTYPE_FALLBACK;
}

export function buildWorkoutReadyGates(config: {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  require_camera_only?: boolean | null;
  require_photo?: boolean | null;
}): WorkoutReadyGateData[] {
  const gates: WorkoutReadyGateData[] = [];

  const range = formatScheduleWindowRange(
    config.schedule_window_start,
    config.schedule_window_end
  );
  if (range) {
    gates.push({
      key: "time",
      label: "Time window",
      sublabel: range,
    });
  }

  if (config.require_camera_only === true) {
    gates.push({
      key: "camera",
      label: "Camera only",
      sublabel: "Library blocked",
    });
  } else if (config.require_photo === true) {
    gates.push({
      key: "camera",
      label: "Camera only",
      sublabel: "If photo is on",
    });
  }

  return gates;
}
