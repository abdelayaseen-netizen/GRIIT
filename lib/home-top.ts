/** Port of design/handoff/v50 homeTop.ts. Do not import the handoff file. */

export function bestLabel(current: number, best: number): string {
  return current >= best ? "Your best" : `Best ${best.toLocaleString("en-US")}`;
}

export function streakNumeralSize(n: number): number {
  return n >= 1000 ? 30 : 32;
}

export type HomeNextTask = { id: string; title: string };

export type HomeAction =
  | { kind: "share"; label: string }
  | { kind: "freeze"; label: string }
  | { kind: "task"; taskId: string; label: string }
  | { kind: "none" };

/** Missing next task does not throw. The handoff assumed nextTask was set. */
export function homeAction(input: {
  securedToday: boolean;
  yesterdayUnsecured: boolean;
  freezesLeft: number;
  nextTask: HomeNextTask | null;
}): HomeAction {
  if (input.securedToday) return { kind: "share", label: "Share today" };
  if (input.yesterdayUnsecured && input.freezesLeft > 0) {
    return { kind: "freeze", label: "Use a freeze" };
  }
  if (input.nextTask) {
    return { kind: "task", taskId: input.nextTask.id, label: input.nextTask.title };
  }
  return { kind: "none" };
}

/** Mid-day line on the streak card. "Workout is next. 2 of 3 left today." */
export function todayNextLine(task: string | null | undefined, left: number, total: number): string {
  const name = task?.trim() || "Next";
  return `${name} is next. ${left} of ${total} left today.`;
}

export const DAY_ONE_WORDS = "Nothing to break yet.";
export const DAY_ONE_SUB = "Secure today and the streak starts. Days count from the day you joined.";

export function freezeHoldLine(streak: number, freezesLeft: number): string {
  const left = freezesLeft === 1 ? "1 left" : `${freezesLeft} left`;
  return `Yesterday wasn’t secured. A freeze holds your ${streak}-day streak until midnight. ${left}.`;
}
