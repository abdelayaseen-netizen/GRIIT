/** Run · Log / Secured copy helpers (task-states-v2). */

export const RUN_LOG_HELPER = "or run the in-app timer" as const;

/** Format km for secured meta (trim trailing zeros). */
export function formatRunKm(km: number): string {
  if (!Number.isFinite(km)) return "0";
  const rounded = Math.round(km * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/** Secured meta — `{km} · {min}` for both hand and timer entry modes. */
export function formatRunSecuredMeta(distanceKm: number, durationMin: number): string {
  const km = formatRunKm(distanceKm);
  const min = Math.max(0, Math.round(durationMin));
  return `${km} km · ${min} min`;
}
