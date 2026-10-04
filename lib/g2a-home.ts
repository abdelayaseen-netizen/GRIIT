/**
 * v43.1 frames 156 + 160 — Today card copy and Start task pick.
 */

import { format12h } from "@/lib/task-ui";
import type { GateTime } from "@/backend/lib/task-model";

export const FIRST_PROOF_SLOT_HEADING = "Your first proof goes here.";
export const FIRST_PROOF_SLOT_BODY = "It stays private until you choose to share it.";

export function todayFirstDayLine(taskCount: number): string {
  const n = Math.max(1, Math.floor(taskCount));
  const finish = n === 2 ? "both" : `all ${n}`;
  return `Day 1 is today. Finish ${finish} tasks to secure it.`;
}

export const TODAY_WINDOW_CLOSED = "Today's window closed. Back tomorrow.";
export const WINDOW_CLOSED_RESET = "A missed day resets your streak to 0. No freezes.";
export const SECTION_DONE = "Done for today";

export function windowClosedFreezeLine(freezesLeft: number): string {
  const n = Math.max(0, Math.floor(freezesLeft));
  return `Today can't be secured. Tomorrow you can use a freeze to cover it. ${n} left.`;
}

/** Second sentence under the closed block. Null when Standard has no freezes. */
export function windowClosedFollowup(args: { noDaysOff: boolean; freezesLeft: number }): string | null {
  if (args.noDaysOff) return WINDOW_CLOSED_RESET;
  if (args.freezesLeft > 0) return windowClosedFreezeLine(args.freezesLeft);
  return null;
}

export function showTodayStreakLine(streak: number | null | undefined, closed: boolean): boolean {
  return !closed && typeof streak === "number" && streak >= 1;
}

export function daysInARow(streak: number): string {
  const n = Math.max(0, Math.floor(streak));
  return n === 1 ? "1 day in a row." : `${n} days in a row.`;
}

export function remainingWindowsClosed(
  tasks: readonly { done?: boolean; closed?: boolean }[],
): boolean {
  const remaining = tasks.filter((t) => t.done !== true);
  return remaining.length > 0 && remaining.every((t) => t.closed === true);
}

/** Home status when a required task's window has closed and it is not done. */
export function closedTaskStatus(taskName: string): string {
  const name = taskName.trim() || "Task";
  return `${name} closed. Today can't be secured.`;
}

export function firstClosedUndoneTask<T extends { name: string; done?: boolean; closed?: boolean }>(
  tasks: readonly T[],
): T | null {
  return tasks.find((t) => t.done !== true && t.closed === true) ?? null;
}

export function todayDay2Hero(
  streak: number,
  remainingClosed = false,
): { hero: string; line: string } {
  const n = Math.max(0, Math.floor(streak));
  const next = n + 1;
  const unit = n === 1 ? "day" : "days";
  return {
    hero: String(n),
    line: remainingClosed ? TODAY_WINDOW_CLOSED : `${unit}. Secure today and it's ${next}.`,
  };
}

export function startCtaLabel(taskName: string): string {
  const name = taskName.trim() || "task";
  return `Start: ${name}`;
}

export function windowClosesBanner(taskName: string, closeTime: string): string {
  return `The ${taskName.trim() || "task"} window closes at ${closeTime}. After that, today can't be secured.`;
}

export function countdownSuffix(minutesLeft: number | null | undefined): string {
  if (minutesLeft == null || minutesLeft >= 180 || minutesLeft < 0) return "";
  const total = Math.floor(minutesLeft);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return ` · ${h} h ${m} min left`;
}

export function closeTimeLabel(gateTime: GateTime | null | undefined): string {
  if (!gateTime) return "";
  if (gateTime.mode === "between") return format12h(gateTime.end);
  if (gateTime.mode === "by") return format12h(gateTime.start) || format12h(gateTime.end);
  return format12h(gateTime.end) || format12h(gateTime.start);
}

export type StartTaskPick = {
  id: string;
  name: string;
  minutesLeft?: number | null;
  gateTime?: GateTime | null;
  challengeName?: string;
  currentDay?: number;
  durationDays?: number;
  done?: boolean;
  closed?: boolean;
};

export function pickStartTask<T extends StartTaskPick>(tasks: readonly T[]): T | null {
  const pending = tasks.filter((t) => !t.done && !t.closed);
  if (pending.length === 0) return null;
  const withWindow = pending
    .filter((t) => typeof t.minutesLeft === "number" && (t.minutesLeft as number) >= 0)
    .sort((a, b) => (a.minutesLeft ?? Infinity) - (b.minutesLeft ?? Infinity));
  return withWindow[0] ?? pending[0] ?? null;
}
