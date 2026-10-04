import type { DayState } from "@/lib/profile-v2-record";
import { formatOfDays } from "@/lib/format-days";

export type Seg = "secured" | "held" | "missed" | "today" | "future";

export const STRIP_MAX = 14;

export function segsFromDayStates(days: readonly DayState[]): Seg[] {
  return days.map((d) => {
    if (d === "verified") return "secured";
    if (d === "missed") return "missed";
    if (d === "today") return "today";
    return "future";
  });
}

/** Last 14 days up to today when the run is longer than 14. */
export function stripSegments(days: readonly Seg[]): Seg[] {
  const futureAt = days.findIndex((d) => d === "future");
  const upToToday = days.slice(0, Math.max(futureAt, 0) || days.length);
  return days.length <= STRIP_MAX ? [...days] : upToToday.slice(-STRIP_MAX);
}

export function challengeLine(c: {
  status: string;
  dayN: number;
  durationDays: number;
  elapsedDays?: number;
  secured: number;
  range: string;
  startsTomorrow?: boolean;
  startDate?: string;
}): string {
  const tail = c.range ? ` · ${c.range}` : "";
  if (c.startsTomorrow) return `Day 1 is ${c.startDate ?? ""}${tail}`.replace(/\s+/g, " ").trim();
  if (c.status === "active") return `Day ${c.dayN} of ${c.durationDays}${tail}`;
  if (c.status === "completed") {
    return `Finished · ${formatOfDays(c.secured, c.elapsedDays ?? c.durationDays)}${tail}`;
  }
  if (c.status === "failed") return `Ended on day ${c.dayN}${tail}`;
  return `Left on day ${c.dayN}${tail}`;
}

export function todayChip(c: {
  status: string;
  startsTomorrow?: boolean;
  securedToday?: boolean;
  tasksLeft?: number;
}): string | undefined {
  if (c.status !== "active") return undefined;
  if (c.startsTomorrow) return "Starts tomorrow";
  if (c.securedToday) return "Secured today";
  const left = c.tasksLeft ?? 0;
  if (left <= 0) return undefined;
  return left === 1 ? "1 task left" : `${left} tasks left`;
}

/** Today counts in due only once secured. */
export function dueForStrip(currentDay: number, securedToday: boolean): number {
  return Math.max(0, currentDay - (securedToday ? 0 : 1));
}
