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

/**
 * Author always sees their own content.
 * Public: anyone. Friends: mutual follow. Private: owner only.
 */
export function canSeeContent(
  viewerId: string,
  authorId: string,
  visibility: VisibilityLevel,
  friendIds: ReadonlySet<string>,
): boolean {
  if (viewerId === authorId) return true;
  if (visibility === "public") return true;
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
