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

describe("seeded duo rows hidden from Discover (08 follow-up)", () => {
  const seededDuo = { id: "duo-1", creator_id: null, title: "Accountability Duo", participation_type: "duo" };
  const seededSolo = { id: "solo-1", creator_id: null, title: "7K Steps", participation_type: "solo" };
  const seededTeam = { id: "team-1", creator_id: null, title: "Team run", participation_type: "team" };

  it("a global catalog duo row is dropped for every viewer", () => {
    expect(keepForDiscover(seededDuo, VIEWER)).toBe(false);
    expect(keepForDiscover(seededDuo, null)).toBe(false);
    expect(keepForDiscover({ ...seededDuo, participation_type: "DUO" }, null)).toBe(false);
    expect(filterDiscoverCatalog([seededDuo, seededSolo, seededTeam], VIEWER)).toEqual([seededSolo, seededTeam]);
  });

  it("solo, team and shared-goal catalog rows, and rows fetched without the column, still show", () => {
    expect(keepForDiscover(seededSolo, VIEWER)).toBe(true);
    expect(keepForDiscover(seededTeam, VIEWER)).toBe(true);
    expect(keepForDiscover({ creator_id: null, participation_type: "shared_goal" }, VIEWER)).toBe(true);
    expect(keepForDiscover({ creator_id: null }, VIEWER)).toBe(true);
    expect(keepForDiscover({ creator_id: null, participation_type: null }, VIEWER)).toBe(true);
  });

  it("the Team category count and the Team list go through the same filter", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/challenges-discover.ts"), "utf8");
    // getDiscoverCategoryCounts filters before counting duo/team as Team.
    expect(src).toMatch(/const catalogRows = filterDiscoverCatalog\(data \?\? \[\], ctx\.userId\);[\s\S]{0,900}counts\.Team/);
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
