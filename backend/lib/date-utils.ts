/**
 * Shared date key helpers. Use for consistency and to avoid duplicated logic.
 * Date keys are YYYY-MM-DD strings aligned to the user's IANA timezone when provided; otherwise UTC.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

/** Calendar arithmetic on YYYY-MM-DD strings (naive date, no DST on the string itself). */
export function addCalendarDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

export function formatDateKeyInTimeZone(isoInstant: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const s = formatter.format(isoInstant);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : isoInstant.toISOString().slice(0, 10);
}

export function getTodayDateKey(timezone?: string | null): string {
  const tz = (timezone?.trim() || "UTC");
  try {
    return formatDateKeyInTimeZone(new Date(), tz);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function getYesterdayDateKey(timezone?: string | null): string {
  return addCalendarDaysToDateKey(getTodayDateKey(timezone), -1);
}

export function getTomorrowDateKey(timezone?: string | null): string {
  return addCalendarDaysToDateKey(getTodayDateKey(timezone), 1);
}

/**
 * First calendar day of the rolling 7-day window including today (in the given timezone).
 * Matches secure_day RPC window logic for streak stands.
 */
export function getRollingWeekStartDateKey(timezone?: string | null): string {
  const today = getTodayDateKey(timezone);
  return addCalendarDaysToDateKey(today, -6);
}

/**
 * Profile IANA timezone for date_key derivation. Falls back to reminder_timezone, then UTC.
 */
export async function getProfileTimeZoneForUser(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("timezone, reminder_timezone")
    .eq("user_id", userId)
    .maybeSingle();
  const row = data as { timezone?: string | null; reminder_timezone?: string | null } | null;
  const tz = row?.timezone?.trim() || row?.reminder_timezone?.trim();
  return tz || "UTC";
}

/** An instant that falls on the given calendar date in `timeZone` (for weekday math). */
function instantOnDateKeyInZone(dateKey: string, timeZone: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const base = Date.UTC(y, m - 1, d, 12, 0, 0);
  for (let h = -14; h <= 14; h++) {
    const cand = new Date(base + h * 3600 * 1000);
    if (fmt.format(cand) === dateKey) return cand;
  }
  return new Date(base);
}

/**
 * Monday (ISO week) of the calendar week containing `date`, in the given timezone.
 */
export function getWeekStartDateKey(date: Date = new Date(), timeZone?: string | null): string {
  const tz = timeZone?.trim() || "UTC";
  try {
    const todayKey = formatDateKeyInTimeZone(date, tz);
    const inst = instantOnDateKeyInZone(todayKey, tz);
    const wd =
      new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).formatToParts(inst).find((p) => p.type === "weekday")
        ?.value ?? "Mon";
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = map[wd] ?? 1;
    const diff = day === 0 ? 6 : day - 1;
    return addCalendarDaysToDateKey(todayKey, -diff);
  } catch {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setUTCDate(d.getUTCDate() - diff);
    return d.toISOString().slice(0, 10);
  }
}

/** Sunday of the week for the given date, in the given timezone. Returns YYYY-MM-DD. */
export function getWeekEndDateKey(date: Date = new Date(), timeZone?: string | null): string {
  const start = getWeekStartDateKey(date, timeZone);
  return addCalendarDaysToDateKey(start, 6);
}

export function dateKeyFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse YYYY-MM-DD to Date at midnight local time (matches streak/freeze "yesterday" logic). */
export function parseDateKey(key: string): Date {
  const parts = key.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const day = parts[2];
  if (y === undefined || m === undefined || day === undefined) {
    throw new Error(`Invalid date key: ${key}`);
  }
  return new Date(y, m - 1, day);
}

/**
 * Date keys between start (exclusive) and end (inclusive). start and end are YYYY-MM-DD.
 * Used for streak missed-days and profile getStats.
 */
/** Start/end are YYYY-MM-DD in the same calendar; inclusive index (same day = 1). */
export function calendarDayIndexInclusive(startDateKey: string, endDateKey: string): number {
  const [y1, m1, d1] = startDateKey.split("-").map(Number);
  const [y2, m2, d2] = endDateKey.split("-").map(Number);
  if (
    y1 === undefined ||
    m1 === undefined ||
    d1 === undefined ||
    y2 === undefined ||
    m2 === undefined ||
    d2 === undefined
  ) {
    return 1;
  }
  const u1 = Date.UTC(y1, m1 - 1, d1);
  const u2 = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((u2 - u1) / 86400000) + 1;
}

/** UTC date key for an ISO instant rendered in `timeZone` (same helper as streak / check-ins). */
export function dateKeyFromIsoInTimeZone(iso: string, timeZone: string): string {
  try {
    return formatDateKeyInTimeZone(new Date(iso), timeZone);
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}

export function daysBetweenKeys(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    out.push(dateKeyFromDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
