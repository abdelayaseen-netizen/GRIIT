import type { SupabaseClient } from "@supabase/supabase-js";

export const PRIVATE_CHALLENGE_MESSAGE = "This challenge is private.";

export type ChallengeAccessRow = {
  id: string;
  visibility?: string | null;
  status?: string | null;
  creator_id?: string | null;
};

function visibilityOf(challenge: ChallengeAccessRow): string {
  return String(challenge.visibility ?? "").toUpperCase();
}

function isPublicPublished(challenge: ChallengeAccessRow): boolean {
  const status = String(challenge.status ?? "published").toLowerCase();
  return visibilityOf(challenge) === "PUBLIC" && status === "published";
}

/** True when the viewer may see the challenge row and its tasks. */
export async function canViewChallenge(
  supabase: SupabaseClient,
  viewerId: string | null,
  challenge: ChallengeAccessRow,
): Promise<boolean> {
  if (isPublicPublished(challenge)) return true;
  if (!viewerId) return false;
  if (challenge.creator_id && challenge.creator_id === viewerId) return true;

  const { data: enrolled } = await supabase
    .from("active_challenges")
    .select("id")
    .eq("user_id", viewerId)
    .eq("challenge_id", challenge.id)
    .limit(1)
    .maybeSingle();
  if (enrolled) return true;

  const { data: member } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("user_id", viewerId)
    .eq("challenge_id", challenge.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (member) return true;

  const { data: invite } = await supabase
    .from("challenge_invites")
    .select("id")
    .eq("invited_user_id", viewerId)
    .eq("challenge_id", challenge.id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  return Boolean(invite);
}

/** PRIVATE join is creator-only. Invitees accept via groups.respond. */
export function canJoinPrivateChallenge(
  viewerId: string,
  challenge: ChallengeAccessRow,
): boolean {
  if (visibilityOf(challenge) !== "PRIVATE") return true;
  return Boolean(challenge.creator_id && challenge.creator_id === viewerId);
}
