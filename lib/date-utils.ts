/**
 * Client-side date helpers: local keys, streak windows, and display formatting.
 * Backend uses backend/lib/date-utils.ts for server-side keys.
 */

/** ISO date string for today (YYYY-MM-DD) in local timezone via ISO slice. */
export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO date string for yesterday (YYYY-MM-DD). */
export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Count how many of the last 7 local calendar days appear in `securedDateKeys` (YYYY-MM-DD). */
export function countSecuredLast7Days(securedDateKeys: string[]): number {
  const today = new Date();
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (securedDateKeys.includes(k)) n += 1;
  }
  return n;
}

// ─── Display formatting (merged from former date-format.ts) ───────────────

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
}

/** Short month name e.g. "Jan" for calendar labels. */
export function formatMonthShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short" });
}
