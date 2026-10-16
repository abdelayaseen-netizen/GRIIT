/**
 * v44 frame 171 — non-last task is a toast. Last task is the secured screen.
 */

export type TaskCompleteToast = {
  taskId: string;
  title: string;
  body: string;
  photoUri: string | null;
  cameraSeal: boolean;
  eventId?: string | null;
  challengeId?: string | null;
  challengeName?: string;
  taskName?: string;
  currentDay?: number;
  totalDays?: number;
  /** Streak after this save. The share card shows it only when it is 1 or more. */
  streak?: number;
  actionLabel?: string;
  lifeMs?: number;
};

/**
 * Build 90 04.5: the share card opened from the toast carries the real challenge,
 * task, day and streak. Missing day or length is left undefined so the paint does
 * not invent "Day 1 of 1". A 0 streak is left off.
 */
export function shareCardFromToast(
  toast: Pick<
    TaskCompleteToast,
    "title" | "body" | "photoUri" | "cameraSeal" | "challengeName" | "taskName" | "currentDay" | "totalDays" | "streak"
  >,
  username?: string | null,
): {
  challenge: string;
  task?: string;
  day?: number;
  durationDays?: number;
  streak?: number;
  username?: string | null;
  photoUri?: string | null;
  cameraSeal: boolean;
} {
  const challenge = toast.challengeName?.trim() ?? "";
  const task = (toast.taskName ?? toast.body ?? "").trim();
  const day = typeof toast.currentDay === "number" && toast.currentDay >= 1 ? Math.floor(toast.currentDay) : undefined;
  const durationDays =
    typeof toast.totalDays === "number" && toast.totalDays >= 1 ? Math.floor(toast.totalDays) : undefined;
  const streak = typeof toast.streak === "number" && toast.streak >= 1 ? Math.floor(toast.streak) : undefined;
  return {
    challenge,
    task: task || undefined,
    day,
    durationDays,
    streak,
    username,
    photoUri: toast.photoUri,
    cameraSeal: toast.cameraSeal === true,
  };
}

let toastAction: (() => void) | null = null;

export function setToastAction(action: (() => void) | null): void {
  toastAction = action;
}

export function runToastAction(): void {
  const action = toastAction;
  toastAction = null;
  action?.();
}

/** The verb stays whole. The task name is the second line and may truncate. */
export function taskDoneTitle(_task?: string, _photo?: boolean): string {
  return "Saved.";
}

/** Photo proofs use the share pill. Self-reported proofs get no second line. */
export function taskLeftBody(left: number, photo: boolean): string {
  void left;
  if (photo) return "";
  return "";
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
  toastAction = null;
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
