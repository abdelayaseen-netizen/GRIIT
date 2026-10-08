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

export function freezeHoldLine(streak: number, freezesLeft: number): string {
  const left = freezesLeft === 1 ? "1 left" : `${freezesLeft} left`;
  return `Yesterday wasn’t secured. A freeze holds your ${streak}-day streak until midnight. ${left}.`;
}
