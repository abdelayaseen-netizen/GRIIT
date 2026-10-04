/**
 * v44 frame 171 — non-last task is a toast. Last task is the secured screen.
 */

export type TaskCompleteToast = {
  taskId: string;
  title: string;
  body: string;
  photoUri: string | null;
  cameraSeal: boolean;
};

export function taskDoneTitle(task: string, photo: boolean): string {
  const name = task.trim() || "Task";
  return photo ? `${name} saved.` : `${name} done.`;
}

export function taskLeftBody(left: number, photo: boolean): string {
  const n = Math.max(0, Math.floor(left));
  if (photo) return `Private until you share it · ${n} left`;
  return n === 1 ? "1 left to secure today" : `${n} left to secure today`;
}

export function securedMomentTitle(activeChallenges: number, day: number | null): string {
  if (activeChallenges === 1 && typeof day === "number" && day > 0) {
    return `Day ${Math.floor(day)} secured.`;
  }
  return "Day secured.";
}

export function streakInARow(streak: number): string {
  return Math.floor(streak) === 1 ? "day in a row" : "days in a row";
}

type Listener = (toast: TaskCompleteToast | null) => void;

let current: TaskCompleteToast | null = null;
let flashTaskId: string | null = null;
const listeners = new Set<Listener>();

export function currentTaskToast(): TaskCompleteToast | null {
  return current;
}

export function taskCompleteFlashId(): string | null {
  return flashTaskId;
}

export function publishTaskToast(toast: TaskCompleteToast): void {
  current = toast;
  flashTaskId = toast.taskId;
  for (const listener of listeners) listener(current);
}

export function dismissTaskToast(): void {
  current = null;
  for (const listener of listeners) listener(null);
}

export function clearTaskCompleteFlash(): void {
  flashTaskId = null;
  for (const listener of listeners) listener(current);
}

export function subscribeTaskToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
