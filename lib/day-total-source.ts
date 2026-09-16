import { homeDayTotal } from "@/lib/home-day-total";
import { feedDisplayTotal } from "@/lib/feed-copy";

/**
 * One source per context:
 * Home + profile rows → homeDayTotal(duration_days, target_streak).
 * Feed → duration_days (totalDays); own posts also apply target_streak.
 */
export function homeOrProfileDayTotal(
  durationDays: number,
  targetStreak: number | null | undefined,
): number {
  return homeDayTotal(durationDays, targetStreak);
}

export function feedDayTotal(
  durationDays: number,
  currentDay: number,
  ownTargetStreak?: number | null,
): number {
  return feedDisplayTotal(durationDays, currentDay, ownTargetStreak);
}
