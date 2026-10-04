import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { visibilityLabel, REVIEW_PHOTOS_LINE } from "@/backend/lib/create-visibility";
import { displayCategory } from "@/lib/challenge-category";
import { gateLabel } from "@/lib/task-ui";

export const START_THE_CHALLENGE = "Start the challenge";
export const REVIEW_LOCK = "You can't change the tasks after Day 1.";
export const REVIEW_STARTS_TODAY = "Today";
export const REVIEW_EACH_DAY = "Each day";
export const REVIEW_SETTINGS = "Settings";

export function reviewModeLabel(difficulty: "standard" | "hard"): string {
  return difficulty === "hard" ? "No Days Off" : "Standard";
}

export function reviewTitleLine(args: {
  category: string | null | undefined;
  days: number;
  who: "solo" | "group";
  difficulty: "standard" | "hard";
}): string {
  const who = args.who === "group" ? "Group" : "Solo";
  return `${displayCategory(args.category)} · ${args.days} days · ${who} · ${reviewModeLabel(args.difficulty)}`;
}

export function reviewTaskLine(task: {
  name: string;
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
  requirePhoto?: boolean;
}): { name: string; proof: string } {
  return { name: task.name.trim() || "Task", proof: gateLabel(task) };
}

export function reviewSettingsRows(args: {
  visibility: string;
  starts: string;
}): { label: string; value: string }[] {
  return [
    { label: "Visibility", value: visibilityLabel(args.visibility) },
    { label: "Photos", value: REVIEW_PHOTOS_LINE },
    { label: "Starts", value: args.starts },
  ];
}
