import { describe, expect, it } from "vitest";
import { displayDay, feedSecuredCurrentDay } from "./challenge-day";
import { feedNoPhotoCopy } from "./feed-copy";

describe("displayDay", () => {
  it("created today, secured today → displays Day 1, feed says secured day 1", () => {
    const current_day = 2;
    expect(displayDay(current_day, true)).toBe(1);
    expect(
      feedNoPhotoCopy({
        eventType: "secured_day",
        displayName: "Maya",
        username: "maya",
        challengeName: "75 Hard Classic",
        currentDay: current_day,
      })
    ).toBe("Maya secured day 1");
  });

  it("tomorrow morning unsecured → Day 2", () => {
    expect(displayDay(2, false)).toBe(2);
  });
});

describe("feedSecuredCurrentDay", () => {
  it("old write stored post-increment current_day matching live → raw live", () => {
    expect(feedSecuredCurrentDay(2, 2)).toBe(2);
  });

  it("new write stored the day actually secured → reconstruct column", () => {
    expect(feedSecuredCurrentDay(1, 2)).toBe(2);
    expect(feedSecuredCurrentDay(5, 6)).toBe(6);
  });
});
