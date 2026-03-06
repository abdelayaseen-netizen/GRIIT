/**
 * Shared date key helpers. Use for consistency and to avoid duplicated logic.
 * Date keys are YYYY-MM-DD (UTC date string).
 */
export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateKeyFromDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Parse YYYY-MM-DD to Date at midnight local time (matches streak/freeze "yesterday" logic). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Date keys between start (exclusive) and end (inclusive). start and end are YYYY-MM-DD.
 * Used for streak missed-days and profile getStats.
 */
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
