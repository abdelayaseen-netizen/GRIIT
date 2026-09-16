import { describe, expect, it } from "vitest";
import { feedDayTotal, homeOrProfileDayTotal } from "./day-total-source";
import { feedFinishedCopy, feedHasCameraProof } from "./feed-copy";

describe("day total source", () => {
  it("Home / profile rows: target_streak wins when longer than duration_days", () => {
    expect(homeOrProfileDayTotal(1, 75)).toBe(75);
    expect(homeOrProfileDayTotal(30, 14)).toBe(30);
  });

  it("Feed: duration_days, plus own target_streak; never 2 of 1", () => {
    expect(feedDayTotal(1, 2, 75)).toBe(75);
    expect(feedDayTotal(1, 2, null)).toBe(2);
  });
});

describe("feedFinishedCopy", () => {
  it("does not say verified for a self-reported completion", () => {
    expect(
      feedFinishedCopy({
        currentDay: 2,
        totalDays: 1,
        targetStreak: 75,
        hasProof: false,
      }),
    ).toBe("Finished. 2 of 75 days.");
    expect(feedHasCameraProof({ hasProof: false })).toBe(false);
  });

  it("says verified only when the completion has camera proof", () => {
    expect(
      feedFinishedCopy({
        currentDay: 2,
        totalDays: 75,
        proofPhotoUrl: "https://cdn.example/p.jpg",
      }),
    ).toBe("Finished. 2 of 75 days verified.");
  });
});
