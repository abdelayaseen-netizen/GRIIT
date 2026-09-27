import { isTaskRequired, type ChallengeTaskRowRaw } from "@/backend/lib/challenge-tasks";
import { gatesFor } from "@/backend/lib/task-model";
import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";
import { taskDisplayName } from "@/lib/home-proof-card";

export type GateKind = "camera" | "time_window" | "location";

export type Gate =
  | { kind: "camera" }
  | { kind: "time_window"; label: string }
  | { kind: "location" };

export type DetailState = "default" | "free_limit" | "ended" | "not_live";

export type DetailTask = {
  task_type?: string | null;
  type?: string | null;
  require_photo?: boolean | null;
  require_location?: boolean | null;
  required?: boolean | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
  config?: {
    required?: boolean | null;
    require_camera_only?: boolean | null;
    require_photo_proof?: boolean | null;
    photo_required?: boolean | null;
    require_photo?: boolean | null;
    schedule_window_start?: string | null;
    schedule_window_end?: string | null;
    require_location?: boolean | null;
    gate_time_mode?: string | null;
    gate_time_start?: string | null;
    gate_time_end?: string | null;
  } | null;
};

export type DetailChallenge = {
  ends_at?: string | null;
  live_date?: string | null;
  duration_type?: string | null;
  /** challenges.status: draft | published | archived | rejected */
  status?: string | null;
  /** challenges.run_status: waiting | active | completed | failed */
  run_status?: string | null;
};

/** Catalog statuses that are not joinable. Enum: draft | published | archived | rejected. */
const ENDED_STATUS = new Set(["archived", "rejected", "cancelled", "canceled"]);
/** Run statuses that are over. Enum: waiting | active | completed | failed. */
const ENDED_RUN_STATUS = new Set(["completed", "failed"]);

function isClosedChallenge(challenge: DetailChallenge): boolean {
  const status = (challenge.status ?? "").trim().toLowerCase();
  const run = (challenge.run_status ?? "").trim().toLowerCase();
  return ENDED_STATUS.has(status) || ENDED_RUN_STATUS.has(run);
}

export type ParticipationType = "solo" | "duo" | "team";

export type ChallengeDetailTask = {
  title: string;
  task_type: string;
  gates: GateKind[];
  time_window?: string;
  required: boolean;
};

export const OPTIONAL_TASK_LABEL = "Optional";

/** Same rule as Home / secure_day / tasksDueOnDay enrollments. */
export function detailTaskRequired(task: DetailTask): boolean {
  if (task.required === false) return false;
  return isTaskRequired({ config: task.config } as ChallengeTaskRowRaw);
}

const MS_DAY = 24 * 60 * 60 * 1000;

function parseHHMM(raw: string): { hours: number; minutes: number } | null {
  const parts = raw.trim().split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1] ?? "0");
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function clockParts(raw: string): { display: string; period: "am" | "pm" } | null {
  const parsed = parseHHMM(raw);
  if (!parsed) return null;
  const period = parsed.hours >= 12 ? "pm" : "am";
  const h12 = parsed.hours % 12 || 12;
  const display = parsed.minutes === 0 ? String(h12) : `${h12}:${String(parsed.minutes).padStart(2, "0")}`;
  return { display, period };
}

/** "6–9am" when both bounds share a period; "11am–2pm" when they do not. */
export function formatTimeWindow(start: string, end: string): string | null {
  const a = clockParts(start);
  const b = clockParts(end);
  if (!a || !b) return null;
  if (a.period === b.period) return `${a.display}–${b.display}${a.period}`;
  return `${a.display}${a.period}–${b.display}${b.period}`;
}

