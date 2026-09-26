/**
 * One reduction for a finished run's "X of Y".
 * X = securedElapsed.secured over [start, exclusiveEnd).
 * Y = days in that window (elapsed). Completed → Y equals duration.
 */
import { addCalendarDaysToDateKey } from "./date-utils";
import { dueKeysForRange, RECORD_WINDOW_STATUSES } from "./due-keys";
import { exclusiveEndDateKey } from "./record-days";
import { securedElapsed } from "./secured-elapsed";
import { dateKeyFromIso } from "./calendar-day";

export type FinishedRunScore = {
  secured: number;
  elapsed: number;
  dueDayKeys: string[];
};

export function finishedExclusiveEndDateKey(args: {
  startDateKey: string;
  exclusiveEndDateKey: string;
  status: string;
  durationDays?: number;
}): string {
  const status = RECORD_WINDOW_STATUSES.has(args.status) ? args.status : "completed";
  if (status === "abandoned") return args.exclusiveEndDateKey;
  const duration =
    args.durationDays != null && Number.isFinite(args.durationDays) && args.durationDays > 0
      ? Math.floor(args.durationDays)
      : 0;
  if (duration > 0) return addCalendarDaysToDateKey(args.startDateKey, duration);
  return args.exclusiveEndDateKey;
}

export function finishedRunScore(args: {
  startDateKey: string;
  exclusiveEndDateKey: string;
  status: string;
  todayKey: string;
  securedDateKeys: readonly string[];
  durationDays?: number;
}): FinishedRunScore {
  const status = RECORD_WINDOW_STATUSES.has(args.status) ? args.status : "completed";
  const endDateKey = finishedExclusiveEndDateKey({
    startDateKey: args.startDateKey,
    exclusiveEndDateKey: args.exclusiveEndDateKey,
    status,
    durationDays: args.durationDays,
  });
  const dueDayKeys = dueKeysForRange(
    { status, startDateKey: args.startDateKey, endDateKey },
    args.todayKey,
  );
  const window = securedElapsed({
    dueDayKeys,
    securedDateKeys: args.securedDateKeys,
    todayKey: args.todayKey,
  });
  return { secured: window.secured, elapsed: window.elapsed, dueDayKeys };
}

export function finishedRunFromEnrollment(args: {
  startAt?: string | null;
  endAt?: string | null;
  endedAt?: string | null;
  status?: string;
  timeZone: string;
  todayKey: string;
  securedDateKeys: readonly string[];
  durationDays?: number;
}): FinishedRunScore | undefined {
  if (!args.startAt) return undefined;
  const startDateKey = dateKeyFromIso(args.startAt, args.timeZone);
  const status = args.status && args.status.length > 0 ? args.status : "completed";
  const exclusiveEnd = exclusiveEndDateKey(
    { status, end_at: args.endAt ?? args.startAt, ended_at: args.endedAt ?? null },
    startDateKey,
    args.timeZone,
  );
  return finishedRunScore({
    startDateKey,
    exclusiveEndDateKey: exclusiveEnd,
    status,
    todayKey: args.todayKey,
    securedDateKeys: args.securedDateKeys,
    durationDays: args.durationDays,
  });
}
