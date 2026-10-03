import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DISCOVER_V43_CATEGORY_IDS,
  DISCOVER_V43_CHALLENGE_SELECT,
  matchesDiscoverV43Category,
  rankChallengeIdsByJoins,
} from "./discover-v43";

describe("discover v43 helpers", () => {
  it("uses the shared six lowercase categories", () => {
    expect(DISCOVER_V43_CATEGORY_IDS).toEqual([
      "fitness",
      "faith",
      "mind",
      "health",
      "discipline",
      "learning",
    ]);
    expect(matchesDiscoverV43Category("Fitness", "fitness")).toBe(true);
    expect(matchesDiscoverV43Category("mind", "all")).toBe(true);
    expect(matchesDiscoverV43Category("faith", "health")).toBe(false);
  });

  it("ranks popular by joins in the last week", () => {
    expect(
      rankChallengeIdsByJoins([
        { challenge_id: "a" },
        { challenge_id: "b" },
        { challenge_id: "a" },
      ]),
    ).toEqual(["a", "b"]);
  });
});

describe("getDiscoverHome contract", () => {
  it("selects only known challenge columns and has no completionRate", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/challenges-discover.ts"), "utf8");
    expect(src).toContain("getDiscoverHome");
    expect(src).toContain("DISCOVER_V43_CHALLENGE_SELECT");
    expect(src).not.toMatch(/completionRate/);
    expect(DISCOVER_V43_CHALLENGE_SELECT).not.toContain("cover_url");
    expect(src).toContain(DISCOVER_V43_CHALLENGE_SELECT);
  });
});
