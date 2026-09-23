/**
 * Today / Active challenge "Day {n} of {N}".
 * n = calendar days from local start to local today, inclusive, clamped to N.
 * N = challenges.duration_days. target_streak is not used.
 * Missing or non-positive duration → "Day {n}" with no "of".
 */
export function homeDayTotal(durationDays: number | null | undefined): number | null {
  if (durationDays == null || !Number.isFinite(durationDays) || durationDays <= 0) return null;
  return Math.floor(durationDays);
}

/** Inclusive local-day count from startKey to todayKey. Floors at 1. */
export function dateKeyFromIso(iso: string, timeZone: string): string {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return iso.slice(0, 10);
  const tz = timeZone.trim() || "UTC";
  try {
    const s = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(instant);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : instant.toISOString().slice(0, 10);
  } catch {
    return instant.toISOString().slice(0, 10);
  }
}

export function calendarDayCount(startDateKey: string, todayKey: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateKey) || !/^\d{4}-\d{2}-\d{2}$/.test(todayKey)) {
    return 1;
  }
  if (todayKey <= startDateKey) return 1;
  const [ys, ms, ds] = startDateKey.split("-").map(Number);
  const [yt, mt, dt] = todayKey.split("-").map(Number);
  if ([ys, ms, ds, yt, mt, dt].some((n) => n == null || Number.isNaN(n))) return 1;
  const start = Date.UTC(ys!, ms! - 1, ds);
  const today = Date.UTC(yt!, mt! - 1, dt);
  const n = Math.floor((today - start) / 86400000) + 1;
  return n > 0 ? n : 1;
}

export function clampCalendarDay(
  day: number,
  durationDays: number | null | undefined,
): number {
  const raw = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  const total = homeDayTotal(durationDays);
  if (total == null) return raw;
  return Math.min(raw, total);
}

/** Calendar position in the user's tz, clamped to N. */
export function calendarDay(
  startDateKey: string,
  todayKey: string,
  durationDays: number | null | undefined,
): number {
  return clampCalendarDay(calendarDayCount(startDateKey, todayKey), durationDays);
}

/** v28.2 / v35: every on-screen Day n is this reduction — never current_day or event index. */
export function calendarDayFromStartAt(
  startAt: string | null | undefined,
  timeZone: string,
  todayKey: string,
  durationDays?: number | null,
): number {
  const startKey = startAt ? dateKeyFromIso(startAt, timeZone) : todayKey;
  return calendarDay(startKey, todayKey, durationDays);
}

export function homeDayLine(day: number, durationDays: number | null | undefined): string {
  const n = clampCalendarDay(day, durationDays);
  const total = homeDayTotal(durationDays);
  if (total == null) return `Day ${n}`;
  return `Day ${n} of ${total}`;
}
