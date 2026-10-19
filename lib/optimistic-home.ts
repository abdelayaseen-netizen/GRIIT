/**
 * Home's count and rings update from this list before the server answers.
 * A failed save rolls the task back and leaves a retry on Home.
 */

export const OPTIMISTIC_SAVE_ERROR = "Couldn't save. Tap to try again.";

export type OptimisticTaskDone = {
  taskId: string;
  activeChallengeId: string;
};

export type SaveError = { taskId: string; message: string; retry: boolean };

let dones: OptimisticTaskDone[] = [];
let saveError: SaveError | null = null;
let retry: (() => void) | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function optimisticTaskDones(): OptimisticTaskDone[] {
  return dones;
}

export function optimisticSaveError(): SaveError | null {
  return saveError;
}

export function markOptimisticTaskDone(row: OptimisticTaskDone): void {
  if (!row.taskId || !row.activeChallengeId) return;
  if (!dones.some((item) => item.taskId === row.taskId && item.activeChallengeId === row.activeChallengeId)) {
    dones = [...dones, row];
  }
  if (saveError?.taskId === row.taskId) saveError = null;
  emit();
}

/** `reason` is the real cause (build 92 10.3); without one Home offers the generic retry. */
export function rollbackOptimisticTaskDone(
  taskId: string,
  reason: { message: string; retry: boolean } = { message: OPTIMISTIC_SAVE_ERROR, retry: true },
): void {
  dones = dones.filter((item) => item.taskId !== taskId);
  saveError = { taskId, message: reason.message, retry: reason.retry };
  emit();
}

export function confirmOptimisticTaskDone(taskId: string): void {
  if (saveError?.taskId === taskId) saveError = null;
  emit();
}

export function setOptimisticRetry(fn: (() => void) | null): void {
  retry = fn;
}

export function runOptimisticRetry(): void {
  const fn = retry;
  fn?.();
}

export function subscribeOptimisticHome(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mergeOptimisticCheckins<
  T extends { task_id?: string; status?: string; active_challenge_id?: string },
>(checkins: T[], pending: OptimisticTaskDone[]): T[] {
  const extras = pending.filter(
    (row) =>
      !checkins.some(
        (checkin) =>
          checkin.task_id === row.taskId &&
          checkin.active_challenge_id === row.activeChallengeId &&
          checkin.status === "completed",
      ),
  );
  if (extras.length === 0) return checkins;
  return [
    ...checkins,
    ...extras.map(
      (row) =>
        ({
          task_id: row.taskId,
          active_challenge_id: row.activeChallengeId,
          status: "completed",
        }) as T,
    ),
  ];
}
