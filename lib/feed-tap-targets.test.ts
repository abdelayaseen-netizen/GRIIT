import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/lib/routes";
import { FEED_TAP_HIT_SLOP, feedAuthorHref, feedChallengeHref } from "./feed-tap-targets";

describe("feed tap targets", () => {
  it("author avatar/name maps to profile ROUTES", () => {
    expect(
      feedAuthorHref({
        viewerUserId: "me",
        authorUserId: "me",
        username: "puresoul",
      }),
    ).toBe(ROUTES.TABS_PROFILE);
    expect(
      feedAuthorHref({
        viewerUserId: "me",
        authorUserId: "them",
        username: "puresoul",
      }),
    ).toBe(ROUTES.PROFILE_USERNAME("puresoul"));
    expect(FEED_TAP_HIT_SLOP.top + 20).toBeGreaterThanOrEqual(32);
  });

  it("challenge label maps to challenge detail", () => {
    expect(feedChallengeHref("ch-water")).toBe(ROUTES.CHALLENGE_ID("ch-water"));
    expect(feedChallengeHref(null)).toBeNull();
    const live = readFileSync(resolve(__dirname, "../components/LiveFeedSection.tsx"), "utf8");
    expect(live).toContain("feedChallengeHref");
    expect(live).toContain("feedAuthorHref");
    expect(live).toContain("ROUTES.PROFILE_PROOF");
    const detail = readFileSync(resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"), "utf8");
    expect(detail).toContain("This challenge is private.");
  });
});
