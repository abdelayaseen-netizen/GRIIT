import { describe, expect, it } from "vitest";
import { displayDay } from "./challenge-day";
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
