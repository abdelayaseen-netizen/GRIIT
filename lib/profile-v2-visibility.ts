/**
 * Profile v2 visibility gate.
 * Friends = mutual accepted user_follows. Private = owner only. Public = anyone.
 */

export type VisibilityLevel = "public" | "friends" | "private";
export type ProfileRelationship = "self" | "accepted" | "none";

export function parseVisibility(raw: unknown): VisibilityLevel {
  const s = String(raw ?? "public").toLowerCase();
  if (s === "friends" || s === "private") return s;
  return "public";
}

export function canSeeLevel(level: VisibilityLevel, relationship: ProfileRelationship): boolean {
  if (relationship === "self") return true;
  if (level === "public") return true;
  if (level === "friends") return relationship === "accepted";
  return false;
}

export function resolveRecordGate(input: {
  profile: VisibilityLevel;
  challenges: VisibilityLevel;
  activity: VisibilityLevel;
  relationship: ProfileRelationship;
}): { profile: boolean; challenges: boolean; activity: boolean } {
  const profile = canSeeLevel(input.profile, input.relationship);
  return {
    profile,
    challenges: profile && canSeeLevel(input.challenges, input.relationship),
    activity: profile && canSeeLevel(input.activity, input.relationship),
  };
}

export function mutualFollowAccepted(
  outboundAccepted: boolean,
  inboundAccepted: boolean
): boolean {
  return outboundAccepted && inboundAccepted;
}

export type FollowRowStatus = "none" | "pending" | "following";

/**
 * Visitor relationship control.
 * Public: Follow → Following.
 * Friends/Private: Request to follow → Requested (pending) → Following (accepted).
 */
export function visitorFollowControl(
  profileVisibility: VisibilityLevel,
  status: FollowRowStatus
): {
  label: "Follow" | "Following" | "Request to follow" | "Requested";
  appearance: "primary" | "quiet";
  action: "follow" | "request" | "unfollow" | "idle";
} {
  const needsRequest = profileVisibility === "friends" || profileVisibility === "private";
  if (status === "following") {
    return { label: "Following", appearance: "quiet", action: "unfollow" };
  }
  if (needsRequest) {
    if (status === "pending") {
      return { label: "Requested", appearance: "quiet", action: "idle" };
    }
    return { label: "Request to follow", appearance: "primary", action: "request" };
  }
  return { label: "Follow", appearance: "primary", action: "follow" };
}
