/** Port of design/handoff/v50 counter.ts. Do not import the handoff file. */

/** One tap finishes the count. A photo gate still opens the camera after this. */
export function completeLabel(target: number, unit: string, _camera?: boolean): string {
  const name = unit.trim();
  return name ? `Done · ${target} ${name}` : `Done · ${target}`;
}

/** Build 90 03.4: Done cannot finish below target. */
export function counterDoneEnabled(n: number, target: number): boolean {
  return target <= 0 || n >= target;
}

/** Under target the button says what is left; at target it is the Done label. */
export function counterDoneLabel(n: number, target: number, unit: string): string {
  if (counterDoneEnabled(n, target)) return completeLabel(target, unit);
  const left = Math.max(0, target - n);
  const name = unit.trim();
  return name ? `${left} ${name} left` : `${left} left`;
}

export function showLogPartial(n: number, target: number): boolean {
  return n > 0 && n < target;
}

export function step(n: number, by: number, target: number): number {
  return Math.min(n + by, target);
}
