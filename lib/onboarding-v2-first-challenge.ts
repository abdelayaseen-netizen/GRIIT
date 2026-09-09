import { formatTimeWindow, taskGates, type DetailTask } from "@/lib/challenge-detail-mapping";
import { todayCardGateLabel } from "@/lib/today-card";
import { GOAL_LABELS } from "@/lib/goal-challenge-map";
import type { OnboardingGoal } from "@/store/onboardingStore";

export const HARD_MODE_LINE = "Hard mode. Gates are enforced; a failed gate fails the day.";
export const STANDARD_MODE_LINE = "Standard mode. Gates are recorded, not enforced.";

export type SuggestionTask = {
  title?: string | null;
  require_photo?: boolean | null;
  require_location?: boolean | null;
  config?: DetailTask["config"];
};

export function participationLabel(pt: string | null | undefined): "Solo" | "Duo" | "Team" {
  const v = String(pt ?? "solo").toLowerCase();
  if (v === "duo") return "Duo";
  if (v === "team" || v === "shared_goal") return "Team";
  return "Solo";
}

export function modeLine(isHard: boolean): string {
  return isHard ? HARD_MODE_LINE : STANDARD_MODE_LINE;
}

export function suggestionTaskLine(task: SuggestionTask): { name: string; gate: string } {
  const gates = taskGates({
    require_photo: task.require_photo,
    require_location: task.require_location,
    config: task.config,
  });
  const windowGate = gates.find((g) => g.kind === "time_window");
  const time_window = windowGate && windowGate.kind === "time_window" ? windowGate.label : "";
  return {
    name: (task.title ?? "").trim() || "Task",
    gate: todayCardGateLabel({ gates: gates.map((g) => g.kind), time_window }),
  };
}

export function goalCataloguePhrase(goals: readonly OnboardingGoal[]): string {
  const labels = goals.map((g) => (GOAL_LABELS[g] ?? g).toLowerCase());
  if (labels.length === 0) return "your goals";
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export function noMatchSubtitle(goals: readonly OnboardingGoal[]): string {
  return `Nothing in the catalogue matches ${goalCataloguePhrase(goals)} yet.`;
}

export { formatTimeWindow };
