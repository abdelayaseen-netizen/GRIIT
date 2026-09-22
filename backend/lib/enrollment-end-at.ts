/**
 * E1: day-count last day = local start date + duration_days − 1, 23:59:59.999 local.
 * 24h stays clock-based start + 24 hours.
 */
import { addCalendarDaysToDateKey, dateKeyInTimeZone } from "./date-utils";

export function enrollmentEndAt(input: {
  startAt: Date;
  durationDays: number | null | undefined;
  durationType?: string | null;
  timeZone: string;
}): Date {
  if (input.durationType === "24h") {
    return new Date(input.startAt.getTime() + 24 * 60 * 60 * 1000);
  }
  const days =
    input.durationDays != null && Number.isFinite(input.durationDays) && input.durationDays > 0
      ? Math.floor(input.durationDays)
      : 1;
  const tz = input.timeZone.trim() || "UTC";
  const startKey = dateKeyInTimeZone(input.startAt, tz);
  const lastKey = addCalendarDaysToDateKey(startKey, days - 1);
  const nextKey = addCalendarDaysToDateKey(lastKey, 1);
  return new Date(localMidnightUtc(nextKey, tz).getTime() - 1);
}

export function enrollmentIsPastEnd(endAt: Date, now: Date): boolean {
  return now.getTime() > endAt.getTime();
}

export function localMidnightUtc(dateKey: string, timeZone: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y == null || m == null || d == null) throw new Error(`Invalid date key: ${dateKey}`);
  let utc = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  for (let i = 0; i < 8; i++) {
    const seen = localYmdHms(new Date(utc), timeZone);
    const want = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
    const got = Date.UTC(seen.y, seen.m - 1, seen.d, seen.h, seen.min, seen.s, 0);
    const delta = want - got;
    if (delta === 0) break;
    utc += delta;
  }
  return new Date(utc);
}

function localYmdHms(instant: Date, timeZone: string): {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
  s: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  let h = get("hour");
  if (h === 24) h = 0;
  return { y: get("year"), m: get("month"), d: get("day"), h, min: get("minute"), s: get("second") };
}
