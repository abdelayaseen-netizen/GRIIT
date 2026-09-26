import { describe, expect, it } from "vitest";
import { feedCardMeta } from "./feed-card-family";

describe("feedCardMeta finished", () => {
  const base = {
    eventType: "completed_challenge",
    isCompleted: true,
    hasProof: false,
    challengeName: "Iron man",
    currentDay: 14,
    totalDays: 14,
  };

  it("omits the line when securedDays is unknown", () => {
    expect(feedCardMeta(base, "challenge_finished")).toBe("");
  });

  it("never defaults unknown securedDays to 0", () => {
    expect(feedCardMeta(base, "challenge_finished")).not.toContain("0 of");
    expect(feedCardMeta({ ...base, securedDays: 9 }, "challenge_finished")).toBe(
      "9 of 14 days secured",
    );
  });
});
