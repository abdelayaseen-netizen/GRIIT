import { addCalendarDaysToDateKey } from "@/lib/date-utils";

export const USE_FREEZE_ACTION = "Use freeze";
export const FREEZE_UNTIL_MIDNIGHT = "Use a freeze to cover it, until midnight.";

export function weekdayLongForDateKey(dateKey: string, timeZone = "UTC"): string {
  const [y, m, d] = dateKey.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "Yesterday";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: timeZone.trim() || "UTC",
    }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  } catch {
    return "Yesterday";
  }
}

/** The freeze window is the local calendar day immediately after the miss. */
export function freezeWindowOpen(missDateKey: string, todayKey: string): boolean {
  return addCalendarDaysToDateKey(missDateKey, 1) === todayKey;
}

export function yesterdayIsUnsecured(
  yesterdayKey: string,
  securedDateKeys: readonly string[],
  frozenDateKeys: readonly string[] = [],
): boolean {
  if (!yesterdayKey) return false;
  if (securedDateKeys.includes(yesterdayKey)) return false;
  if (frozenDateKeys.includes(yesterdayKey)) return false;
  return true;
}

/**
 * Offer a yesterday freeze. Miss-ack (dismissed morning-after card) is
 * intentionally not an input — the X hides the card only.
 */
export function canOfferYesterdayFreeze(args: {
  hardMode: boolean;
  freezesRemaining: number;
  missDateKey: string;
  todayKey: string;
  securedDateKeys: readonly string[];
  frozenDateKeys?: readonly string[];
}): boolean {
  if (args.hardMode) return false;
  if (args.freezesRemaining <= 0) return false;
  if (!freezeWindowOpen(args.missDateKey, args.todayKey)) return false;
  return yesterdayIsUnsecured(
    args.missDateKey,
    args.securedDateKeys,
    args.frozenDateKeys,
  );
}

export function freezeRecoveryTitle(missDateKey: string, timeZone = "UTC"): string {
  return `${weekdayLongForDateKey(missDateKey, timeZone)} wasn't secured.`;
}

export function freezeRecoveryCaption(remaining: number): string {
  const n = Math.max(0, Math.floor(remaining));
  return `${FREEZE_UNTIL_MIDNIGHT} ${n} left.`;
}

export function freezeRecoveryRow(args: {
  hardMode: boolean;
  freezesRemaining: number;
  missDateKey: string;
  todayKey: string;
  securedDateKeys: readonly string[];
  frozenDateKeys?: readonly string[];
  timeZone?: string;
}): {
  actionable: boolean;
  title: string;
  caption: string;
  actionLabel: string | null;
} | null {
  if (
    !canOfferYesterdayFreeze({
      hardMode: args.hardMode,
      freezesRemaining: args.freezesRemaining,
      missDateKey: args.missDateKey,
      todayKey: args.todayKey,
      securedDateKeys: args.securedDateKeys,
      frozenDateKeys: args.frozenDateKeys,
    })
  ) {
    return null;
  }
  return {
    actionable: true,
    title: freezeRecoveryTitle(args.missDateKey, args.timeZone),
    caption: freezeRecoveryCaption(args.freezesRemaining),
    actionLabel: USE_FREEZE_ACTION,
  };
}
