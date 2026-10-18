/**
 * Build 92 04.1: the result a post shows, written once into activity_events.metadata.result.
 * Facts only (numbers and kinds); the client turns them into copy. Additive for build 91.
 */

export type PostResultKind = "run" | "workout" | "counter" | "timer" | "journal" | "check";

export type PostResult = {
  kind: PostResultKind;
  /** Runs: distance in km (converted by the client to the task's unit). */
  distance_km?: number;
  /** Runs, workouts and timers: minutes. */
  duration_min?: number;
  /** Workouts: the kind the user picked ("Lift", "Yoga"). */
  workout_kind?: string;
  /** Counters: the count and the unit word. */
  count?: number;
  unit?: string;
  /** Runs: the task's unit, "mi" or "km", so the post reads like the task. */
  distance_unit?: "mi" | "km";
};

export type PostResultInput = {
  taskType: string | null | undefined;
  run?: { distance_km: number; duration_min: number } | null;
  workout?: { kind: string; duration_min: number } | null;
  counter?: { count: number; unit_plural: string } | null;
  /** Timers: minutes on the clock (input.value). */
  timerMinutes?: number | null;
  /** Task config `unit` for runs ("mi" | "miles" | "km" | …). */
  configUnit?: unknown;
};

export function distanceUnitFrom(unit: unknown): "mi" | "km" {
  const u = typeof unit === "string" ? unit.trim().toLowerCase() : "";
  return u === "mi" || u === "mile" || u === "miles" ? "mi" : "km";
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

/** Facts for a check-in made in the app. `null` when the type has nothing to show (photo check-off). */
export function postResultFacts(input: PostResultInput): PostResult | null {
  const type = (input.taskType ?? "").toLowerCase();
  if (input.run && input.run.distance_km > 0) {
    return {
      kind: "run",
      distance_km: round(input.run.distance_km, 3),
      duration_min: round(input.run.duration_min, 2),
      distance_unit: distanceUnitFrom(input.configUnit),
    };
  }
  if (input.workout && input.workout.kind) {
    return { kind: "workout", workout_kind: input.workout.kind, duration_min: round(input.workout.duration_min, 2) };
  }
  if (input.counter && Number.isFinite(input.counter.count)) {
    return { kind: "counter", count: input.counter.count, unit: input.counter.unit_plural };
  }
  if (type === "timer" && typeof input.timerMinutes === "number" && input.timerMinutes > 0) {
    return { kind: "timer", duration_min: round(input.timerMinutes, 2) };
  }
  if (type === "journal" || type === "text") return { kind: "journal" };
  return null;
}

/** Facts for a Strava activity (distance in metres, moving_time in seconds). */
export function postResultFromStrava(
  activity: { distance?: number; moving_time?: number; type?: string; sport_type?: string },
  configUnit: unknown,
): PostResult | null {
  const km = typeof activity.distance === "number" ? activity.distance / 1000 : 0;
  const min = typeof activity.moving_time === "number" ? activity.moving_time / 60 : 0;
  if (km > 0 && min > 0) {
    return { kind: "run", distance_km: round(km, 3), duration_min: round(min, 2), distance_unit: distanceUnitFrom(configUnit) };
  }
  if (min > 0) return { kind: "workout", workout_kind: activity.sport_type || activity.type || "Workout", duration_min: round(min, 2) };
  return null;
}

/** Build 92 04.2: exactly one badge per post. */
export type PostBadge = "Verified" | "Verified by Strava" | "Self-reported";

export function postBadgeFrom(md: { verification_method?: unknown; photo_url?: unknown; proof_photo_url?: unknown }): PostBadge {
  if (md.verification_method === "strava_activity") return "Verified by Strava";
  if (md.verification_method === "photo" || (typeof md.proof_photo_url === "string" && md.proof_photo_url)) return "Verified";
  return "Self-reported";
}

export function postResultFromMetadata(md: { result?: unknown }): PostResult | null {
  const r = md.result;
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const kind = (r as { kind?: unknown }).kind;
  if (kind !== "run" && kind !== "workout" && kind !== "counter" && kind !== "timer" && kind !== "journal" && kind !== "check") return null;
  return r as PostResult;
}
