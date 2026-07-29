/**
 * Gate rows + subtype + helper for Check-in · Ready (task-states-v2).
 * Radius always from real location_radius_meters — default 200 when null (never 50).
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type CheckinReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const CHECKIN_READY_HELPER =
  "Range is checked. No photo needed." as const;

export const CHECKIN_READY_SUBTYPE_FALLBACK = "Check-in" as const;

/** Production / migration default when radius is unset. */
export const CHECKIN_RADIUS_DEFAULT_M = 200 as const;

export function resolveCheckinRadiusMeters(
  radiusMeters?: number | null
): number {
  if (typeof radiusMeters === "number" && radiusMeters > 0) {
    return Math.round(radiusMeters);
  }
  return CHECKIN_RADIUS_DEFAULT_M;
}

export function formatCheckinWithinLabel(radiusMeters?: number | null): string {
  return `Within ${resolveCheckinRadiusMeters(radiusMeters)} m`;
}

export function resolveCheckinReadySubtype(config: {
  subtype?: string | null;
  label?: string | null;
  unit_label?: string | null;
}): string {
  for (const key of ["subtype", "label", "unit_label"] as const) {
    const v = config[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return CHECKIN_READY_SUBTYPE_FALLBACK;
}

export function buildCheckinReadyGates(config: {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  location_radius_meters?: number | null;
}): CheckinReadyGateData[] {
  const gates: CheckinReadyGateData[] = [];

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

  // Check-in always shows the range gate (location is the type's proof).
  gates.push({
    key: "location",
    label: formatCheckinWithinLabel(config.location_radius_meters),
  });

  return gates;
}
