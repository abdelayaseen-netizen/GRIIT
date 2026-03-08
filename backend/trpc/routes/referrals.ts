import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const referralsRouter = createTRPCRouter({
  /** Record that the current user opened the app from a link with ref (referrer). */
  recordOpen: protectedProcedure
    .input(
      z.object({
        referrerUserId: z.string().uuid(),
        challengeId: z.string().uuid().optional(),
        inviteCode: z.string().max(256).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.from("invite_tracking").insert({
        referrer_user_id: input.referrerUserId,
        referred_user_id: ctx.userId,
        challenge_id: input.challengeId ?? null,
        invite_code: input.inviteCode ?? null,
        source: "invite",
        joined_challenge: false,
      });
      if (error) {
        if ((error as { code?: string }).code === "23503") {
          return { success: false, message: "Invalid referrer or challenge." };
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record referral." });
      }
      return { success: true };
    }),

  /** Mark that the current user joined the challenge (for attribution). */
  markJoinedChallenge: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("invite_tracking")
        .update({ joined_challenge: true })
        .eq("referred_user_id", ctx.userId)
        .eq("challenge_id", input.challengeId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update referral." });
      }
      return { success: true };
    }),
});
