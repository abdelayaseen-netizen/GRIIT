/**
 * Floor helper for stored current_day (analytics / checkins metadata).
 * UI Day n is calendarDayFromStartAt / uiChallengeDay — never this remap.
 */

import { calendarDayFromStartAt } from "@/lib/home-day-total";

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}

/**
 * Metadata remap after secure_day increments current_day.
 * Not a UI label — UI uses uiChallengeDay.
 */
export function displayDay(current_day: number, secured_today: boolean): number {
  const n = challengeDayNumber(current_day);
  return secured_today ? challengeDayNumber(n - 1) : n;
}

/** Every on-screen Day n. Calendar from start_at. */
export function uiChallengeDay(
  startAt: string | null | undefined,
  timeZone: string,
  todayKey: string,
  durationDays?: number | null,
): number {
  return calendarDayFromStartAt(startAt, timeZone, todayKey, durationDays);
}

/** Feed header day. secured_day already stores displayDay; others match Home. */
export function feedPostDisplayDay(
  currentDay: number,
  eventType: string,
  securedToday: boolean,
): number {
  if (eventType === "secured_day") return challengeDayNumber(currentDay);
  return displayDay(currentDay, securedToday);
}

/** @deprecated use displayDay */
export function challengeDisplayDay(
  currentDay: number | null | undefined,
  todaySecured: boolean,
): number {
  return displayDay(challengeDayNumber(currentDay), todaySecured);
}
