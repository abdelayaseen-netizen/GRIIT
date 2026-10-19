import { gatesFor, gateTimeFor, type TaskModelRow } from "./task-model";

export type DiscoverPreviewTask = {
  title: string;
  gate: string;
  /** Build 92 10.1: raw fields so the card can say what you do ("Run 3 mi · Strava"). */
  task_type?: string | null;
  require_photo?: boolean | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
  config?: { require_strava?: boolean; photo_mode?: string } | null;
  /** How the task is proven, from the same rule as the gates (photo_mode wins over legacy flags). */
  proof?: TaskProofKind;
};

export type TaskProofKind = "strava" | "camera" | "timer" | "counter" | "self";

export function taskProofKind(row: TaskModelRow): TaskProofKind {
  const cfg = (row.config ?? {}) as Record<string, unknown>;
  if (cfg.require_strava === true || cfg.verify === "strava") return "strava";
  if (gatesFor(row).includes("camera")) return "camera";
  const type = (row.task_type ?? "").trim();
  if (type === "timer") return "timer";
  if (type === "counter") return "counter";
  return "self";
}

function cardConfig(raw: unknown): DiscoverPreviewTask["config"] {
  if (!raw || typeof raw !== "object") return null;
  const cfg = raw as Record<string, unknown>;
  return {
    require_strava: cfg.require_strava === true ? true : undefined,
    photo_mode: typeof cfg.photo_mode === "string" ? cfg.photo_mode : undefined,
  };
}

function gateText(row: TaskModelRow): string {
  const gates = gatesFor(row);
  const time = gateTimeFor(row);
  if (gates.length === 0) return "Self-reported";
  const parts: string[] = [];
  if (gates.includes("camera")) parts.push("Camera");
  if (gates.includes("time") && time) {
    const clock = time.mode === "between" ? time.end : time.start;
    if (clock) parts.push(clock);
  }
  if (gates.includes("location")) parts.push("Location");
  return parts.length > 0 ? parts.join(" · ") : "Self-reported";
}

export function discoverPreviewTasks(
  rows: readonly (TaskModelRow & { title?: string | null; order_index?: number | null })[] | null | undefined,
): DiscoverPreviewTask[] {
  return [...(rows ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((row) => ({
      title: (row.title ?? "").trim(),
      gate: gateText(row),
      task_type: row.task_type ?? null,
      require_photo: row.require_photo ?? null,
      gate_time_mode: row.gate_time_mode ?? null,
      gate_time_start: row.gate_time_start ?? null,
      gate_time_end: row.gate_time_end ?? null,
      config: cardConfig(row.config),
      proof: taskProofKind(row),
    }))
    .filter((row) => row.title.length > 0);
}

export function difficultyChip(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (value === "hard" || value === "extreme") return "Strict";
  if (value === "easy") return "Easy";
  return "Standard";
}
