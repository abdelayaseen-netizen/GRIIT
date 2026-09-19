import { homeDayTotal } from "@/lib/home-day-total";
import { feedDisplayTotal } from "@/lib/feed-copy";

/**
 * One source per context:
 * Home + profile rows → duration_days (homeDayTotal).
 * Feed → duration_days (totalDays); own posts also apply target_streak.
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
