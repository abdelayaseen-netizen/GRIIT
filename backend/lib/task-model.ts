/**
 * Read-time task model: five types, three gates.
 * Heart rate is dormant. routine_anchor is copy/reminder only. Timer
 * strictness lives on the type's config, never on the gate line.
 */

export const TASK_MODEL_TYPES = ["check_off", "timer", "counter", "text", "run"] as const;
export type TaskModelType = (typeof TASK_MODEL_TYPES)[number];

export const TASK_GATES = ["camera", "time", "location"] as const;
export type TaskGate = (typeof TASK_GATES)[number];

export type GateTime = {
  mode: "by" | "between" | null;
  start: string | null;
  end: string | null;
};

export type TaskModelRow = {
  task_type?: string | null;
  type?: string | null;
  require_photo?: boolean | null;
  require_location?: boolean | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
  min_duration_minutes?: number | null;
  config?: {
    require_photo_proof?: boolean | null;
    photo_required?: boolean | null;
    require_photo?: boolean | null;
    require_location?: boolean | null;
    duration_minutes?: number | null;
  } | null;
};

export type TaskModelOverlay = {
  task_type: string;
  type: TaskModelType;
  gates: TaskGate[];
  gateTime: GateTime;
};

/** Nested challenge_tasks select: raw columns plus Time gate. No heart-rate. */
export const CHALLENGE_TASK_SELECT =
  "id, title, task_type, order_index, config, target_mode, start_value, start_duration_minutes, routine_anchor, routine_anchor_custom, require_photo, require_location, gate_time_mode, gate_time_start, gate_time_end";

function rawType(row: TaskModelRow): string {
  return String(row.task_type ?? row.type ?? "manual").toLowerCase();
}

function hasDuration(row: TaskModelRow): boolean {
  const mins = row.min_duration_minutes ?? row.config?.duration_minutes;
  return typeof mins === "number" && mins > 0;
}

export function isTaskModelType(type: string): type is TaskModelType {
  return (TASK_MODEL_TYPES as readonly string[]).includes(type);
}

/** Handoff mapping table — existing rows keep working; no SQL backfill. */
export function normalizeTaskType(row: TaskModelRow): TaskModelType {
  const t = rawType(row);
  if (t === "check_off" || t === "simple" || t === "checkin" || t === "manual" || t === "photo") {
    return "check_off";
  }
  if (t === "timer") return "timer";
  if (t === "workout") return hasDuration(row) ? "timer" : "check_off";
  if (t === "journal" || t === "text") return "text";
  if (t === "counter" || t === "water" || t === "reading") return "counter";
  if (t === "run") return "run";
  return "check_off";
}

/** Ordered camera, then time, then location. routine_anchor is never a gate. */
export function gatesFor(row: TaskModelRow): TaskGate[] {
  const gates: TaskGate[] = [];
  const t = rawType(row);
  const cfg = row.config ?? {};
  const camera =
    t === "photo" ||
    row.require_photo === true ||
    cfg.require_photo_proof === true ||
    cfg.photo_required === true ||
    cfg.require_photo === true;
  if (camera) gates.push("camera");

  const mode = typeof row.gate_time_mode === "string" ? row.gate_time_mode.trim() : "";
  if (mode === "by" || mode === "between") gates.push("time");

  const location = row.require_location === true || cfg.require_location === true;
  if (location) gates.push("location");
  return gates;
}

export function verificationMethodFor(gates: readonly TaskGate[]): "photo" | "self_reported" {
  return gates.includes("camera") ? "photo" : "self_reported";
}

export function gateTimeFor(row: TaskModelRow): GateTime {
  const raw = typeof row.gate_time_mode === "string" ? row.gate_time_mode.trim() : "";
  const mode = raw === "by" || raw === "between" ? raw : null;
  return {
    mode,
    start: typeof row.gate_time_start === "string" && row.gate_time_start.trim() ? row.gate_time_start : null,
    end: typeof row.gate_time_end === "string" && row.gate_time_end.trim() ? row.gate_time_end : null,
  };
}

export function overlayTaskModel<T extends Record<string, unknown>>(
  row: T,
  source?: TaskModelRow
): T & TaskModelOverlay {
  const from = source ?? (row as TaskModelRow);
  return {
    ...row,
    task_type: String(from.task_type ?? from.type ?? "manual"),
    type: normalizeTaskType(from),
    gates: gatesFor(from),
    gateTime: gateTimeFor(from),
  };
}
