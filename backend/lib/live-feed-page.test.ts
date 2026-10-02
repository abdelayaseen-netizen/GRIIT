import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  collectLiveFeedPage,
  eventAfterCursor,
  LIVE_FEED_PAGE_SIZE,
  parseLiveFeedCursor,
} from "./live-feed-page";

type Ev = { created_at: string; id: string; keep?: boolean };

function ev(id: string, created_at: string, keep = true): Ev {
  return { id, created_at, keep };
}

describe("parseLiveFeedCursor", () => {
  it("accepts ISO datetime, compound, and JSON; junk is first page", () => {
    expect(parseLiveFeedCursor("2026-10-01T12:00:00.000Z")).toEqual({
      createdAt: "2026-10-01T12:00:00.000Z",
      id: null,
    });
    expect(parseLiveFeedCursor("2026-10-01T12:00:00.000Z|evt-9")).toEqual({
      createdAt: "2026-10-01T12:00:00.000Z",
      id: "evt-9",
    });
    expect(
      parseLiveFeedCursor(JSON.stringify({ created_at: "2026-10-01T12:00:00.000Z", id: "evt-9" })),
    ).toEqual({ createdAt: "2026-10-01T12:00:00.000Z", id: "evt-9" });
    expect(parseLiveFeedCursor("not-a-cursor")).toBeNull();
    expect(parseLiveFeedCursor("yesterday")).toBeNull();
    expect(parseLiveFeedCursor("")).toBeNull();
  });
});

describe("collectLiveFeedPage", () => {
  it("keeps scanning past filtered-out events instead of ending the page early", () => {
    const source: Ev[] = [];
    for (let i = 29; i >= 0; i--) {
      source.push(ev(`id-${String(i).padStart(2, "0")}`, `2026-10-01T12:00:${String(i).padStart(2, "0")}.000Z`, i < 3));
    }
    const page = collectLiveFeedPage({
      source,
      limit: 3,
      keep: (row) => row.keep === true,
    });
    expect(page.items.map((r) => r.id)).toEqual(["id-02", "id-01", "id-00"]);
    expect(page.lastScanned?.id).toBe("id-00");
    expect(page.nextCursor).toBeNull();
  });

  it("returns every equal-timestamp event once across pages", () => {
    const t = "2026-10-01T12:00:00.000Z";
    const source = [ev("d", t), ev("c", t), ev("b", t), ev("a", t)];
    const first = collectLiveFeedPage({ source, limit: 2, keep: () => true });
    expect(first.items.map((r) => r.id)).toEqual(["d", "c"]);
    const second = collectLiveFeedPage({
      source,
      cursorRaw: first.nextCursor,
      limit: 2,
      keep: () => true,
    });
    expect(second.items.map((r) => r.id)).toEqual(["b", "a"]);
    const seen = [...first.items, ...second.items].map((r) => r.id);
    expect(seen).toEqual(["d", "c", "b", "a"]);
    expect(new Set(seen).size).toBe(4);
    expect(second.nextCursor).toBeNull();
  });

  it("a datetime-only cursor does not skip later ids at that timestamp twice", () => {
    const t = "2026-10-01T12:00:00.000Z";
    expect(eventAfterCursor({ created_at: t, id: "a" }, { createdAt: t, id: null })).toBe(false);
    expect(eventAfterCursor({ created_at: "2026-10-01T11:00:00.000Z", id: "a" }, { createdAt: t, id: null })).toBe(
      true,
    );
  });
});

describe("getLiveFeed page contract", () => {
  it("parses the cursor and pages from the last scanned event", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const live = src.slice(src.indexOf("getLiveFeed:"));
    expect(live).toContain("cursor:");
    expect(live).toContain("following_count");
    expect(live).toContain("nextCursor");
    expect(live).toContain("parseLiveFeedCursor");
    expect(live).toContain("eventAfterCursor");
    expect(live).toContain("liveFeedNextCursor");
    expect(LIVE_FEED_PAGE_SIZE).toBe(20);
  });
});
