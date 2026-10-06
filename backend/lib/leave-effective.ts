import { addCalendarDaysToDateKey, dateKeyInTimeZone } from "./date-utils";

/** UTC instant of the next local midnight after `now`. */
export function nextLocalMidnightIso(now: Date, timeZone: string): string {
  const tz = timeZone.trim() || "UTC";
  const today = dateKeyInTimeZone(now, tz);
  const tomorrow = addCalendarDaysToDateKey(today, 1);
  const [y, m, d] = tomorrow.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${tomorrow}`);
  }
  let lo = Date.UTC(y, m - 1, d, 0, 0, 0) - 16 * 3600 * 1000;
  let hi = Date.UTC(y, m - 1, d, 0, 0, 0) + 16 * 3600 * 1000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const key = dateKeyInTimeZone(new Date(mid), tz);
    if (key < tomorrow) lo = mid + 1;
    else hi = mid;
  }
  return new Date(lo).toISOString();
}

/** True once that instant has arrived on the user's calendar. */
export function leaveHasPassed(args: {
  leaveEffectiveAt: string;
  now: Date;
  timeZone: string;
}): boolean {
  const at = new Date(args.leaveEffectiveAt);
  if (Number.isNaN(at.getTime())) return false;
  const tz = args.timeZone.trim() || "UTC";
  if (args.now.getTime() < at.getTime()) return false;
  const nowKey = dateKeyInTimeZone(args.now, tz);
  const atKey = dateKeyInTimeZone(at, tz);
  return nowKey >= atKey;
}
