import { describe, expect, it } from "vitest";
import { homeDayTotal } from "@/lib/home-day-total";

describe("homeDayTotal", () => {
  it("uses target_streak when it is longer than enrollment duration", () => {
    expect(homeDayTotal(30, 75)).toBe(75);
    expect(homeDayTotal(7, 30)).toBe(30);
  });

  it("uses duration when target is missing, equal, or shorter", () => {
    expect(homeDayTotal(30, null)).toBe(30);
    expect(homeDayTotal(30, undefined)).toBe(30);
    expect(homeDayTotal(30, 30)).toBe(30);
    expect(homeDayTotal(75, 30)).toBe(75);
  });

  it("Home and active challenge use the same total for one enrollment row", () => {
    const row = { duration_days: 14, target_streak: 75 };
    const home = homeDayTotal(row.duration_days, row.target_streak);
    const active = homeDayTotal(row.duration_days, row.target_streak);
    expect(home).toBe(75);
    expect(active).toBe(home);
    expect(row.duration_days).toBe(14);
  });
});
