import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { STARTER_DEFINITIONS } from "../../lib/starter-seed";

const STARTER_IDS = STARTER_DEFINITIONS.map((s) => s.starter_id);

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
      if (error) throw new Error(error.message);
      return data?.id ?? null;
    }),

  /**
   * Join a starter challenge (same as challenges.join but by starterId).
   * Requires challenges to be seeded with source_starter_id.
   * Returns activeChallengeId and first taskId for day1-quick-win.
   */
  join: protectedProcedure
    .input(z.object({ starterId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!STARTER_IDS.includes(input.starterId as any)) {
        throw new Error("Invalid starter challenge");
      }
      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("*, challenge_tasks (*)")
        .eq("source_starter_id", input.starterId)
        .single();

      if (challengeError || !challenge) {
        throw new Error(
          challengeError?.message ?? "Starter challenge not found. Run seed to create starter challenges."
        );
      }

      const challengeId = challenge.id;
      const tasks = challenge.challenge_tasks ?? [];
      if (tasks.length === 0) {
        throw new Error("Starter challenge has no tasks");
      }

      const startAt = new Date().toISOString();
      const endAt = new Date();
      if ((challenge as any).duration_type === "24h") {
        endAt.setHours(endAt.getHours() + 24);
      } else {
        endAt.setDate(endAt.getDate() + ((challenge as any).duration_days ?? 1));
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

      if (acError) throw new Error(acError.message);

      const dateKey = new Date().toISOString().split("T")[0];
      const checkIns = tasks.map((t: any) => ({
        user_id: ctx.userId,
        active_challenge_id: activeChallenge.id,
        task_id: t.id,
        date_key: dateKey,
        status: "pending",
      }));

      await ctx.supabase.from("check_ins").insert(checkIns);

      await ctx.supabase
        .from("streaks")
        .upsert(
          {
            user_id: ctx.userId,
            active_streak_count: 0,
            longest_streak_count: 0,
          },
          { onConflict: "user_id" }
        );

      return {
        activeChallengeId: activeChallenge.id,
        taskId: tasks[0].id,
        challengeId,
      };
    }),
});
