import { addCalendarDaysToDateKey, inclusiveDayCount } from "@/backend/lib/date-utils";

export { inclusiveDayCount };

/** Hour 0–23 in `timeZone`. */
export function hourInTimeZone(now: Date, timeZone: string): number {
  const tz = timeZone.trim() || "UTC";
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: tz,
  }).formatToParts(now);
  let h = parts.find((p) => p.type === "hour")?.value ?? "0";
  if (h === "24") h = "0";
  return Number(h);
}

/** The handle the server mints at sign-up (`user_` + 8 hex). Never a greeting. */
export function isMachineHandle(username: string | null | undefined): boolean {
  return /^@?user_[0-9a-f]{8}$/i.test((username ?? "").trim());
}

/**
 * First word of the auth profile's full name (Apple / sign-up metadata), if any.
 * Build 90 06.3: the last fallback before greeting with no name at all.
 */
export function firstNameFromAuth(
  user: { user_metadata?: Record<string, unknown> | null } | null | undefined,
): string | null {
  const md = user?.user_metadata ?? {};
  const candidates = [md.given_name, md.first_name, md.full_name, md.name];
  for (const c of candidates) {
    if (typeof c !== "string") continue;
    const first = c.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return null;
}

/**
 * Build 90 06.3: display name's first word, then @username, then the first name.
 * A machine handle (`@user_xxxxxxxx`) is skipped; with nothing usable return null and
 * the greeting stands alone. No emoji.
 */
export function greetingName(
  displayName: string | null | undefined,
  username: string,
  firstName?: string | null,
): string | null {
  const first = displayName?.trim().split(/\s+/)[0];
  if (first) return first;
  const handle = username.trim().replace(/^@/, "");
  if (handle && !isMachineHandle(handle)) return `@${handle}`;
  const given = firstName?.trim().split(/\s+/)[0];
  return given || null;
}

/**
 * 4:00–11:59 morning, 12:00–16:59 afternoon, 17:00–21:59 evening, 22:00–3:59 Still up.
 */
export function greeting(
  now: Date,
  displayName: string | null | undefined,
  username: string,
  timeZone = "UTC",
  firstName?: string | null,
): string {
  const h = hourInTimeZone(now, timeZone);
  const name = greetingName(displayName, username, firstName);
  const suffix = name ? `, ${name}` : "";
  if (h >= 4 && h < 12) return `Good morning${suffix}`;
  if (h >= 12 && h < 17) return `Good afternoon${suffix}`;
  if (h >= 17 && h < 22) return `Good evening${suffix}`;
  return `Still up${suffix}`;
}

/** "Thursday, Oct 8" in the profile time zone. */
export function homeScreenDate(now: Date, timeZone = "UTC"): string {
  const tz = timeZone.trim() || "UTC";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(now);
}

export function greetingSub(o: {
  secured: boolean;
  nextTask?: string | null;
  openCount: number;
  firstWeekDay?: number | null;
  /** Window closed and nothing else can be finished today. */
  blocked?: string | null;
}): string {
  if (o.firstWeekDay && o.firstWeekDay <= 7 && !o.secured) {
    return `Day ${o.firstWeekDay} of your first week.`;
  }
  if (o.secured) return "Day secured. See you tomorrow.";
  if (o.openCount === 1 && o.nextTask) return `${o.nextTask} is all that’s left today.`;
  if (o.openCount <= 0) return o.blocked?.trim() || "Nothing you can finish today.";
  return `Next: ${o.nextTask ?? "a task"}. ${o.openCount} tasks left today.`;
}

/** Earliest start across every enrollment, including finished and left ones. */
export function earliestEnrollmentStart(keys: readonly (string | null | undefined)[]): string | null {
  const sorted = keys.filter((key): key is string => Boolean(key)).sort();
  return sorted[0] ?? null;
}

/** Day 1–7 from the earliest start, or null once the calendar week takes over. */
export function firstWeekDay(todayKey: string, earliestStartKey: string | null | undefined): number | null {
  if (!earliestStartKey || earliestStartKey > todayKey) return null;
  const n = inclusiveDayCount(earliestStartKey, todayKey);
  return n >= 1 && n <= 7 ? n : null;
}

export function firstWeekDateKeys(startKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addCalendarDaysToDateKey(startKey, i));
}
