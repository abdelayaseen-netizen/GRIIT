/**
 * Enrollment due-day keys. App and backend import this — do not copy.
 * Half-open [startDateKey, endDateKey) clipped to today.
 */
import { addCalendarDaysToDateKey } from "./date-utils";

export const RECORD_WINDOW_STATUSES = new Set(["active", "completed", "abandoned"]);

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
