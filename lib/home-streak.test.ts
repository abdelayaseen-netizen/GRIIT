import { describe, expect, it } from "vitest";
import { resolveDisplayedStreak } from "@/lib/home-streak";

describe("resolveDisplayedStreak", () => {
  it("stays null while getStats has not succeeded", () => {
    expect(resolveDisplayedStreak(false, null)).toBeNull();
    expect(resolveDisplayedStreak(false, 0)).toBeNull();
  });

  it("treats a successful read with no streaks row as day 0", () => {
    expect(resolveDisplayedStreak(true, null)).toBe(0);
    expect(resolveDisplayedStreak(true, undefined)).toBe(0);
    expect(resolveDisplayedStreak(true, 4)).toBe(4);
  });
});
