import { ROUTES } from "@/lib/routes";

/** Expand small header hits to the 44pt target. */
export const FEED_TAP_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;

export function feedAuthorHref(args: {
  viewerUserId?: string | null;
  authorUserId?: string | null;
  username?: string | null;
}): string {
  if (args.viewerUserId && args.authorUserId && args.viewerUserId === args.authorUserId) {
    return ROUTES.TABS_PROFILE;
  }
  const u = (args.username ?? "").trim();
  if (u && u !== "?" && u !== "Someone" && u.length >= 2 && !/^user_[0-9a-f]+$/i.test(u)) {
    return ROUTES.PROFILE_USERNAME(encodeURIComponent(u));
  }
  if (args.authorUserId) return ROUTES.PROFILE_USERNAME(encodeURIComponent(args.authorUserId));
  return ROUTES.TABS_PROFILE;
}

export function feedChallengeHref(challengeId: string | null | undefined): string | null {
  const id = (challengeId ?? "").trim();
  return id ? ROUTES.CHALLENGE_ID(id) : null;
}
