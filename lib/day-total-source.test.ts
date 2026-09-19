import { describe, expect, it } from "vitest";
import { feedDayTotal, homeOrProfileDayTotal } from "./day-total-source";
import { feedFinishedCopy } from "./feed-copy";
import { hasCameraProof } from "./active-challenge-ui";

describe("day total source", () => {
  it("Home / profile rows: duration_days only", () => {
    expect(homeOrProfileDayTotal(1)).toBe(1);
    expect(homeOrProfileDayTotal(30)).toBe(30);
    expect(homeOrProfileDayTotal(null)).toBeNull();
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
    expect(hasCameraProof({ proof_photo_url: null })).toBe(false);
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
