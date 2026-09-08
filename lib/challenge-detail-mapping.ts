import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";

export type GateKind = "camera" | "time_window" | "location";

export type Gate =
  | { kind: "camera" }
  | { kind: "time_window"; label: string }
  | { kind: "location" };

export type DetailState = "default" | "free_limit" | "ended" | "not_live";

export type DetailTask = {
  require_photo?: boolean | null;
  require_location?: boolean | null;
  config?: {
    require_camera_only?: boolean | null;
    schedule_window_start?: string | null;
    schedule_window_end?: string | null;
    require_location?: boolean | null;
  } | null;
};

export type DetailChallenge = {
  ends_at?: string | null;
  live_date?: string | null;
  duration_type?: string | null;
};

export type ParticipationType = "solo" | "duo" | "team";

export type ChallengeDetailTask = {
  title: string;
  task_type: string;
  gates: GateKind[];
  time_window?: string;
};

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
  const gates: Gate[] = [];

  if (task.require_photo === true || config.require_camera_only === true) {
    gates.push({ kind: "camera" });
  }

  const start = typeof config.schedule_window_start === "string" ? config.schedule_window_start.trim() : "";
  const end = typeof config.schedule_window_end === "string" ? config.schedule_window_end.trim() : "";
  if (start && end) {
    const label = formatTimeWindow(start, end);
    if (label) gates.push({ kind: "time_window", label });
  }

  if (task.require_location === true || config.require_location === true) {
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
export const JOIN_CAPTION_INVITE =
  "Join opens the invite step. You need a partner before Day 1.";

export function joinCaption(_participationType: ParticipationType): string {
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
  tasks: Array<
    DetailTask & {
      title?: string | null;
      type?: string | null;
      task_type?: string | null;
    }
  >,
): ChallengeDetailTask[] {
  return tasks.map((t) => {
    const gates = taskGates(t);
    const windowGate = gates.find(
      (g): g is { kind: "time_window"; label: string } => g.kind === "time_window",
    );
    return {
      title: (t.title ?? "").trim() || "Task",
      task_type: String(t.task_type ?? t.type ?? ""),
      gates: gates.map((g) => g.kind),
      time_window: windowGate?.label,
    };
  });
}
