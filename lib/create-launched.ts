import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { currentMinutesInTimeZone } from "@/backend/lib/task-time-gate";
import { minutesFromMidnight } from "@/lib/time-gate-picker";
import { fmt12 } from "@/lib/time-gate-picker";
import { nextTaskLabel, opensAtLine } from "@/lib/late-join-copy";

export type LaunchedTask = {
  name: string;
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
};

export function windowHasNotOpened(
  gateTime: LaunchedTask["gateTime"],
  nowMinutes: number,
): boolean {
  if (gateTime?.mode !== "between") return false;
  const start = minutesFromMidnight(gateTime.start);
  return start != null && nowMinutes < start;
}

export function firstDoableTask(
  tasks: readonly LaunchedTask[],
  nowMinutes: number,
): LaunchedTask | null {
  return tasks.find((t) => !windowHasNotOpened(t.gateTime, nowMinutes)) ?? null;
}

export function launchedFirstCard(args: {
  tasks: readonly LaunchedTask[];
  timeZone: string;
  now?: Date;
}): {
  first: LaunchedTask | null;
  next: LaunchedTask | null;
  opensAt: string | null;
  nextLabel: string | null;
} {
  const nowMinutes = currentMinutesInTimeZone(args.now ?? new Date(), args.timeZone);
  const first = args.tasks[0] ?? null;
  const next = firstDoableTask(args.tasks, nowMinutes);
  const opensAt =
    first && windowHasNotOpened(first.gateTime, nowMinutes) && first.gateTime?.start
      ? opensAtLine(fmt12(first.gateTime.start))
      : null;
  return {
    first,
    next,
    opensAt,
    nextLabel: next ? nextTaskLabel(next.name) : first ? nextTaskLabel(first.name) : null,
  };
}

export { nextTaskLabel, opensAtLine };
