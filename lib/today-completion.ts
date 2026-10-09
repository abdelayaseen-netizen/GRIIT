/** One completion list for Home and challenge detail: profile-today check-ins. */

export type TodayCompletionRow = {
  active_challenge_id?: string | null;
  task_id?: string | null;
  status?: string | null;
};

export const TODAY_CHECKINS_QUERY_KEY = ["checkins", "getTodayCheckins"] as const;

export function completedTaskIds(
  rows: readonly TodayCompletionRow[] | null | undefined,
  activeChallengeId?: string | null,
): Set<string> {
  const ids = new Set<string>();
  for (const row of rows ?? []) {
    if (row.status !== "completed" || !row.task_id) continue;
    if (activeChallengeId && row.active_challenge_id !== activeChallengeId) continue;
    ids.add(String(row.task_id));
  }
  return ids;
}

export function enrollmentTasksDone(
  taskIds: readonly string[],
  completed: ReadonlySet<string>,
): { done: number; total: number; allDone: boolean } {
  const total = taskIds.length;
  const done = taskIds.filter((id) => completed.has(id)).length;
  return { done, total, allDone: total > 0 && done === total };
}
