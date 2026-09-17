/**
 * Live-feed respect toggle: optimistic, settle from the server, rollback on failure.
 */
import { DS_V3 } from "@/lib/design-system";

export type RespectState = {
  reactedByMe: boolean;
  respectCount: number;
};

export function optimisticRespect(prev: RespectState): RespectState {
  return {
    reactedByMe: !prev.reactedByMe,
    respectCount: Math.max(0, prev.respectCount + (prev.reactedByMe ? -1 : 1)),
  };
}

export function settleRespect(
  result: { reacted?: boolean; reactionCount?: number },
  optimistic: RespectState,
): RespectState {
  return {
    reactedByMe: !!result.reacted,
    respectCount: Math.max(0, result.reactionCount ?? optimistic.respectCount),
  };
}

export function rollbackRespect(prev: RespectState): RespectState {
  return { reactedByMe: prev.reactedByMe, respectCount: prev.respectCount };
}

export function respectHeart(liked: boolean): {
  color: string;
  fill: string;
  countColor: string;
} {
  if (liked) {
    return {
      color: DS_V3.color.brand,
      fill: DS_V3.color.brand,
      countColor: DS_V3.color.brandText,
    };
  }
  return {
    color: DS_V3.color.textSecondary,
    fill: "none",
    countColor: DS_V3.color.textSecondary,
  };
}

export type CommentsOpen = "sheet" | "route";

/** Feed icon → sheet. Deep links and notification taps keep the route. */
export function commentsOpenFor(source: "feed_icon" | "deep_link" | "notification"): CommentsOpen {
  return source === "feed_icon" ? "sheet" : "route";
}
