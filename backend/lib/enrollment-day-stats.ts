/**
 * One count for every screen: days done, secured, and due for one enrollment.
 * The numerator is never larger than the denominator.
 */
import { addCalendarDaysToDateKey } from "./date-utils";
import { calendarDay, dateKeyFromIso, homeDayTotal, shownChallengeDay } from "./calendar-day";

export type EnrollmentDayStats = {
  day: number;
  total: number;
  done: number;
  secured: number;
  due: number;
  line: string;
};

export function enrollmentDayStats(input: {
  startAt?: string | null;
  startDateKey?: string | null;
  timeZone: string;
  todayKey: string;
  durationDays?: number | null;
  securedDateKeys?: readonly string[];
}): EnrollmentDayStats {
  const total = homeDayTotal(input.durationDays ?? null) ?? 1;
  const startKey =
    input.startDateKey && /^\d{4}-\d{2}-\d{2}$/.test(input.startDateKey)
      ? input.startDateKey
      : input.startAt
        ? dateKeyFromIso(input.startAt, input.timeZone)
        : input.todayKey;
  const day = input.startAt
    ? shownChallengeDay(input.startAt, input.timeZone, input.todayKey, total)
    : calendarDay(startKey, input.todayKey, total);
  const last = addCalendarDaysToDateKey(startKey, Math.max(0, total - 1));
  const through = last < input.todayKey ? last : input.todayKey;
  const securedSet = new Set((input.securedDateKeys ?? []).filter(Boolean));
  let due = 0;
  let secured = 0;
  if (startKey && through && startKey <= through) {
    let cursor = startKey;
    for (let guard = 0; guard < total + 2 && cursor <= through; guard += 1) {
      const countThis = cursor < input.todayKey || securedSet.has(cursor);
      if (countThis) {
        due += 1;
        if (securedSet.has(cursor)) secured += 1;
      }
      if (cursor === through) break;
      cursor = addCalendarDaysToDateKey(cursor, 1);
    }
  }
  if (secured > due) secured = due;
  const done = due;
  const line = `${secured} of ${due === 1 ? "1 day" : `${due} days`}`;
  return { day, total, done, secured, due, line };
}
