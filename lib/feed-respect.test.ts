import { describe, expect, it } from "vitest";
import { optimisticRespect, rollbackRespect, settleRespect, respectHeart, commentsOpenFor } from "@/lib/feed-respect";
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

describe("respectHeart", () => {
  it("outline textSecondary when not respected; brand fill when respected", () => {
    const off = respectHeart(false);
    expect(off.fill).toBe("none");
    expect(off.color).toBe(DS_V3.color.textSecondary);
    expect(off.countColor).toBe(DS_V3.color.textSecondary);
    const on = respectHeart(true);
    expect(on.fill).toBe(DS_V3.color.brand);
    expect(on.color).toBe(DS_V3.color.brand);
    expect(on.countColor).toBe(DS_V3.color.brandText);
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
