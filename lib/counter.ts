/** Port of design/handoff/v50 counter.ts. Do not import the handoff file. */
import { shortSaveLabel } from "@/lib/partial-log";

/** One tap finishes the count. A photo gate still opens the camera after this. */
export function completeLabel(target: number, unit: string, _camera?: boolean): string {
  const name = unit.trim();
  return name ? `Done · ${target} ${name}` : `Done · ${target}`;
}

/** At or past the target the count completes the task. */
export function counterReached(n: number, target: number): boolean {
  return target <= 0 || n >= target;
}

/**
 * Build 92 03.1/03.4: at the goal the button is Done; under it (and above zero) it is a short save that
 * keeps the task open. Nothing is disabled except an empty count.
 */
export function counterDoneEnabled(n: number, target: number): boolean {
  return counterReached(n, target) || n > 0;
}

export function counterDoneLabel(n: number, target: number, unit: string): string {
  if (counterReached(n, target)) return completeLabel(target, unit);
  return shortSaveLabel(String(n));
}

/** Build 92 03.1: "Goal reached. Done saves it." at or past the goal; "{x} to go." under it. */
export function counterGoalLine(n: number, target: number): { reached: boolean; line: string } {
  if (counterReached(n, target)) return { reached: true, line: "Goal reached. Done saves it." };
  return { reached: false, line: `${target - n} to go.` };
}

export function showLogPartial(n: number, target: number): boolean {
  return n > 0 && n < target;
}

/** Build 92 03.1: the count can go past the goal; it only stops at zero. */
export function step(n: number, by: number, _target: number): number {
  return Math.max(0, n + by);
}
