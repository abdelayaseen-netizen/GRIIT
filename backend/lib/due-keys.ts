/**
 * Enrollment due-day keys. App and backend import this — do not copy.
 * Half-open [startDateKey, endDateKey) clipped to today.
 */
import { addCalendarDaysToDateKey } from "./date-utils";

export const RECORD_WINDOW_STATUSES = new Set(["active", "completed", "abandoned"]);

export type DueRange = { status: string; startDateKey: string; endDateKey: string };

/** Union of dueKeysForRange. Same rule Home / getRecord already use. */
export function unionDueKeysForRanges(
  ranges: readonly DueRange[],
  todayKey: string,
): string[] {
  const keys = new Set<string>();
  for (const range of ranges) {
    for (const key of dueKeysForRange(range, todayKey)) keys.add(key);
  }
  return [...keys];
}

/**
 * Yesterday was a due day: on/after first start (via dueKeysForRange)
 * and at least one required task was due.
 */
export function yesterdayWasDueDay(input: {
  yesterdayKey: string;
  todayKey: string;
  ranges: readonly DueRange[];
  requiredDueCount: number;
}): boolean {
  if (input.requiredDueCount <= 0) return false;
  return unionDueKeysForRanges(input.ranges, input.todayKey).includes(input.yesterdayKey);
}

export function dueKeysForRange(
  range: { status: string; startDateKey: string; endDateKey: string },
  todayKey: string,
): string[] {
  if (!RECORD_WINDOW_STATUSES.has(range.status)) return [];
  const start = range.startDateKey;
  const end = range.endDateKey;
  if (!start || start > todayKey) return [];
  const keys: string[] = [];
  if (end <= start) {
    if (start <= todayKey) keys.push(start);
    return keys;
  }
  let cursor = start;
  while (cursor < end && cursor <= todayKey) {
    keys.push(cursor);
    cursor = addCalendarDaysToDateKey(cursor, 1);
  }
  return keys;
}
