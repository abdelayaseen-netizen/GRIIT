import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { requireNoError } from "../errors";
import { STARTER_DEFINITIONS } from "../../lib/starter-seed";
import { getTodayDateKey } from "../../lib/date-utils";

const STARTER_IDS = STARTER_DEFINITIONS.map((s) => s.starter_id);

/** Challenge row from DB when selecting for starter join (has duration fields). */
interface ChallengeRowForStarter {
  id: string;
  duration_type?: string | null;
  duration_days?: number | null;
  challenge_tasks?: { id: string }[] | null;
}

export const startersRouter = createTRPCRouter({
  /**
   * Resolve starterId to a challenge id. Challenges must be seeded with source_starter_id.
   * Returns null if not found (caller should seed first or use fallback).
   */
  getChallengeIdByStarterId: protectedProcedure
    .input(z.object({ starterId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("challenges")
        .select("id")
        .eq("source_starter_id", input.starterId)
        .maybeSingle();
      requireNoError(error, "Failed to resolve starter.");
      return data?.id ?? null;
    }),

  /**
   * Join a starter challenge (same as challenges.join but by starterId).
   * Requires challenges to be seeded with source_starter_id.
   * Returns activeChallengeId and first taskId. (Previously used by day1-quick-win screen — screen removed as orphan.)
   */
  join: protectedProcedure
    .input(z.object({ starterId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!STARTER_IDS.includes(input.starterId as (typeof STARTER_IDS)[number])) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid starter challenge." });
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("*, challenge_tasks (*)")
        .eq("source_starter_id", input.starterId)
        .single();

      if (challengeError || !challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Starter challenge not found." });
      }

      const row = challenge as unknown as ChallengeRowForStarter;
      const challengeId = row.id;
      const { data: existingJoin } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", challengeId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (existingJoin) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this starter challenge." });
      }

      const tasks = row.challenge_tasks ?? [];
      if (tasks.length === 0) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Starter challenge has no tasks." });
      }

      const startAt = new Date().toISOString();
      const endAt = new Date();
      if (row.duration_type === "24h") {
        endAt.setHours(endAt.getHours() + 24);
      } else {
        endAt.setDate(endAt.getDate() + (row.duration_days ?? 1));
      }

      const { data: activeChallenge, error: acError } = await ctx.supabase
        .from("active_challenges")
        .insert({
          user_id: ctx.userId,
          challenge_id: challengeId,
          status: "active",
          start_at: startAt,
          end_at: endAt.toISOString(),
          current_day: 1,
          progress_percent: 0,
        })
        .select()
        .single();

      if (acError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ err: acError, challengeId }, "[starters.joinStarter] Insert active_challenges failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: acError.message || acError.code || "Failed to create active challenge.",
        });
      }

      const dateKey = getTodayDateKey();
      const checkIns = tasks.map((t) => ({
        user_id: ctx.userId,
        active_challenge_id: activeChallenge.id,
        task_id: t.id,
        date_key: dateKey,
        status: "pending",
      }));

      const { error: checkInsErr } = await ctx.supabase.from("check_ins").insert(checkIns);
      requireNoError(checkInsErr, "Failed to create check-ins.");

      const { error: streakErr } = await ctx.supabase
        .from("streaks")
        .upsert(
          {
            user_id: ctx.userId,
            active_streak_count: 0,
            longest_streak_count: 0,
          },
          { onConflict: "user_id" }
        );
      requireNoError(streakErr, "Failed to initialize streak.");

      const firstTask = tasks[0];
      if (!firstTask) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Starter challenge has no tasks." });
      }
      return {
        activeChallengeId: activeChallenge.id,
        taskId: firstTask.id,
        challengeId,
      };
    }),
});
