/**
 * Client-side date helpers: local keys, streak windows, and display formatting.
 * Prefer `timezone` from profiles when available so keys match the backend RPC.
 */

function formatDateKeyInTimeZone(isoInstant: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const s = formatter.format(isoInstant);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : isoInstant.toISOString().slice(0, 10);
}

/** ISO date string for today (YYYY-MM-DD) in the given IANA timezone; defaults to UTC. */
export function getTodayDateKey(timezone?: string | null): string {
  const tz = timezone?.trim() || "UTC";
  try {
    return formatDateKeyInTimeZone(new Date(), tz);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** ISO date string for yesterday (YYYY-MM-DD) in the given timezone. */
export function getYesterdayDateKey(timezone?: string | null): string {
  const today = getTodayDateKey(timezone);
  const [y, m, d] = today.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${today}`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

function addCalendarDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

/** Count how many of the last 7 calendar days (in `timezone`) appear in `securedDateKeys`. */
export function countSecuredLast7Days(securedDateKeys: string[], timezone?: string | null): number {
  const todayKey = getTodayDateKey(timezone);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const k = addCalendarDaysToDateKey(todayKey, -i);
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
