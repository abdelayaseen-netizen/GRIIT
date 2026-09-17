import { describe, expect, it } from "vitest";
import {
  CONSISTENCY_FOOTER,
  CONSISTENCY_TITLE,
  challengeProofCaption,
  completionPct,
  daysValue,
  heroDayLine,
  ofElapsed,
} from "@/lib/consistency-record";

describe("completionPct", () => {
  it("is round(verifiedClosed / closedDueDays) of elapsed, not duration", () => {
    expect(completionPct(9, 12)).toBe("75%");
    expect(completionPct(12, 75)).toBe("16%");
    expect(completionPct(0, 0)).toBe("—");
  });
});

describe("consistency copy", () => {
  it("matches the frame 41 table", () => {
    expect(CONSISTENCY_TITLE).toBe("Consistency");
    expect(ofElapsed(12)).toBe("of 12");
    expect(heroDayLine(12, 75)).toBe("Day 12 of 75.");
    expect(daysValue(9)).toBe("9 days");
    expect(challengeProofCaption(7, 2)).toBe("7 camera proof, 2 self-reported");
    expect(CONSISTENCY_FOOTER).toBe(
      "A day counts as secured when every task in it was done. Self-reported days count toward the streak and are listed separately above. Nothing here is a claim that they were checked.",
    );
  });
});
