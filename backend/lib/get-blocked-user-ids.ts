/**
 * Two-way block set for a viewer.
 *
 * Returns the set of user IDs the viewer has a block relationship with in EITHER
 * direction — users the viewer blocked AND users who blocked the viewer. Feed and
 * profile queries use this to enforce mutual invisibility (I don't see them and
 * they don't see me).
 *
 * One round-trip per request: the RLS SELECT policy on blocked_users returns rows
 * where the viewer is the blocker OR the blocked party, so a single query covers
 * both directions. Best-effort: on error it returns an empty set so a transient
 * failure degrades to "show everything" rather than breaking the feed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBlockedUserIds(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const blocked = new Set<string>();
  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)
    .limit(2000);
  if (error || !data) return blocked;
  for (const row of data as { blocker_id: string; blocked_id: string }[]) {
    const other = row.blocker_id === userId ? row.blocked_id : row.blocker_id;
    if (other && other !== userId) blocked.add(other);
  }
  return blocked;
}

/**
 * Whether two users have a block relationship in either direction.
 * Used by interaction paths (respect/comment) to suppress notifications.
 */
export async function isBlockRelationship(
  supabase: SupabaseClient,
  a: string,
  b: string
): Promise<boolean> {
  const { data } = await supabase
    .from("blocked_users")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`
    )
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
