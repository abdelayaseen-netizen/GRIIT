/**
 * Build 92 chunk 01.3: one builder for the task screen href, used by Home's task rows
 * and by the Create chooser's "Log today's task".
 */
import { ROUTES } from "@/lib/routes";

export type TaskCompleteHrefInput = {
  id: string;
  activeChallengeId: string;
  taskType: string;
  name: string;
  taskConfig: string;
  challengeName: string;
  currentDay: number;
  durationDays: number;
};

export function taskCompleteHref(task: TaskCompleteHrefInput, originTab = "home"): string {
  return (
    `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}` +
    `&activeChallengeId=${encodeURIComponent(task.activeChallengeId)}` +
    `&taskType=${encodeURIComponent(task.taskType)}` +
    `&taskName=${encodeURIComponent(task.name)}` +
    `&taskDescription=${encodeURIComponent("")}` +
    `&taskConfig=${encodeURIComponent(task.taskConfig)}` +
    `&challengeName=${encodeURIComponent(task.challengeName)}` +
    `&currentDay=${String(task.currentDay)}` +
    `&durationDays=${String(task.durationDays)}` +
    `&originTab=${encodeURIComponent(originTab)}`
  );
}