export function taskGates(task: DetailTask): Gate[] {
  const config = task.config ?? {};
  const model = gatesFor({
    task_type: task.task_type ?? task.type,
    require_photo: task.require_photo === true,
    require_location: task.require_location === true,
    gate_time_mode: task.gate_time_mode ?? config.gate_time_mode,
    gate_time_start: task.gate_time_start ?? config.gate_time_start ?? config.schedule_window_start,
    gate_time_end: task.gate_time_end ?? config.gate_time_end ?? config.schedule_window_end,
    config: {
      require_photo_proof:
        config.require_photo_proof === true || config.require_camera_only === true,
      photo_required: config.photo_required === true,
      require_photo: config.require_photo === true,
      require_location: config.require_location === true,
    },
  });
  const gates: Gate[] = [];

  if (model.includes("camera")) {
    gates.push({ kind: "camera" });
  }

  const start = (
    task.gate_time_start ??
    config.gate_time_start ??
    config.schedule_window_start ??
    ""
  ).trim();
  const end = (
    task.gate_time_end ??
    config.gate_time_end ??
    config.schedule_window_end ??
    ""
  ).trim();
  if (model.includes("time") || (start && end)) {
    const label = start && end ? formatTimeWindow(start, end) : null;
    if (label) gates.push({ kind: "time_window", label });
  }

  if (model.includes("location")) {
    gates.push({ kind: "location" });
  }

  return gates;
}

function parseInstant(raw: string | null | undefined): number | null {
  if (!raw || !raw.trim()) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function detailState(
  challenge: DetailChallenge,
  myActiveCount: number,
  freeLimit: number = FREE_ACTIVE_CHALLENGES_LIMIT,
  now: Date = new Date(),
): DetailState {
  if (isClosedChallenge(challenge)) return "ended";

  const nowMs = now.getTime();
  const endsAt = parseInstant(challenge.ends_at);
  const liveAt = parseInstant(challenge.live_date);
  const twentyFourHour = challenge.duration_type === "24h";
  const livePlusDay = liveAt != null ? liveAt + MS_DAY : null;

  const ended = (endsAt != null && endsAt < nowMs) || (twentyFourHour && livePlusDay != null && livePlusDay < nowMs);
  if (ended) return "ended";

  if (liveAt != null && liveAt > nowMs) return "not_live";

  if (myActiveCount >= freeLimit) return "free_limit";

  return "default";
}

/**
 * Spec (griit_brand/briefs/15/cursor/02_screens.md — Challenge detail, not joined):
 * solo → "Day 1 is today."
 * duo/team → "Join opens the invite step. You need a partner before Day 1."
 * Invite step does not exist yet. Restore JOIN_CAPTION_INVITE when it lands.
 */
export const JOIN_CAPTION_TODAY = "Day 1 is today.";
export const JOIN_CAPTION_TOMORROW = "Day 1 begins tomorrow morning.";
export const JOIN_CAPTION_INVITE =
  "Join opens the invite step. You need a partner before Day 1.";

/** start_at local date == today → today copy; else tomorrow morning. */
export function day1StartCopy(
  startAtIso: string | null | undefined,
  timeZone: string,
  now: Date = new Date(),
): string {
  if (!startAtIso) return JOIN_CAPTION_TOMORROW;
  const tz = timeZone.trim() || "UTC";
  const startKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(startAtIso));
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return startKey === todayKey ? JOIN_CAPTION_TODAY : JOIN_CAPTION_TOMORROW;
}

export function joinCaption(
  _participationType: ParticipationType,
  startAtIso?: string | null,
  timeZone?: string,
): string {
  if (startAtIso && timeZone) return day1StartCopy(startAtIso, timeZone);
  return JOIN_CAPTION_TODAY;
}

export function mapParticipationType(raw: string | null | undefined): ParticipationType {
  const s = (raw ?? "solo").toLowerCase();
  if (s === "duo") return "duo";
  if (s === "team" || s === "shared_goal") return "team";
  return "solo";
}

/** Spec ends_on / starts_on: "12 August". */
export function formatChallengeDate(raw: string | null | undefined): string | undefined {
  const ms = parseInstant(raw);
  if (ms == null) return undefined;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(new Date(ms));
}

export function toDetailTasks(
  tasks: (DetailTask & {
    title?: string | null;
    type?: string | null;
    task_type?: string | null;
  })[],
): ChallengeDetailTask[] {
  return tasks.map((t) => {
    const gates = taskGates(t);
    const windowGate = gates.find(
      (g): g is { kind: "time_window"; label: string } => g.kind === "time_window",
    );
    return {
      title: taskDisplayName({
        title: t.title,
        type: t.task_type ?? t.type,
        requirePhoto: t.require_photo === true,
      }),
      task_type: String(t.task_type ?? t.type ?? ""),
      gates: gates.map((g) => g.kind),
      time_window: windowGate?.label,
      required: detailTaskRequired(t),
    };
  });
}
