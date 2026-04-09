/**
 * Shared date key helpers. Use for consistency and to avoid duplicated logic.
 * Date keys are YYYY-MM-DD (UTC date string).
 */
export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTomorrowDateKey(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * First calendar day (UTC) of the rolling 7-day window including today.
 * Matches secure_day RPC: date_key from (today UTC - 6 days) through today UTC.
 */
export function getRollingWeekStartDateKey(): string {
  const now = new Date();
  const u = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  u.setUTCDate(u.getUTCDate() - 6);
  return u.toISOString().slice(0, 10);
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

/** Monday of the week for the given date (ISO week). Returns YYYY-MM-DD. */
export function getWeekStartDateKey(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** Sunday of the week for the given date. Returns YYYY-MM-DD. */
export function getWeekEndDateKey(date: Date = new Date()): string {
  const start = getWeekStartDateKey(date);
  const parts = start.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid week start key: ${start}`);
  }
  const end = new Date(Date.UTC(y, m - 1, d + 6));
  return end.toISOString().slice(0, 10);
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
