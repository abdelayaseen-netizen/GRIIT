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
