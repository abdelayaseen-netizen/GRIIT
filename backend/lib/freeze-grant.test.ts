import { describe, expect, it } from "vitest";
import { restoreStreakCount } from "../trpc/routes/streaks";
import {
  earnedFreezeBlockedByCap,
  nextEarnStreak,
  shouldGrantEarnedFreeze,
} from "./freeze-grant";

describe("earned freeze grant", () => {
  it("grants at 7 and at 14", () => {
    expect(shouldGrantEarnedFreeze({ streak: 7, held: 0, cap: 2, alreadyGrantedForDate: false })).toBe(true);
    expect(shouldGrantEarnedFreeze({ streak: 14, held: 1, cap: 2, alreadyGrantedForDate: false })).toBe(true);
  });

  it("grants nothing at the cap", () => {
    expect(shouldGrantEarnedFreeze({ streak: 7, held: 2, cap: 2, alreadyGrantedForDate: false })).toBe(false);
    expect(earnedFreezeBlockedByCap({ streak: 7, held: 2, cap: 2, alreadyGrantedForDate: false })).toBe(true);
  });

  it("does not grant twice for the same secured date", () => {
    expect(shouldGrantEarnedFreeze({ streak: 7, held: 0, cap: 2, alreadyGrantedForDate: true })).toBe(false);
    expect(earnedFreezeBlockedByCap({ streak: 7, held: 0, cap: 2, alreadyGrantedForDate: true })).toBe(false);
  });

  it("does not grant off a multiple of 7", () => {
    expect(shouldGrantEarnedFreeze({ streak: 6, held: 0, cap: 2, alreadyGrantedForDate: false })).toBe(false);
    expect(shouldGrantEarnedFreeze({ streak: 8, held: 0, cap: 2, alreadyGrantedForDate: false })).toBe(false);
  });

  it("a freeze-held day neither counts nor breaks the run that earns the freeze", () => {
    const streak = restoreStreakCount({
      todayKey: "2026-09-08",
      lastCompletedDateKey: "2026-09-08",
      securedDateKeys: [
        "2026-09-01",
        "2026-09-02",
        "2026-09-03",
        "2026-09-04",
        "2026-09-05",
        "2026-09-06",
        "2026-09-08",
      ],
      frozenDateKeys: ["2026-09-07"],
    });
    expect(streak).toBe(7);
    expect(shouldGrantEarnedFreeze({ streak, held: 0, cap: 2, alreadyGrantedForDate: false })).toBe(true);
  });

  it("names the next multiple of 7", () => {
    expect(nextEarnStreak(0)).toBe(7);
    expect(nextEarnStreak(7)).toBe(14);
    expect(nextEarnStreak(13)).toBe(14);
  });
});
