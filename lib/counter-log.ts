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
