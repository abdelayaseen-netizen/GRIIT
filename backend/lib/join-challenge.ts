/**
 * Direct join challenge: insert active_challenges + check_ins + upsert streaks.
 * Replaces the missing join_challenge RPC so join works without deploying the SQL function.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { getTodayDateKey } from "./date-utils";

export type JoinChallengeResult = { id: string; user_id: string; challenge_id: string; status: string; start_at: string; end_at: string; current_day: number; progress_percent: number; created_at?: string; completed_at?: string | null };

/**
 * Join a challenge for the given user: insert active_challenges, seed check_ins for all tasks, upsert streaks.
 * Idempotent: if already joined, throws BAD_REQUEST "You have already joined this challenge."
 */
export async function joinChallengeDirect(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<JoinChallengeResult> {
  const { data: existing } = await supabase
    .from("active_challenges")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, duration_type, duration_days")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
  }

  const startAt = new Date();
  const endAt = new Date();
  const durationType = (challenge as { duration_type?: string }).duration_type;
  const durationDays = (challenge as { duration_days?: number }).duration_days ?? 1;
  if (durationType === "24h") {
    endAt.setTime(startAt.getTime() + 24 * 60 * 60 * 1000);
  } else {
    endAt.setDate(endAt.getDate() + durationDays);
  }

  const { data: activeChallenge, error: insertErr } = await supabase
    .from("active_challenges")
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      status: "active",
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      current_day: 1,
      progress_percent: 0,
    })
    .select()
    .single();

  if (insertErr) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[JOIN-BACKEND] Insert active_challenges error:", insertErr);
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: insertErr.message || "Failed to join challenge.",
    });
  }

  const { data: tasks } = await supabase
    .from("challenge_tasks")
    .select("id")
    .eq("challenge_id", challengeId);

  const taskList = (tasks ?? []) as { id: string }[];
  if (taskList.length > 0) {
    const dateKey = getTodayDateKey();
    const checkIns = taskList.map((t) => ({
      user_id: userId,
      active_challenge_id: activeChallenge.id,
      task_id: t.id,
      date_key: dateKey,
      status: "pending",
    }));
    const { error: checkInsErr } = await supabase.from("check_ins").insert(checkIns);
    if (checkInsErr) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[JOIN-BACKEND] Insert check_ins error:", checkInsErr);
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: checkInsErr.message || "Failed to create check-ins.",
      });
    }
  }

  const { data: existingStreak } = await supabase
    .from("streaks")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!existingStreak) {
    const { error: streakErr } = await supabase.from("streaks").insert({
      user_id: userId,
      active_streak_count: 0,
      longest_streak_count: 0,
    });
    if (streakErr) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[JOIN-BACKEND] Insert streaks error:", streakErr);
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: streakErr.message || "Failed to initialize streak.",
      });
    }
  }

  return activeChallenge as JoinChallengeResult;
}
