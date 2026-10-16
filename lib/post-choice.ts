/**
 * Build 90 04.1: one post choice after every task that has no photo review.
 * Post to feed (Friends or Everyone) or keep it private. Either answer ends the flow.
 * Photo tasks keep the ReviewStep chooser (v53.1 1510/1511), which already asks.
 */
import { postButtonLabel, type PostAudience } from "@/lib/post-audience";

export const POST_CHOICE_LABEL = "Who sees this";
export const POST_CHOICE_KEEP = "Keep it private";
export const POST_CHOICE_DEFAULT: PostAudience = "friends";
export const POST_CHOICE_AUDIENCES: readonly PostAudience[] = ["friends", "everyone"];

export function postChoiceLine(audience: PostAudience): string {
  if (audience === "everyone") return "Anyone on GRIIT can see it in the feed.";
  return "Your friends see it in their feed.";
}

export function postChoicePrimary(audience: PostAudience): string {
  return postButtonLabel(audience);
}

/** The audience the sheet sends for "Keep it private". It still counts for today. */
export const POST_CHOICE_PRIVATE: PostAudience = "only_me";

/**
 * A payload with no audience has not been asked yet. The photo review already
 * writes `audience`, so it never opens the sheet twice.
 */
export function needsPostChoice(payload: Record<string, unknown>): boolean {
  return typeof payload.audience !== "string";
}
