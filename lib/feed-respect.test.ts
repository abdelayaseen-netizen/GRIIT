import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { optimisticRespect, patchLiveFeedCache, rollbackRespect, settleRespect, respectHeart, commentsOpenFor } from "@/lib/feed-respect";
import { DS_V3 } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

describe("feed respect", () => {
  it("optimistic → settled → rollback", () => {
    const prev = { reactedByMe: false, respectCount: 3 };
    const optimistic = optimisticRespect(prev);
    expect(optimistic).toEqual({ reactedByMe: true, respectCount: 4 });

    const settled = settleRespect({ reacted: true, reactionCount: 4 }, optimistic);
    expect(settled).toEqual({ reactedByMe: true, respectCount: 4 });

    const rolled = rollbackRespect(prev);
    expect(rolled).toEqual({ reactedByMe: false, respectCount: 3 });
    expect(rolled.reactedByMe).toBe(prev.reactedByMe);
  });

  it("rollback restores the pre-optimistic count after a failed unlike", () => {
    const prev = { reactedByMe: true, respectCount: 1 };
    const optimistic = optimisticRespect(prev);
    expect(optimistic).toEqual({ reactedByMe: false, respectCount: 0 });
    expect(rollbackRespect(prev)).toEqual(prev);
  });
});

describe("live feed cache", () => {
  it("patches the post inside infinite-query pages", () => {
    const cache = {
      pageParams: [undefined],
      pages: [{ posts: [{ id: "a", reactedByMe: false, respectCount: 1 }, { id: "b", reactedByMe: false, respectCount: 0 }] }],
    };
    const next = patchLiveFeedCache(cache, "a", (post) => ({ ...post, reactedByMe: true, respectCount: 2 }));
    expect(next?.pages?.[0]?.posts?.[0]).toEqual({ id: "a", reactedByMe: true, respectCount: 2 });
    expect(next?.pages?.[0]?.posts?.[1]).toEqual({ id: "b", reactedByMe: false, respectCount: 0 });
    expect(next?.pageParams).toEqual([undefined]);
  });

  it("leaves a missing cache alone instead of reading a flat posts list", () => {
    expect(patchLiveFeedCache(undefined, "a", (post) => post)).toBeUndefined();
  });
});

describe("feed reaction RLS", () => {
  it("lets a user insert and delete only their own like", () => {
    const insert = readFileSync(resolve("supabase/migrations/20260322000000_feed_reactions_comments.sql"), "utf8");
    const del = readFileSync(resolve("supabase/migrations/20260329150000_feed_reactions_comments_delete_rls.sql"), "utf8");
    const react = readFileSync(resolve("backend/trpc/routes/feed.ts"), "utf8");
    expect(insert).toContain("WITH CHECK (auth.uid() = user_id)");
    expect(del).toContain('FOR DELETE TO authenticated');
    expect(del).toContain("USING (auth.uid() = user_id)");
    expect(react).toContain('.from("feed_reactions")');
    expect(react).toContain("reaction: \"fire\"");
  });
});

describe("respectHeart", () => {
  it("stays Text 1, filled when respected", () => {
    const off = respectHeart(false);
    expect(off.fill).toBe("none");
    expect(off.color).toBe(DS_V3.color.textPrimary);
    expect(off.countColor).toBe(DS_V3.color.textPrimary);
    const on = respectHeart(true);
    expect(on.fill).toBe(DS_V3.color.textPrimary);
    expect(on.color).toBe(DS_V3.color.textPrimary);
    expect(on.countColor).toBe(DS_V3.color.textPrimary);
  });
});

describe("commentsOpenFor", () => {
  it("feed icon opens the sheet; deep links keep the route", () => {
    expect(commentsOpenFor("feed_icon")).toBe("sheet");
    expect(commentsOpenFor("deep_link")).toBe("route");
    expect(commentsOpenFor("notification")).toBe("route");
    expect(ROUTES.POST_ID("abc")).toBe("/post/abc");
  });
});
