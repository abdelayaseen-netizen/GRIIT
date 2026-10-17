import { ROUTES, userProfile } from "@/lib/routes";

/** Expand small header hits to the 44pt target. */
export const FEED_TAP_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;

/** A placeholder the server uses when it has no handle; never a route segment. */
export function usableHandle(username: string | null | undefined): string | null {
  const u = (username ?? "").trim();
  if (u && u !== "?" && u !== "Someone" && u.length >= 2 && !/^user_[0-9a-f]+$/i.test(u)) return u;
  return null;
}

/**
 * Where a tap on a person goes: own tab for the viewer, else `userProfile`
 * with the username, else the user id (the profile route accepts both).
 */
export function feedAuthorHref(args: {
  viewerUserId?: string | null;
  authorUserId?: string | null;
  username?: string | null;
}): string {
  if (args.viewerUserId && args.authorUserId && args.viewerUserId === args.authorUserId) {
    return ROUTES.TABS_PROFILE;
  }
  const u = usableHandle(args.username);
  if (u) return userProfile(u);
  if (args.authorUserId) return userProfile(args.authorUserId);
  return ROUTES.TABS_PROFILE;
}

export function feedChallengeHref(challengeId: string | null | undefined): string | null {
  const id = (challengeId ?? "").trim();
  return id ? ROUTES.CHALLENGE_ID(id) : null;
}
