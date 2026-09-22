import { describe, expect, it } from "vitest";
import { calendarDay, homeDayLine, homeDayTotal } from "@/lib/home-day-total";

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
});
