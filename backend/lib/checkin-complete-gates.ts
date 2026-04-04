import { TRPCError } from "@trpc/server";
import type { TaskConfig } from "./task-config";
import type { ChallengeTaskConfig } from "./challenge-tasks";
import { haversineDistance } from "./geo";

/** Hard mode: task may only be completed inside schedule window (viewer TZ). */
export function assertHardModeScheduleWindow(config: TaskConfig): void {
  if (!config.hard_mode || !config.schedule_window_start || !config.schedule_window_end) return;
  const tz = config.schedule_timezone || "UTC";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const parts = formatter.formatToParts(now);
  const currentHour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const currentMinute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const currentTimeMinutes = parseInt(currentHour, 10) * 60 + parseInt(currentMinute, 10);

  const startParts = config.schedule_window_start.split(":").map(Number);
  const endParts = config.schedule_window_end.split(":").map(Number);
  const startH = startParts[0] ?? 0;
  const startM = startParts[1] ?? 0;
  const endH = endParts[0] ?? 0;
  const endM = endParts[1] ?? 0;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let isInWindow: boolean;
  if (startMinutes <= endMinutes) {
    isInWindow = currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
  } else {
    isInWindow = currentTimeMinutes >= startMinutes || currentTimeMinutes <= endMinutes;
  }

  if (!isInWindow) {
    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
    };
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Hard mode: this task can only be completed between ${formatTime(startH, startM)} and ${formatTime(endH, endM)}. Current time: ${formatTime(parseInt(currentHour, 10), parseInt(currentMinute, 10))}.`,
    });
  }
}

export function assertHardModeCameraOnly(
  cfg: ChallengeTaskConfig,
  photoUrl: string | null,
  proofUrl: string | null | undefined
): void {
  if (!cfg.hard_mode || !cfg.require_camera_only) return;
  if (!photoUrl && !proofUrl?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Hard mode: photo proof is required. Take a photo with your camera to complete this task.",
    });
  }
}

export type TaskRowLoc = {
  require_location?: boolean | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_radius_meters?: number | null;
  location_name?: string | null;
};

/** Returns distance in meters when location was evaluated; sets hardModeLocationGate when hard-mode geo fence applies. */
export function evaluateTaskLocation(
  task: TaskRowLoc,
  cfg: ChallengeTaskConfig,
  input: { location_latitude?: number; location_longitude?: number }
): { locationDistanceM?: number; hardModeLocationGate: boolean } {
  const requireLocation = task.require_location === true || cfg.require_location === true;
  let locationDistanceM: number | undefined;
  const hardModeLocationGate =
    cfg.hard_mode === true &&
    cfg.require_location === true &&
    typeof cfg.location_latitude === "number" &&
    typeof cfg.location_longitude === "number";

  if (hardModeLocationGate) {
    const inLat = input.location_latitude;
    const inLon = input.location_longitude;
    if (inLat == null || inLon == null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Hard mode: location verification required. Please enable location services and try again.",
      });
    }
    const gateLat = cfg.location_latitude as number;
    const gateLon = cfg.location_longitude as number;
    const maxRadius = cfg.location_radius_meters ?? 200;
    const distance = haversineDistance(gateLat, gateLon, inLat, inLon);
    locationDistanceM = distance;
    if (distance > maxRadius) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Hard mode: you must be within ${maxRadius}m of ${cfg.location_name || "the required location"}. You are ${Math.round(distance)}m away.`,
      });
    }
    return { locationDistanceM, hardModeLocationGate: true };
  }
  if (requireLocation) {
    const tLat = task.location_latitude ?? (typeof cfg.location_latitude === "number" ? cfg.location_latitude : undefined);
    const tLon = task.location_longitude ?? (typeof cfg.location_longitude === "number" ? cfg.location_longitude : undefined);
    const radius = task.location_radius_meters ?? (typeof cfg.location_radius_meters === "number" ? cfg.location_radius_meters : 200);
    if (tLat == null || tLon == null) throw new TRPCError({ code: "BAD_REQUEST", message: "This task has invalid location configuration." });
    const inLat = input.location_latitude;
    const inLon = input.location_longitude;
    if (inLat == null || inLon == null) throw new TRPCError({ code: "BAD_REQUEST", message: "This task requires location verification. Please enable location services." });
    const distance = haversineDistance(tLat, tLon, inLat, inLon);
    locationDistanceM = distance;
    if (distance > radius) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `You need to be within ${radius}m of ${task.location_name ?? cfg.location_name ?? "the required location"}. You are ${Math.round(distance)}m away.`,
      });
    }
    return { locationDistanceM, hardModeLocationGate: false };
  }
  return { hardModeLocationGate: false };
}
