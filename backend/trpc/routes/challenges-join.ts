import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import { joinChallengeDirect } from "../../lib/join-challenge";
import type { SupabaseClient } from "@supabase/supabase-js";
import logger from "../../lib/logger";

async function syncChallengeParticipantsCount(supabase: SupabaseClient, challengeId: string): Promise<void> {
  const { count: realCount } = await supabase
    .from("active_challenges")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)
    .eq("status", "active");
  await supabase.from("challenges").update({ participants_count: realCount ?? 0 }).eq("id", challengeId);
}

export const challengesJoinProcedures = {
  join: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const MAX_FREE_CHALLENGES = 3;
      logger.info({ input, userId: ctx.userId }, "[JOIN-BACKEND] Join procedure called");
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("subscription_status")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const isPremium =
        (profile as { subscription_status?: string } | null)?.subscription_status === "premium" ||
        (profile as { subscription_status?: string } | null)?.subscription_status === "trial";
      if (!isPremium) {
        const { count: activeCount } = await ctx.supabase
          .from("active_challenges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", ctx.userId)
          .eq("status", "active");
        if ((activeCount ?? 0) >= MAX_FREE_CHALLENGES) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free users can join up to 3 challenges. Upgrade to Premium for unlimited challenges.",
          });
        }
      }
      const { data: existingActive } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (existingActive) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("id")
        .eq("id", input.challengeId)
        .single();

      if (challengeError || !challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      }

      const participationType = "solo" as "solo" | "team" | "shared_goal";
      const teamSize = 1;
      const isTeamWaiting = false;

      if (isTeamWaiting) {
        const { data: existingMember } = await ctx.supabase
          .from("challenge_members")
          .select("id")
          .eq("challenge_id", input.challengeId)
          .eq("user_id", ctx.userId)
          .maybeSingle();

        if (existingMember) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
        }

        const { error: insertErr } = await ctx.supabase.from("challenge_members").insert({
          challenge_id: input.challengeId,
          user_id: ctx.userId,
          role: "member",
          status: "active",
        });

        if (insertErr) {
          if ((insertErr as { code?: string }).code === "23505") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join challenge." });
        }

        const { count: memberCount } = await ctx.supabase
          .from("challenge_members")
          .select("id", { count: "exact", head: true })
          .eq("challenge_id", input.challengeId);

        if ((memberCount ?? 0) >= teamSize) {
          await ctx.supabase.rpc("start_team_challenge", {
            p_challenge_id: input.challengeId,
          });
          if (participationType === "team") {
            const { data: myActive } = await ctx.supabase
              .from("active_challenges")
              .select("id, user_id, challenge_id, status, current_day, created_at")
              .eq("user_id", ctx.userId)
              .eq("challenge_id", input.challengeId)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (myActive) return myActive;
          }
          return { joined: true, runStatus: "active" as const };
        }

        return { joined: true, runStatus: "waiting" as const };
      }

      logger.debug({ challengeId: input.challengeId }, "[JOIN-BACKEND] Calling joinChallengeDirect");
      try {
        const [activeChallenge, chResult] = await Promise.all([
          joinChallengeDirect(ctx.supabase, ctx.userId, input.challengeId),
          ctx.supabase.from("challenges").select("title").eq("id", input.challengeId).single(),
        ]);
        const { data: ch } = chResult;
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "joined_challenge",
          challenge_id: input.challengeId,
          metadata: { challenge_name: (ch as { title?: string })?.title ?? "Challenge" },
        });
        // participants_count: sync to active join count after successful join
        await syncChallengeParticipantsCount(ctx.supabase, input.challengeId);
        logger.info({ activeChallengeId: activeChallenge.id }, "[JOIN-BACKEND] Join SUCCESS");
        return activeChallenge;
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        logger.error({ err: e, userId: ctx.userId }, "[JOIN-BACKEND] Join unexpected error");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" });
      }
    }),

  /** Leave a challenge: remove active_challenge (and cascade check_ins) or remove from challenge_members if team waiting. Creator cannot leave. */
  leave: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: challenge } = await ctx.supabase
        .from("challenges")
        .select("creator_id")
        .eq("id", input.challengeId)
        .maybeSingle();
      const creatorId = (challenge as { creator_id?: string } | null)?.creator_id;
      if (creatorId && creatorId === ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot leave a challenge you created." });
      }

      const { data: ac } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .maybeSingle();

      if (ac) {
        const { error: delErr } = await ctx.supabase
          .from("active_challenges")
          .delete()
          .eq("id", ac.id);
        if (delErr) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to leave challenge." });
        }
        // participants_count: sync after leaving (active_challenges row removed)
        await syncChallengeParticipantsCount(ctx.supabase, input.challengeId);
        await ctx.supabase
          .from("profiles")
          .update({ last_left_at: new Date().toISOString() })
          .eq("user_id", ctx.userId)
          .then(() => {});
        logger.info({ userId: ctx.userId, challengeId: input.challengeId }, "user left challenge");
        return { left: true };
      }

      const { error: memberErr } = await ctx.supabase
        .from("challenge_members")
        .delete()
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId);
      if (memberErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to leave challenge." });
      }
      // participants_count: sync after removing challenge_members row
      await syncChallengeParticipantsCount(ctx.supabase, input.challengeId);
      logger.info({ userId: ctx.userId, challengeId: input.challengeId }, "user left challenge");
      return { left: true };
    }),

};
