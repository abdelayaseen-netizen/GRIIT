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

/** First word of the display name, otherwise @handle. No emoji. */
export function greetingName(displayName: string | null | undefined, username: string): string {
  const first = displayName?.trim().split(/\s+/)[0];
  if (first) return first;
  const handle = username.trim().replace(/^@/, "");
  return handle ? `@${handle}` : "there";
}

/**
 * 4:00–11:59 morning, 12:00–16:59 afternoon, 17:00–21:59 evening, 22:00–3:59 Still up.
 */
export function greeting(
  now: Date,
  displayName: string | null | undefined,
  username: string,
  timeZone = "UTC",
): string {
  const h = hourInTimeZone(now, timeZone);
  const name = greetingName(displayName, username);
  if (h >= 4 && h < 12) return `Good morning, ${name}`;
  if (h >= 12 && h < 17) return `Good afternoon, ${name}`;
  if (h >= 17 && h < 22) return `Good evening, ${name}`;
  return `Still up, ${name}`;
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

/** Day 1–7 from the earliest start, or null once the calendar week takes over. */
export function firstWeekDay(todayKey: string, earliestStartKey: string | null | undefined): number | null {
  if (!earliestStartKey || earliestStartKey > todayKey) return null;
  const n = inclusiveDayCount(earliestStartKey, todayKey);
  return n >= 1 && n <= 7 ? n : null;
}

export function firstWeekDateKeys(startKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addCalendarDaysToDateKey(startKey, i));
}
