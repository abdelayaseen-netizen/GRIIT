/**
 * Pure window math for late join. Client-safe: no Node, Sentry, or Supabase.
 */

export type TaskWindowRow = {
  time_window_end?: string | null;
  schedule_window_end?: string | null;
  gate_time_end?: string | null;
  gate_time_start?: string | null;
  gate_time_mode?: string | null;
  required?: boolean | null;
  config?: {
    required?: boolean | null;
    schedule_window_end?: string | null;
    time_window_end?: string | null;
  } | null;
};

export function windowTaskRequired(task: TaskWindowRow): boolean {
  if (task.required === false) return false;
  if (task.config && typeof task.config === "object" && task.config.required === false) return false;
  return true;
}

export function firstHHMM(...values: Array<string | null | undefined>): string | null {
  for (const raw of values) {
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

/** HH:MM end of a task time window. By = the By time (start or end column). */
export function taskWindowEndHHMM(task: TaskWindowRow): string | null {
  const mode = task.gate_time_mode?.trim();
  if (mode === "by") return firstHHMM(task.gate_time_start, task.gate_time_end);
  if (mode === "between") return firstHHMM(task.gate_time_end);
  return firstHHMM(
    task.time_window_end,
    task.schedule_window_end,
    task.gate_time_end,
    task.config?.schedule_window_end,
    task.config?.time_window_end,
  );
}

export function parseHHMMMinutes(raw: string): number | null {
  const [hStr, mStr] = raw.split(":");
  const h = parseInt(hStr ?? "", 10);
  const m = parseInt(mStr ?? "0", 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function currentMinutesInTimeZone(now: Date, timeZone: string): number {
  const tz = timeZone.trim() || "UTC";
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).formatToParts(now);
  let h = parts.find((p) => p.type === "hour")?.value ?? "00";
  if (h === "24") h = "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** True when any required task's time gate has already closed today in `timeZone`. */
export function anyTimeWindowClosedToday(
  tasks: TaskWindowRow[],
  now: Date,
  timeZone: string,
): boolean {
  const current = currentMinutesInTimeZone(now, timeZone);
  return tasks.some((t) => {
    if (!windowTaskRequired(t)) return false;
    const end = taskWindowEndHHMM(t);
    if (!end) return false;
    const mins = parseHHMMMinutes(end);
    return mins != null && current >= mins;
  });
}

function addCalendarDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function dateKeyInTimeZone(instant: Date, timezone?: string | null): string {
  const tz = timezone?.trim() || "UTC";
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const s = formatter.format(instant);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : instant.toISOString().slice(0, 10);
  } catch {
    return instant.toISOString().slice(0, 10);
  }
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

function localMidnightUtc(dateKey: string, timeZone: string): Date {
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

/** Day 1 is tomorrow when today is already secured or a required window has closed. */
export function day1Defers(args: { windowClosed: boolean; todaySecured: boolean }): boolean {
  return args.windowClosed || args.todaySecured;
}

/** Defer to tomorrow local 00:00; otherwise start now. */
export function enrollmentStartAt(now: Date, timeZone: string, defer: boolean): Date {
  if (!defer) return now;
  const tomorrowKey = addCalendarDaysToDateKey(dateKeyInTimeZone(now, timeZone), 1);
  return localMidnightUtc(tomorrowKey, timeZone);
}
