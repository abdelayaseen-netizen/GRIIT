export const TARGET_STREAK_MIN = 3;
export const TARGET_STREAK_MAX = 365;

export function parseTargetStreak(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  if (n < TARGET_STREAK_MIN || n > TARGET_STREAK_MAX) return null;
  return n;
}
