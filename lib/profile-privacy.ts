/**
 * v43 account privacy without an is_private column.
 * Private if any of the three visibility fields is private or friends.
 */

const PRIVATE_LEVELS = new Set(["private", "friends"]);

export type PrivacyProfileFields = {
  id?: string | null;
  user_id?: string | null;
  profile_visibility?: string | null;
  challenge_visibility?: string | null;
  activity_visibility?: string | null;
};

function viewerIdOf(viewer: { id?: string | null } | string | null | undefined): string | null {
  if (typeof viewer === "string") return viewer;
  return viewer?.id ?? null;
}

function ownerIdOf(owner: PrivacyProfileFields): string | null {
  return owner.user_id ?? owner.id ?? null;
}

function isClosedLevel(raw: string | null | undefined): boolean {
  return PRIVATE_LEVELS.has(String(raw ?? "").toLowerCase());
}

export function isPrivateAccount(profile: PrivacyProfileFields | null | undefined): boolean {
  if (!profile) return false;
  return (
    isClosedLevel(profile.profile_visibility) ||
    isClosedLevel(profile.challenge_visibility) ||
    isClosedLevel(profile.activity_visibility)
  );
}

export function canSeeProfileContent(
  viewer: { id?: string | null } | string | null | undefined,
  owner: PrivacyProfileFields,
  rel: { isMutual?: boolean; isCoMember?: boolean },
): boolean {
  const viewerId = viewerIdOf(viewer);
  const ownerId = ownerIdOf(owner);
  if (viewerId && ownerId && viewerId === ownerId) return true;
  if (!isPrivateAccount(owner)) return true;
  if (rel.isMutual) return true;
  if (rel.isCoMember) return true;
  return false;
}

/** Maps the one-switch Privacy control onto the three existing columns. */
export function visibilitiesForPrivateSwitch(isPrivate: boolean): {
  profile_visibility: "private" | "public";
  challenge_visibility: "private" | "public";
  activity_visibility: "private" | "public";
} {
  const value = isPrivate ? "private" : "public";
  return {
    profile_visibility: value,
    challenge_visibility: value,
    activity_visibility: value,
  };
}
