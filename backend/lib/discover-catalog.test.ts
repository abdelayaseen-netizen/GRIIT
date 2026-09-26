import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  filterDiscoverCatalog,
  isCatalogChallenge,
  keepForDiscover,
} from "./discover-catalog";

const VIEWER = "user-own";
const OTHER = "user-other";

describe("discover catalog vs user-created", () => {
  it("catalog is creator_id null (seeded / daily / starters)", () => {
    expect(isCatalogChallenge({ creator_id: null })).toBe(true);
    expect(isCatalogChallenge({ creator_id: undefined })).toBe(true);
    expect(isCatalogChallenge({ creator_id: "", source_starter_id: "onboard-water" })).toBe(true);
  });

  it("own solo custom never kept for Discover", () => {
    const own = { id: "own", creator_id: VIEWER, title: "Don't spend for a day" };
    expect(keepForDiscover(own, VIEWER)).toBe(false);
    expect(filterDiscoverCatalog([own], VIEWER)).toEqual([]);
  });

  it("another user's solo custom never kept for Discover, even if PUBLIC", () => {
    const other = { id: "other", creator_id: OTHER, title: "Don't spend for a day" };
    expect(keepForDiscover(other, VIEWER)).toBe(false);
    expect(keepForDiscover(other, null)).toBe(false);
    expect(filterDiscoverCatalog([other, { id: "cat", creator_id: null }], VIEWER)).toEqual([
      { id: "cat", creator_id: null },
    ]);
  });
});

describe("Discover list procedures apply the catalog filter", () => {
  it("featured, grid, recommended, habits, feed, list, and recent completions", () => {
    const discover = readFileSync(resolve(__dirname, "../trpc/routes/challenges-discover.ts"), "utf8");
    const list = readFileSync(resolve(__dirname, "../trpc/routes/challenges.ts"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const create = readFileSync(resolve(__dirname, "../trpc/routes/challenges-create.ts"), "utf8");
    expect(discover).toContain("filterDiscoverCatalog");
    expect(discover).toMatch(/getDiscoverFeatured[\s\S]*filterDiscoverCatalog/);
    expect(discover).toMatch(/getDiscoverGrid[\s\S]*filterDiscoverCatalog/);
    expect(discover).toMatch(/getRecommended[\s\S]*filterDiscoverCatalog/);
    expect(discover).toMatch(/getDiscoverHabits[\s\S]*filterDiscoverCatalog/);
    expect(discover).toMatch(/getDiscoverFeed[\s\S]*filterDiscoverCatalog/);
    expect(list).toContain("filterDiscoverCatalog");
    expect(feed).toContain("filterDiscoverCatalog");
    expect(create).toContain("soloCreateVisibility");
    expect(create).toContain('from "../../lib/create-visibility"');
  });
});
