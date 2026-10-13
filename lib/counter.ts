/** Port of design/handoff/v50 counter.ts. Do not import the handoff file. */

/** One tap finishes the count. A photo gate still opens the camera after this. */
export function completeLabel(target: number, unit: string, _camera?: boolean): string {
  const name = unit.trim();
  return name ? `Done · ${target} ${name}` : `Done · ${target}`;
}

export function showLogPartial(n: number, target: number): boolean {
  return n > 0 && n < target;
}

export function step(n: number, by: number, target: number): number {
  return Math.min(n + by, target);
}
