/**
 * Friends = mutual accepted user_follows.
 * Viewer follows author AND author follows viewer. Pending does not count.
 * The viewer is never in the friend set; own content is allowed by canSeeContent.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type VisibilityLevel = "public" | "friends" | "private";

export function normalizeVisibilityLevel(raw: string | null | undefined): VisibilityLevel {
  const s = String(raw ?? "public").toLowerCase();
  if (s === "friends" || s === "private") return s;
  return "public";
}

function followAccepted(row: { status?: string | null } | null | undefined): boolean {
  if (!row) return false;
  return String(row.status ?? "accepted").toLowerCase() === "accepted";
}

/** True only when both directions are accepted. Self is not a friend of self. */
export async function isFriend(
  supabase: SupabaseClient,
  viewerId: string,
  authorId: string,
): Promise<boolean> {
  if (!viewerId || !authorId || viewerId === authorId) return false;
  const [outRes, inRes] = await Promise.all([
    supabase
      .from("user_follows")
      .select("status")
      .eq("follower_id", viewerId)
      .eq("following_id", authorId)
      .maybeSingle(),
    supabase
      .from("user_follows")
      .select("status")
      .eq("follower_id", authorId)
      .eq("following_id", viewerId)
      .maybeSingle(),
  ]);
  return (
    followAccepted(outRes.data as { status?: string | null } | null) &&
    followAccepted(inRes.data as { status?: string | null } | null)
  );
}

/** Accepted mutual follows for a viewer. Does not include the viewer. */
export async function mutualFriendIds(supabase: SupabaseClient, viewerId: string): Promise<Set<string>> {
  const { data: out } = await supabase
    .from("user_follows")
    .select("following_id, status")
    .eq("follower_id", viewerId)
    .limit(200);
  const iFollow = new Set<string>();
  for (const r of (out ?? []) as { following_id: string; status?: string | null }[]) {
    if (followAccepted(r)) iFollow.add(r.following_id);
  }
  if (iFollow.size === 0) return new Set();
  const { data: inc } = await supabase
    .from("user_follows")
    .select("follower_id, status")
    .eq("following_id", viewerId)
    .limit(200);
  const mutual = new Set<string>();
  for (const r of (inc ?? []) as { follower_id: string; status?: string | null }[]) {
    if (followAccepted(r) && iFollow.has(r.follower_id)) mutual.add(r.follower_id);
  }
  return mutual;
}

const MEMBERSHIP_LIMIT = 200;

/** Enrollment still on the challenge, or a finished run. Quit/abandoned/failed do not count. */
function enrollmentCounts(status: string | null | undefined): boolean {
  const s = String(status ?? "").toLowerCase();
  return s === "active" || s === "completed";
}

function memberCounts(status: string | null | undefined): boolean {
  return String(status ?? "active").toLowerCase() === "active";
}

/**
 * Challenge ids where the viewer is an active member or has an active/finished enrollment.
 * Loaded once per request. Two bounded reads because members and enrollments are different tables.
 */
export function challengeIdSetsOverlap(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  for (const id of a) {
    if (b.has(id)) return true;
  }
  return false;
}

/** True when both people are on the same challenge (member or active/finished enrollment). */
export async function sharesChallenge(
  supabase: SupabaseClient,
  viewerId: string,
  ownerId: string,
): Promise<boolean> {
  if (!viewerId || !ownerId || viewerId === ownerId) return false;
  const [viewer, owner] = await Promise.all([
    coMemberChallengeIds(supabase, viewerId),
    coMemberChallengeIds(supabase, ownerId),
  ]);
  return challengeIdSetsOverlap(viewer, owner);
}

export async function coMemberChallengeIds(supabase: SupabaseClient, viewerId: string): Promise<Set<string>> {
  const [members, enrollments] = await Promise.all([
    supabase
      .from("challenge_members")
      .select("challenge_id, status")
      .eq("user_id", viewerId)
      .limit(MEMBERSHIP_LIMIT),
    supabase
      .from("active_challenges")
      .select("challenge_id, status")
      .eq("user_id", viewerId)
      .limit(MEMBERSHIP_LIMIT),
  ]);
  const ids = new Set<string>();
  for (const r of (members.data ?? []) as { challenge_id?: string | null; status?: string | null }[]) {
    if (r.challenge_id && memberCounts(r.status)) ids.add(r.challenge_id);
  }
  for (const r of (enrollments.data ?? []) as { challenge_id?: string | null; status?: string | null }[]) {
    if (r.challenge_id && enrollmentCounts(r.status)) ids.add(r.challenge_id);
  }
  return ids;
}

/** Feed selects omit share columns after filtering share_state = shared. An explicit kept/unshared row is not shared. */
export function eventIsShared(ev: { share_state?: string | null; shared?: boolean | null }): boolean {
  if (ev.shared === false) return false;
  if (ev.share_state === "shared" || ev.shared === true) return true;
  if (ev.share_state != null) return false;
  return true;
}

export type SeeContentOpts = {
  challengeId?: string | null;
  coMemberChallengeIds?: ReadonlySet<string>;
  shared?: boolean;
};

/**
 * Author always sees their own content.
 * Public: anyone. Friends: mutual follow. Private: owner only.
 * A shared event on a challenge the viewer joined (active or finished) is visible
 * even when that challenge is friends or private. Profile privacy does not use this bypass.
 */
export function canSeeContent(
  viewerId: string,
  authorId: string,
  visibility: VisibilityLevel,
  friendIds: ReadonlySet<string>,
  opts?: SeeContentOpts,
): boolean {
  if (viewerId === authorId) return true;
  if (visibility === "public") return true;
  const challengeId = opts?.challengeId ?? null;
  if (
    opts?.shared === true &&
    challengeId != null &&
    challengeId.length > 0 &&
    opts.coMemberChallengeIds?.has(challengeId)
  ) {
    return true;
  }
  if (visibility === "friends") return friendIds.has(authorId);
  return false;
}

export async function viewerCanSee(
  supabase: SupabaseClient,
  viewerId: string,
  authorId: string,
  visibility: string | null | undefined,
): Promise<boolean> {
  const level = normalizeVisibilityLevel(visibility);
  if (viewerId === authorId || level === "public") return true;
  if (level === "private") return false;
  return isFriend(supabase, viewerId, authorId);
}
