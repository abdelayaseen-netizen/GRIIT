import { describe, expect, it } from "vitest";
import { optimisticRespect, rollbackRespect, settleRespect } from "@/lib/feed-respect";

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
