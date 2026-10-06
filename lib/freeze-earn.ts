/** Next streak length that earns a freeze. 0 → 7, 7 → 14. */
export function nextEarnStreak(streak: number): number {
  const n = Math.max(0, Math.floor(streak));
  return (Math.floor(n / 7) + 1) * 7;
}

export const EARNED_FREEZE = {
  earned: (n: number) => `Freeze earned. You hold ${n}.`,
  atCap: (cap: number) => `You’re holding the max, ${cap} freezes.`,
  ofCap: (n: number, cap: number) => `${n} of ${cap}`,
  nextAt: (streak: number) => `Next at ${streak}-day streak`,
} as const;

export const MORNING_MISS = {
  withFreeze: "Yesterday wasn’t secured. A freeze can hold it until midnight.",
  without: "Secure today and you’re back at 1.",
} as const;

export function freezeEarnedNote(input: {
  freezeGranted?: boolean;
  freezeAtCap?: boolean;
  freezesHeld?: number;
  freezeCap?: number;
}): string | null {
  if (input.freezeGranted) return EARNED_FREEZE.earned(input.freezesHeld ?? 0);
  if (input.freezeAtCap && (input.freezeCap ?? 0) > 0) return EARNED_FREEZE.atCap(input.freezeCap ?? 0);
  return null;
}
