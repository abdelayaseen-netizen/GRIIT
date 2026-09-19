import { describe, expect, it } from "vitest";
import { homeDayLine, homeDayTotal } from "@/lib/home-day-total";

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
  it("is Day n of duration when duration_days is present", () => {
    expect(homeDayLine(4, 1)).toBe("Day 4 of 1");
    expect(homeDayLine(4, 75)).toBe("Day 4 of 75");
  });

  it("is Day n with no of when duration_days is missing", () => {
    expect(homeDayLine(4, null)).toBe("Day 4");
    expect(homeDayLine(4, undefined)).toBe("Day 4");
    expect(homeDayLine(4, 0)).toBe("Day 4");
  });
});
