/**
 * Live "Day n of N" uses the enrollment's stored current_day, capped at the
 * challenge length so a 1-day challenge never reads "Day 2 of 1".
 * uiChallengeDay stays the calendar count for history and countdowns.
 */

import { calendarDayFromStartAt, homeDayTotal } from "../backend/lib/calendar-day";

export function challengeDayNumber(currentDay: number | null | undefined): number {
  if (typeof currentDay !== "number" || !Number.isFinite(currentDay)) return 1;
  return Math.max(1, Math.floor(currentDay));
}

/**
 * Metadata remap after secure_day increments current_day.
 * The live label is enrollmentDayIndex, which keeps the stored day.
 */
export function displayDay(current_day: number, secured_today: boolean): number {
  const n = challengeDayNumber(current_day);
  return secured_today ? challengeDayNumber(n - 1) : n;
}

/** Stored enrollment day, never 0, never past the challenge length. */
export function enrollmentDayIndex(input: {
  currentDay: number | null | undefined;
  durationDays?: number | null;
}): number {
  const n = challengeDayNumber(input.currentDay);
  const total = homeDayTotal(input.durationDays ?? null);
  return total == null ? n : Math.min(n, total);
}

/** Calendar day from start_at. History and countdowns, not the live label. */
export function uiChallengeDay(
  startAt: string | null | undefined,
  timeZone: string,
  todayKey: string,
  durationDays?: number | null,
): number {
  return calendarDayFromStartAt(startAt, timeZone, todayKey, durationDays);
}
