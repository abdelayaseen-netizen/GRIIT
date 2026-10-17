/**
 * Build 90 05.4: one source of truth for "how many tasks today, how many done,
 * how many left". Home's card, Profile's Today tile and the per-challenge rows
 * all read from here so the numbers agree.
 *
 * Rules (the same ones Home has always used):
 * - only enrollments that have started count (start date key <= today key, in the viewer's zone)
 * - only required tasks count (`config.required` defaults to true)
 * - a task is done when today has a `completed` check-in for it on that enrollment
 */
import { dateKeyFromIso } from "@/lib/challenge-end";
import { completedTaskIds, type TodayCompletionRow } from "@/lib/today-completion";

export type CountableTask = {
  id: string;
  config?: { required?: boolean } | Record<string, unknown> | null;
};

export type CountableEnrollment = {
  id: string;
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  challenges?: { challenge_tasks?: readonly CountableTask[] | null } | null;
};

export type TaskCount = { total: number; done: number; left: number };

export type TodayTaskCounts = TaskCount & {
  /** Only enrollments that count today (started). */
  byEnrollment: Record<string, TaskCount>;
};

/** Required tasks only. A missing `required` flag means required. */
export function requiredTasks<T extends CountableTask>(tasks: readonly T[] | null | undefined): T[] {
  return (tasks ?? []).filter((t) => {
    const cfg = (t.config ?? undefined) as { required?: boolean } | undefined;
    return (cfg?.required ?? true) === true;
  });
}

/** Start date key for an enrollment in the viewer's zone; today when there is no start. */
export function enrollmentStartKey(ac: CountableEnrollment, todayKey: string, timeZone: string): string {
  const startIso = ac.start_at ?? ac.started_at ?? ac.created_at ?? "";
  return startIso ? dateKeyFromIso(String(startIso), timeZone) : todayKey;
}

/** True when the enrollment's tasks are due today (it has started). */
export function enrollmentStarted(ac: CountableEnrollment, todayKey: string, timeZone: string): boolean {
  return enrollmentStartKey(ac, todayKey, timeZone) <= todayKey;
}

export function todayTaskCounts(input: {
  activeChallenges: readonly CountableEnrollment[] | null | undefined;
  todayCheckins: readonly TodayCompletionRow[] | null | undefined;
  todayKey: string;
  timeZone: string;
}): TodayTaskCounts {
  const byEnrollment: Record<string, TaskCount> = {};
  let total = 0;
  let done = 0;
  for (const ac of input.activeChallenges ?? []) {
    if (!enrollmentStarted(ac, input.todayKey, input.timeZone)) continue;
    const required = requiredTasks(ac.challenges?.challenge_tasks);
    const doneSet = completedTaskIds(input.todayCheckins, ac.id);
    const enrDone = required.filter((t) => doneSet.has(t.id)).length;
    byEnrollment[ac.id] = { total: required.length, done: enrDone, left: Math.max(0, required.length - enrDone) };
    total += required.length;
    done += enrDone;
  }
  return { total, done, left: Math.max(0, total - done), byEnrollment };
}
