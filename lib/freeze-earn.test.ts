import { describe, expect, it } from "vitest";
import { EARNED_FREEZE, freezeEarnedNote, nextEarnStreak } from "./freeze-earn";

describe("earned freeze copy", () => {
  it("says what you hold, and the max line only at the cap", () => {
    expect(freezeEarnedNote({ freezeGranted: true, freezesHeld: 1, freezeCap: 2 })).toBe(
      "Freeze earned. You hold 1.",
    );
    expect(freezeEarnedNote({ freezeAtCap: true, freezeCap: 2, freezesHeld: 2 })).toBe(
      "You’re holding the max, 2 freezes.",
    );
    expect(freezeEarnedNote({ freezeGranted: false, freezeAtCap: false })).toBeNull();
  });

  it("names the hold and the next multiple of 7", () => {
    expect(EARNED_FREEZE.ofCap(1, 2)).toBe("1 of 2");
    expect(EARNED_FREEZE.nextAt(nextEarnStreak(3))).toBe("Next at 7-day streak");
  });
});
