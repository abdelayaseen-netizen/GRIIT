/** Counter · Secured copy helpers (task-states-v2). */

export function formatCounterSecuredMeta(
  count: number,
  target: number,
  unitPlural: string
): string {
  const n = Math.max(0, Math.round(count));
  const t = Math.max(0, Math.round(target));
  const unit = unitPlural.trim() || "units";
  return `${n} of ${t} ${unit}`;
}

/** Caption unit after a counter goal: "10 / 10 pages". */
export function counterUnitFromTaskType(taskType: string): "pages" | "oz" | "count" {
  if (taskType === "reading") return "pages";
  if (taskType === "water") return "oz";
  return "count";
}

export function counterGoalCaption(count: number, goal: number, unit: string): string {
  return `${count} / ${goal} ${unit}`;
}
