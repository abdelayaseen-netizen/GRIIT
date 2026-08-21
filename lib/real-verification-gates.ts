/**
 * Instance-based predicate: does THIS task have at least one real check?
 *
 * Overlay must key off this, not task type. Display constants
 * (midnight, no-floor word_count, run_entry, workout_session, all_day,
 * check-in location without coords) are not gates.
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type RealVerificationGateConfig = {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  require_camera_only?: boolean | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  min_words?: number | null;
  /**
   * Counter/water/reading target from real config only.
   * 0 / omit / non-positive = not a gate. No type fallbacks (8/10/1).
   */
  counter_target?: number | null;
};

const COUNTER_TARGET_KEYS = [
  "daily_target",
  "goal",
  "target_value",
  "target_count",
  "target_pages",
  "cup_count",
  "pages",
] as const;

/** Config target only — never invent water=8 / reading=10 / counter=1. */
export function resolveConfigCounterTarget(config: {
  daily_target?: number | null;
  goal?: number | null;
  target_value?: number | null;
  target_count?: number | null;
  target_pages?: number | null;
  cup_count?: number | null;
  pages?: number | null;
}): number {
  for (const key of COUNTER_TARGET_KEYS) {
    const n = config[key];
    if (typeof n === "number" && n > 0) return n;
  }
  return 0;
}

export function taskHasRealVerificationGates(
  config: RealVerificationGateConfig
): boolean {
  if (
    formatScheduleWindowRange(
      config.schedule_window_start,
      config.schedule_window_end
    )
  ) {
    return true;
  }
  if (config.require_camera_only === true) {
    return true;
  }
  // Same coords check as useTaskCompleteScreen.tsx:477-479.
  if (
    typeof config.location_latitude === "number" &&
    typeof config.location_longitude === "number"
  ) {
    return true;
  }
  if (typeof config.min_words === "number" && config.min_words > 0) {
    return true;
  }
  if (typeof config.counter_target === "number" && config.counter_target > 0) {
    return true;
  }
  return false;
}
