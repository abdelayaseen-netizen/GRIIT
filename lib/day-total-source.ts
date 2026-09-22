import { homeDayTotal } from "@/lib/home-day-total";
import { feedDisplayTotal } from "@/lib/feed-copy";

/**
 * One source per context:
 * Home + profile rows → duration_days (homeDayTotal).
 * Feed N → duration_days (totalDays). n is clamped in feedDisplayDay.
 */
export function homeOrProfileDayTotal(
  durationDays: number | null | undefined,
): number | null {
  return homeDayTotal(durationDays);
}

export function feedDayTotal(
  durationDays: number,
  currentDay: number,
  ownTargetStreak?: number | null,
): number {
  return feedDisplayTotal(durationDays, currentDay, ownTargetStreak);
}
