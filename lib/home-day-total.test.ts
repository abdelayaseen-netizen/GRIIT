import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calendarDay as backendCalendarDay,
  calendarDayFromStartAt as backendCalendarDayFromStartAt,
} from "@/backend/lib/calendar-day";
import { calendarDay, calendarDayFromStartAt, homeDayLine, homeDayTotal } from "@/lib/home-day-total";
import { feedEventCurrentDay } from "@/backend/lib/feed-activity-hydrate";

describe("homeDayTotal", () => {
  it("is duration_days only — target_streak is not used", () => {
    expect(homeDayTotal(1)).toBe(1);
    expect(homeDayTotal(14)).toBe(14);
    expect(homeDayTotal(75)).toBe(75);
  });

  it("returns null when duration_days is missing or not positive", () => {
    expect(homeDayTotal(null)).toBeNull();
    expect(homeDayTotal(undefined)).toBeNull();
    expect(homeDayTotal(0)).toBeNull();
    expect(homeDayTotal(-1)).toBeNull();
  });
});

describe("homeDayLine", () => {
  it("is Day n of duration when duration_days is present, clamped to N", () => {
    expect(homeDayLine(4, 1)).toBe("Day 1 of 1");
    expect(homeDayLine(4, 75)).toBe("Day 4 of 75");
  });

  it("is Day n with no of when duration_days is missing", () => {
    expect(homeDayLine(4, null)).toBe("Day 4");
    expect(homeDayLine(4, undefined)).toBe("Day 4");
    expect(homeDayLine(4, 0)).toBe("Day 4");
  });
});

describe("calendarDay", () => {
  it("is inclusive local days from start to today, clamped to N", () => {
    expect(calendarDay("2026-09-20", "2026-09-22", 75)).toBe(3);
    expect(calendarDay("2026-09-22", "2026-09-22", 75)).toBe(1);
    expect(calendarDay("2026-09-01", "2026-09-22", 14)).toBe(14);
  });

  it("enrollment start_at Sep 16, today Sep 23 → every site returns 8", () => {
    const startAt = "2026-09-16T12:00:00.000Z";
    const today = "2026-09-23";
    const n = calendarDayFromStartAt(startAt, "UTC", today, 14);
    expect(n).toBe(8);
    expect(calendarDayFromStartAt).toBe(backendCalendarDayFromStartAt);
    expect(calendarDay).toBe(backendCalendarDay);
    expect(calendarDay("2026-09-16", today, 14)).toBe(8);
    expect(feedEventCurrentDay({ startAt, timeZone: "UTC", todayKey: today, durationDays: 14 })).toBe(8);
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const detail = readFileSync(resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../backend/lib/feed-activity-hydrate.ts"), "utf8");
    const task = readFileSync(resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"), "utf8");
    expect(home).toContain("calendarDayFromStartAt");
    expect(detail).toContain("calendarDayFromStartAt");
    expect(feed).toContain("calendarDayFromStartAt");
    expect(task).toContain("currentDay: String(shownDay)");
  });
});
