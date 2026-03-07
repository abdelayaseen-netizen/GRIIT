/**
 * Client-side date key helpers. Use for "today" / "yesterday" in UI and local logic.
 * Backend uses backend/lib/date-utils.ts for server-side keys.
 */

/** ISO date string for today (YYYY-MM-DD) in local timezone via ISO slice. */
export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

/** ISO date string for yesterday (YYYY-MM-DD). */
export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
