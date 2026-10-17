/** Balanced GPS. A High fix is what made location-gated finishes sit for many seconds. */
export const LOCATION_FIX_TIMEOUT_MS = 5000;

/**
 * Only a location-gated task may wait on GPS.
 * A normal photo, timer, journal, or self-report never does, even if a coordinate happens to be stored.
 */
export function finishWaitsOnLocation(args: {
  taskType: string;
  requireLocation: boolean;
  hasTarget: boolean;
}): boolean {
  if (!args.hasTarget) return false;
  return args.taskType === "checkin" || args.requireLocation === true;
}
