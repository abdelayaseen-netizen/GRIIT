import { gatesFor, gateTimeFor, type TaskModelRow } from "@/backend/lib/task-model";
import { gateLabel } from "@/lib/task-ui";

export type DiscoverPreviewTask = { title: string; gate: string };

export function discoverPreviewTasks(
  rows: readonly (TaskModelRow & { title?: string | null })[] | null | undefined,
): DiscoverPreviewTask[] {
  return (rows ?? [])
    .map((row) => ({
      title: (row.title ?? "").trim(),
      gate: gateLabel({ gates: gatesFor(row), gateTime: gateTimeFor(row) }),
    }))
    .filter((row) => row.title.length > 0);
}

export function difficultyChip(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (value === "hard" || value === "extreme") return "Hard";
  if (value === "easy") return "Easy";
  return "Standard";
}
