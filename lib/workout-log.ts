/** Workout · Session / Secured copy helpers (task-states-v2). */

/** Secured meta — `{Kind} · {actual} min` for both entry modes. */
export function formatWorkoutSecuredMeta(kind: string, durationMin: number): string {
  const k = kind.trim() || "Workout";
  const actual = Math.max(0, Math.round(durationMin));
  return `${k} · ${actual} min`;
}
