import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LIVE_FEED_PAGE_SIZE, liveFeedNextCursor } from "./live-feed-page";

describe("liveFeedNextCursor", () => {
  it("is null when the page is short", () => {
    expect(liveFeedNextCursor([{ createdAt: "2026-10-01T00:00:00Z" }], LIVE_FEED_PAGE_SIZE)).toBeNull();
  });

  it("returns the last createdAt when the page is full", () => {
    const posts = Array.from({ length: 20 }, (_, i) => ({ createdAt: `t${i}` }));
    expect(liveFeedNextCursor(posts, 20)).toBe("t19");
  });
});

describe("getLiveFeed page contract", () => {
  it("accepts a cursor and returns following_count plus nextCursor", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const live = src.slice(src.indexOf("getLiveFeed:"));
    expect(live).toContain("cursor:");
    expect(live).toContain("following_count");
    expect(live).toContain("nextCursor");
    expect(live).toContain("liveFeedNextCursor");
  });
});
