import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type ActiveChallengeRow = {
  id: string;
  user_id: string;
  challenge_id: string;
};

/**
 * Asserts that the active challenge exists and belongs to the given user.
 * Returns the row (id, user_id, challenge_id) so callers can avoid redundant fetches.
 * Throws NOT_FOUND or FORBIDDEN; never returns if the resource is missing or not owned.
 */
export async function assertActiveChallengeOwnership(
  supabase: SupabaseClient,
  activeChallengeId: string,
  userId: string,
  /** Build 90 01b.2: extra columns to read in the same round trip (e.g. "start_at, current_day"). */
  extraColumns?: string,
): Promise<{ activeChallengeId: string; challenge_id: string; row: Record<string, unknown> }> {
  const columns: string = extraColumns ? `id, user_id, challenge_id, ${extraColumns}` : "id, user_id, challenge_id";
  const { data: row, error } = await supabase
    .from("active_challenges")
    .select(columns)
    .eq("id", activeChallengeId)
    .single();

  if (error || !row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Active challenge not found.",
    });
  }

  const r = row as unknown as ActiveChallengeRow;
  if (r.user_id !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this challenge.",
    });
  }

  return { activeChallengeId: r.id, challenge_id: r.challenge_id, row: row as unknown as Record<string, unknown> };
}
