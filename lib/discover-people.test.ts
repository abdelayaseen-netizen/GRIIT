import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CREATE_CATEGORIES } from "@/lib/challenge-category";
import {
  discoverCategoryMatches,
  discoverFeaturedChip,
  discoverGridWithoutHero,
  discoverPeopleVisible,
  discoverPeopleWithoutSelf,
} from "@/lib/discover-people";

describe("discover people and chips", () => {
  it("never keeps the viewer in People", () => {
    const self = "user-1";
    expect(
      discoverPeopleWithoutSelf(
        [
          { user_id: self, name: "Me" },
          { user_id: "user-2", name: "Sam" },
        ],
        self,
      ).map((p) => p.user_id),
    ).toEqual(["user-2"]);
  });

  it("drops user_ accounts from the People row", () => {
    expect(
      discoverPeopleVisible(
        [
          { user_id: "a", username: "user_abcd1234", display_name: "Younes" },
          { user_id: "b", username: "sam", display_name: "" },
          { user_id: "c", username: "user_ffff0000", display_name: null },
        ],
        null,
      ).map((p) => p.user_id),
    ).toEqual(["b"]);
  });

  it("filters recommended rows with the six Create categories", () => {
    expect(discoverCategoryMatches("fitness", "fitness")).toBe(true);
    expect(discoverCategoryMatches("body", "fitness")).toBe(true);
    expect(discoverCategoryMatches("health", "health")).toBe(true);
    expect(discoverCategoryMatches("learning", "mind")).toBe(false);
    expect(discoverFeaturedChip("fitness")).toBe("body");
    expect(discoverFeaturedChip("for_you")).toBe("all");
    const v3 = readFileSync(resolve(__dirname, "../components/discover/DiscoverV3.tsx"), "utf8");
    expect(v3).toContain("CREATE_CATEGORIES");
    expect(CREATE_CATEGORIES.map((c) => c.id)).toEqual([
      "fitness",
      "faith",
      "mind",
      "health",
      "discipline",
      "learning",
    ]);
    expect(v3).not.toContain('label: "Trending"');
    expect(v3).not.toContain('label: "Body"');
    const card = readFileSync(resolve(__dirname, "../components/discover/ChallengeCard.tsx"), "utf8");
    expect(card).toContain("<Cover");
    expect(card).toContain("{title}");
    expect(card).not.toContain("ProofFallbackTile");
    expect(card).not.toContain("featured ? undefined : fallbackTitle");
    const route = readFileSync(resolve(__dirname, "../app/(tabs)/discover.tsx"), "utf8");
    const suggested = readFileSync(
      resolve(__dirname, "../backend/trpc/routes/profiles-social.ts"),
      "utf8",
    );
    expect(route).toContain("discoverPeopleVisible");
    expect(route).not.toContain("New here");
    expect(route).toContain("discoverGridWithoutHero");
    expect(suggested).toContain('.neq("user_id", viewerId)');
  });

  it("keeps the hero challenge out of the grid", () => {
    expect(
      discoverGridWithoutHero(
        [
          { id: "hero", title: "Drink Water" },
          { id: "other", title: "Read" },
        ],
        "hero",
      ).map((c) => c.id),
    ).toEqual(["other"]);
    expect(discoverGridWithoutHero([{ id: "other", title: "Read" }], null)).toHaveLength(1);
  });
});
