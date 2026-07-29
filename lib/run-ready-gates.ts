/**
 * Gate rows + subtype for Run · Ready (task-states-v2).
 * Only gates that apply from real task config — honest cut.
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type RunReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const RUN_READY_HELPER =
  "Distance is typed or timed. No GPS." as const;

export const RUN_READY_SUBTYPE_FALLBACK = "Run" as const;

/**
 * Header subtype: subtype → label → unit_label → "Run".
 * Never hardcode "Treadmill".
 */
export function resolveRunReadySubtype(config: {
  subtype?: string | null;
  label?: string | null;
  unit_label?: string | null;
}): string {
  for (const key of ["subtype", "label", "unit_label"] as const) {
    const v = config[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return RUN_READY_SUBTYPE_FALLBACK;
}

export function buildRunReadyGates(config: {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  require_camera_only?: boolean | null;
  require_photo?: boolean | null;
}): RunReadyGateData[] {
  const gates: RunReadyGateData[] = [];

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
    // Photo optional / soft — spec: "If photo is on"
    gates.push({
      key: "camera",
      label: "Camera only",
      sublabel: "If photo is on",
    });
  }

  return gates;
}
