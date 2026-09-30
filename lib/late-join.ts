import {
  anyTimeWindowClosedToday,
  enrollmentStartAt,
  type TaskWindowRow,
} from "@/backend/lib/late-join-window";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { REVIEW_STARTS_TODAY } from "@/lib/create-review";
import {
  lateJoinDetailCard,
  reviewLateJoinLine,
  reviewStartsTomorrow,
} from "@/lib/late-join-copy";
import { fmt12, fmtWindow } from "@/lib/time-gate-picker";

export function formatWeekdayDMonth(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}

export function wizardWindowLabel(gateTime: GateTime | null | undefined): string {
  if (gateTime?.mode === "between" && gateTime.start && gateTime.end) {
    return fmtWindow(gateTime.start, gateTime.end);
  }
  if (gateTime?.mode === "by" && gateTime.start) return `By ${fmt12(gateTime.start)}`;
  return "time";
}

export function wizardTasksToWindowRows(
  tasks: readonly { gates?: readonly TaskGate[] | null; gateTime?: GateTime | null }[],
): TaskWindowRow[] {
  return tasks
    .filter((t) => t.gateTime?.mode === "by" || t.gateTime?.mode === "between" || t.gates?.includes("time"))
    .map((t) => ({
      gate_time_mode: t.gateTime?.mode,
      gate_time_start: t.gateTime?.start,
      gate_time_end: t.gateTime?.end,
      required: true,
    }));
}

export function reviewLateJoinState(
  tasks: readonly { gates?: readonly TaskGate[] | null; gateTime?: GateTime | null }[],
  timeZone: string,
  now: Date = new Date(),
): { defer: boolean; starts: string; line: string | null } {
  const rows = wizardTasksToWindowRows(tasks);
  const defer = anyTimeWindowClosedToday(rows, now, timeZone);
  if (!defer) return { defer: false, starts: REVIEW_STARTS_TODAY, line: null };
  const start = enrollmentStartAt(now, timeZone, true);
  const gated = tasks.find((t) => t.gates?.includes("time"));
  return {
    defer: true,
    starts: reviewStartsTomorrow(formatWeekdayDMonth(start, timeZone)),
    line: reviewLateJoinLine(wizardWindowLabel(gated?.gateTime)),
  };
}

export function detailLateJoinCard(
  startAtIso: string,
  timeZone: string,
): string {
  return lateJoinDetailCard(formatWeekdayDMonth(new Date(startAtIso), timeZone));
}
