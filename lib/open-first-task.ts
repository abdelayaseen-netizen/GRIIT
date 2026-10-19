/**
 * After join: open today's first task. Shared by onboarding, Discover, and detail.
 * Keeps imports free of native modules so unit tests can load this file.
 */
import { ROUTES } from "@/lib/routes";

export type JoinFirstTask = {
  id: string;
  title?: string | null;
  task_type?: string | null;
  config?: Record<string, unknown> | null;
  require_photo?: boolean | null;
  min_duration_minutes?: number | null;
  duration_minutes?: number | null;
};

export type JoinWithFirstTask = {
  id?: string | null;
  challenge_id?: string | null;
  start_at?: string | null;
  current_day?: number | null;
  challenge_title?: string | null;
  duration_days?: number | null;
  first_task?: JoinFirstTask | null;
  /** Waiting-room duo/shared_goal — no enrollment. */
  runStatus?: string | null;
  joined?: boolean;
};

let pendingFirstTaskHref: string | null = null;

export function setPendingFirstTaskHref(href: string | null): void {
  pendingFirstTaskHref = href;
}

export function peekPendingFirstTaskHref(): string | null {
  return pendingFirstTaskHref;
}

export function takePendingFirstTaskHref(): string | null {
  const href = pendingFirstTaskHref;
  pendingFirstTaskHref = null;
  return href;
}

/** Build 92 09.2: the task screen shows "You're in. Day 1 is today." when opened straight from Join. */
export function withJoinedToast(href: string): string {
  return `${href}&joined=1`;
}

/** True when join created (or already has) an enrollment we can open a task from. */
export function joinHasEnrollment(result: JoinWithFirstTask | null | undefined): boolean {
  if (!result) return false;
  return typeof result.id === "string" && result.id.length > 0;
}

function taskConfigJson(task: JoinFirstTask): string {
  const cfg = task.config && typeof task.config === "object" ? task.config : {};
  const nested =
    typeof (cfg as { duration_minutes?: unknown }).duration_minutes === "number"
      ? (cfg as { duration_minutes: number }).duration_minutes
      : undefined;
  const minutes = task.min_duration_minutes ?? task.duration_minutes ?? nested;
  return JSON.stringify({
    ...cfg,
    require_photo:
      task.require_photo === true ||
      (cfg as { photo_required?: boolean }).photo_required === true ||
      (cfg as { require_photo_proof?: boolean }).require_photo_proof === true,
    min_duration_minutes: minutes,
    duration_minutes: task.duration_minutes ?? minutes,
  });
}

export function firstTaskHrefFromJoin(
  result: JoinWithFirstTask | null | undefined,
  originTab: string = "home",
): string | null {
  if (!result?.id || !result.first_task?.id) return null;
  const task = result.first_task;
  const taskConfig = taskConfigJson(task);
  const day = result.current_day ?? 1;
  const duration = result.duration_days ?? day;
  const name = (task.title ?? "Task").trim() || "Task";
  const challengeName = (result.challenge_title ?? "Challenge").trim() || "Challenge";
  const type = (task.task_type ?? "check_off").trim() || "check_off";
  return (
    `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}` +
    `&activeChallengeId=${encodeURIComponent(result.id)}` +
    `&taskType=${encodeURIComponent(type)}` +
    `&taskName=${encodeURIComponent(name)}` +
    `&taskDescription=${encodeURIComponent("")}` +
    `&taskConfig=${encodeURIComponent(taskConfig)}` +
    `&challengeName=${encodeURIComponent(challengeName)}` +
    `&currentDay=${encodeURIComponent(String(day))}` +
    `&durationDays=${encodeURIComponent(String(duration))}` +
    `&originTab=${encodeURIComponent(originTab)}`
  );
}
