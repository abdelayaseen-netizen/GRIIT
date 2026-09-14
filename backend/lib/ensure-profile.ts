import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { guestUsername } from "./guest-username";

export type EnsureProfileResult = {
  created: boolean;
  user_id: string;
  username: string;
};

/**
 * Idempotent profiles row for `userId`.
 * Service-role or user client. No-op when the row already exists.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<EnsureProfileResult> {
  const { data: byUserId } = await supabase
    .from("profiles")
    .select("id, user_id, username")
    .eq("user_id", userId)
    .maybeSingle();
  if (byUserId) {
    const row = byUserId as { username: string | null };
    return {
      created: false,
      user_id: userId,
      username: row.username || guestUsername(userId),
    };
  }

  const { data: byId } = await supabase
    .from("profiles")
    .select("id, user_id, username")
    .eq("id", userId)
    .maybeSingle();
  if (byId) {
    const row = byId as { user_id: string | null; username: string | null };
    if (!row.user_id) {
      await supabase.from("profiles").update({ user_id: userId }).eq("id", userId);
    }
    return {
      created: false,
      user_id: userId,
      username: row.username || guestUsername(userId),
    };
  }

  const username = guestUsername(userId);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      user_id: userId,
      username,
      onboarding_completed: false,
    },
    { onConflict: "id" }
  );
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      return { created: false, user_id: userId, username };
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to ensure profile." });
  }
  return { created: true, user_id: userId, username };
}
