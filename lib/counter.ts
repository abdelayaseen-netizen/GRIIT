/** Port of design/handoff/v50 counter.ts. Do not import the handoff file. */

export function completeLabel(target: number, unit: string, camera: boolean): string {
  return camera ? "Complete · take photo" : `Complete · ${target} ${unit}`;
}

export function showLogPartial(n: number, target: number): boolean {
  return n > 0 && n < target;
}

export function step(n: number, by: number, target: number): number {
  return Math.min(n + by, target);
}
