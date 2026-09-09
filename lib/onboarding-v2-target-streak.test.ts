import { describe, expect, it } from "vitest";
import { parseTargetStreak, TARGET_STREAK_MAX, TARGET_STREAK_MIN } from "@/lib/onboarding-v2-target-streak-parse";

describe("parseTargetStreak", () => {
  it("accepts integers from 3 to 365", () => {
    expect(parseTargetStreak(TARGET_STREAK_MIN)).toBe(3);
    expect(parseTargetStreak(30)).toBe(30);
    expect(parseTargetStreak(TARGET_STREAK_MAX)).toBe(365);
  });

  it("rejects out of range, floats, and non-numbers", () => {
    expect(parseTargetStreak(2)).toBeNull();
    expect(parseTargetStreak(366)).toBeNull();
    expect(parseTargetStreak(7.5)).toBeNull();
    expect(parseTargetStreak("30")).toBeNull();
    expect(parseTargetStreak(null)).toBeNull();
  });
});
