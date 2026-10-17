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

/**
 * Caption unit after a counter goal. Generic counter has no default word.
 * Water is "cups" everywhere (06 bug: the app said oz, the server said cups for the same
 * 8-a-day target). A task's own `config.unit` still wins in `counterDisplayUnit`.
 */
export const WATER_UNIT = "cups";

export function counterUnitFromTaskType(taskType: string): "pages" | typeof WATER_UNIT | "" {
  if (taskType === "reading") return "pages";
  if (taskType === "water") return WATER_UNIT;
  return "";
}

export function counterDisplayUnit(
  taskType: string,
  config?: { unit?: string; unit_label?: string; target_unit?: string },
): string {
  for (const raw of [config?.unit, config?.unit_label, config?.target_unit]) {
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return counterUnitFromTaskType(taskType);
}

export function counterGoalCaption(count: number, goal: number, unit: string): string {
  return `${count} / ${goal} ${unit}`;
}
