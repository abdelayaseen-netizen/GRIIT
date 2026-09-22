/**
 * Frame 52 morning-after block. Fact → cost → cushion. No color.danger.
 * Dismiss persists miss_ack_date_key (decision 10).
 */
export const MISS_ACK_STORAGE_KEY = "miss_ack_date_key";
export const YESTERDAY_WASNT_SECURED = "Yesterday wasn't secured.";
export const USE_FREEZE_FOR_YESTERDAY = "Use a freeze for yesterday";

export type MorningAfterVariant = "reset" | "last_stand" | "freeze";

export type MorningAfterInput = {
  lastStandUsed: boolean;
  reset: boolean;
  freezeRemaining: number;
  lostStreak?: number;
};

export function morningAfterVariant(input: MorningAfterInput): MorningAfterVariant | null {
  if (input.lastStandUsed) return "last_stand";
  if (typeof input.lostStreak === "number" && input.lostStreak > 0 && input.freezeRemaining > 0) {
    return "freeze";
  }
  if (typeof input.lostStreak === "number" && input.lostStreak > 0) return "reset";
  if (input.reset) return "reset";
  return null;
}

/** Show while lostStreak > 0 and the date key is not acknowledged, regardless of today. */
export function morningAfterKeepsLostStreak(
  lostStreak: number | undefined,
  ackedDateKey: string | null | undefined,
  dateKey: string,
): boolean {
  return typeof lostStreak === "number" && lostStreak > 0 && !isMissAcked(ackedDateKey, dateKey);
}

export function isMissAcked(ackedDateKey: string | null | undefined, dateKey: string): boolean {
  return Boolean(ackedDateKey) && ackedDateKey === dateKey;
}

export function missAckStorageKey(userId: string): string {
  return `${MISS_ACK_STORAGE_KEY}:${userId}`;
}

/** Persist ack for yesterday. Refusal and the X both dismiss the block for this key. */
export function missAckPayload(userId: string, dateKey: string): { key: string; value: string } {
  return { key: missAckStorageKey(userId), value: dateKey };
}

/** Legacy unscoped key plus the signed-in user's scoped key. */
export function missAckKeysToClear(userId?: string | null): string[] {
  return userId ? [MISS_ACK_STORAGE_KEY, missAckStorageKey(userId)] : [MISS_ACK_STORAGE_KEY];
}

export function morningAfterVisible(
  variant: MorningAfterVariant | null,
  ackedDateKey: string | null | undefined,
  dateKey: string,
): boolean {
  return variant != null && !isMissAcked(ackedDateKey, dateKey);
}

export function morningAfterCost(done: number, total: number, missedTaskNames: readonly string[]): string {
  const names = missedTaskNames.map((n) => n.trim()).filter(Boolean).join(", ");
  const head = `${done} of ${total} tasks.`;
  return names ? `${head} ${names}.` : head;
}

export function morningAfterCushion(
  variant: MorningAfterVariant,
  input: {
    longest: number;
    lastStandsLeft: number;
    previousStreak?: number | null;
    todaySecured?: boolean;
  },
): string {
  if (variant === "last_stand") {
    return `A Last Stand covered it, so the streak continues. ${input.lastStandsLeft} left.`;
  }
  if (variant === "freeze") {
    return "Your streak reset to 0. A freeze can undo that for yesterday.";
  }
  if (input.todaySecured) {
    const prev = input.previousStreak;
    if (typeof prev === "number" && Number.isFinite(prev) && prev > 0) {
      return `Your ${Math.floor(prev)}-day streak ended. Today starts the count at 1.`;
    }
    return "Your streak ended. Today starts the count at 1.";
  }
  return `Your streak reset to 0. Your longest was ${input.longest} days.`;
}

export function morningAfterFreezeCaption(remaining: number): string {
  return `${remaining} left. It refills 30 days after you use it.`;
}
