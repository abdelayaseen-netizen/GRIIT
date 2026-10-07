import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogCoverCategory } from "@/lib/catalog-cover";

describe("Discover cards", () => {
  it("never renders ProofFallbackTile and drops Be the first", () => {
    const discover = readFileSync(resolve(__dirname, "../components/discover/DiscoverV3.tsx"), "utf8");
    const card = readFileSync(resolve(__dirname, "../components/discover/ChallengeCard.tsx"), "utf8");
    expect(discover).not.toContain("ProofFallbackTile");
    expect(card).not.toContain("ProofFallbackTile");
    expect(card).toContain("<Cover");
    expect(discover).not.toContain("Be the first");
    expect(discover).not.toContain("featuredMembersLine");
  });

  it("maps catalog categories onto the Cover generator", () => {
    expect(catalogCoverCategory("body")).toBe("Fitness");
    expect(catalogCoverCategory("faith")).toBe("Faith");
    expect(catalogCoverCategory("focus")).toBe("Discipline");
  });
});
