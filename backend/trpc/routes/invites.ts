/**
 * Build 92 chunk 08.1: short invite codes.
 * `create` hands the inviter a code for a challenge they are in; `resolve` turns a code into the
 * challenge, the inviter's name and what opening it means for the viewer.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
import { getSupabaseServer } from "../../lib/supabase-server";
import { GROUP_MAX_MEMBERS } from "../../lib/group-challenges";
import { inviteBaseUrl, inviteOutcome, type InviteOutcome } from "../../lib/invite-codes";
import {
  findInviteByCode,
  getOrCreateInviteCode,
  inviterDisplayName,
  loadInviteChallenge,
} from "../../lib/invite-store";

function service() {
  const s = getSupabaseServer();
  if (!s) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invites are not available right now." });
  }
  return s;
}

export const invitesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const s = service();
      const { data: challenge } = await s
        .from("challenges")
        .select("id")
        .eq("id", input.challengeId)
        .maybeSingle();
      if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      const code = await getOrCreateInviteCode(s, { inviterId: ctx.userId, challengeId: input.challengeId });
      return { code, url: `${inviteBaseUrl()}/i/${code}` };
    }),

  resolve: publicProcedure
    .input(z.object({ code: z.string().min(6).max(16) }))
    .query(async ({ input, ctx }) => {
      const s = service();
      const invite = await findInviteByCode(s, input.code);
      if (!invite) return { found: false as const };
      const [challenge, inviterName] = await Promise.all([
        loadInviteChallenge(s, invite.challengeId),
        inviterDisplayName(s, invite.inviterId),
      ]);
      if (!challenge) return { found: false as const };

      let outcome: InviteOutcome | null = null;
      if (ctx.userId) {
        const [{ data: members }, { count: active }, { count: pending }] = await Promise.all([
          s.from("challenge_members").select("user_id").eq("challenge_id", challenge.id).eq("status", "active"),
          s
            .from("challenge_members")
            .select("id", { count: "exact", head: true })
            .eq("challenge_id", challenge.id)
            .eq("status", "active"),
          s
            .from("challenge_invites")
            .select("id", { count: "exact", head: true })
            .eq("challenge_id", challenge.id)
            .eq("status", "pending"),
        ]);
        const memberIds = ((members ?? []) as Array<{ user_id: string }>).map((m) => m.user_id);
        const { data: enrolled } = await s
          .from("active_challenges")
          .select("id")
          .eq("challenge_id", challenge.id)
          .eq("user_id", ctx.userId)
          .limit(1)
          .maybeSingle();
        if (enrolled) memberIds.push(ctx.userId);
        outcome = inviteOutcome({
          viewerId: ctx.userId,
          inviterId: invite.inviterId,
          memberIds,
          seats: (active ?? 0) + (pending ?? 0),
          cap: GROUP_MAX_MEMBERS,
          runStatus: challenge.runStatus,
          participationType: challenge.participationType,
        });
      }

      return {
        found: true as const,
        code: invite.code,
        challengeId: challenge.id,
        inviterId: invite.inviterId,
        inviterName,
        challengeName: challenge.title,
        participationType: challenge.participationType,
        outcome,
      };
    }),
});
