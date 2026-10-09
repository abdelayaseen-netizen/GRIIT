import { gatesFor, gateTimeFor, type TaskModelRow } from "./task-model";

export type DiscoverPreviewTask = { title: string; gate: string };

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
  rows: readonly (TaskModelRow & { title?: string | null })[] | null | undefined,
): DiscoverPreviewTask[] {
  return (rows ?? [])
    .map((row) => ({
      title: (row.title ?? "").trim(),
      gate: gateText(row),
    }))
    .filter((row) => row.title.length > 0);
}

export function difficultyChip(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (value === "hard" || value === "extreme") return "Hard";
  if (value === "easy") return "Easy";
  return "Standard";
}
