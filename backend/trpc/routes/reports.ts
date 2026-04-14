import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { logger } from "../../lib/logger";
import { sendPush } from "../../lib/sendPush";

// Hardcoded moderator user_id. To support multiple moderators later,
// move to env var (comma-separated UUIDs) and loop notifications.
const MODERATOR_USER_IDS = ["2853ab9c-ef7b-43e2-9429-8d14ca7cad15"] as const;

const REPORT_REASONS = [
  "inappropriate",
  "spam",
  "harassment",
  "dangerous",
  "off_topic",
  "other",
] as const;

export const reportsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        reason: z.enum(REPORT_REASONS),
        details: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: challenge, error: chErr } = await ctx.supabase
        .from("challenges")
        .select("id, title, creator_id")
        .eq("id", input.challengeId)
        .single();
      if (chErr || !challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found.",
        });
      }

      const { data: report, error: reportErr } = await ctx.supabase
        .from("challenge_reports")
        .insert({
          challenge_id: input.challengeId,
          reporter_user_id: ctx.userId,
          reason: input.reason,
          details: input.details ?? null,
        })
        .select("id")
        .single();

      if (reportErr) {
        const code = (reportErr as { code?: string }).code;
        if (code === "23505") {
          // Already reported by this user — return success silently
          return { success: true, alreadyReported: true };
        }
        logger.error({ err: reportErr, userId: ctx.userId, challengeId: input.challengeId }, "[reports.create] insert failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not submit your report. Please try again.",
        });
      }

      // Best-effort moderator notification. Failure here does not fail
      // the report itself (the report is already committed).
      try {
        const { data: moderators } = await ctx.supabase
          .from("profiles")
          .select("user_id, push_token")
          .in("user_id", MODERATOR_USER_IDS as unknown as string[]);
        const challengeTitle = (challenge as { title?: string }).title ?? "a challenge";
        for (const mod of moderators ?? []) {
          const token = (mod as { push_token?: string | null }).push_token;
          if (!token) continue;
          await sendPush({
            toToken: token,
            title: "New challenge report",
            body: `"${challengeTitle}" was reported as ${input.reason}.`,
            data: {
              type: "challenge_report",
              report_id: (report as { id: string }).id,
              challenge_id: input.challengeId,
            },
          });
        }
      } catch (notifyErr) {
        logger.warn({ err: notifyErr }, "[reports.create] moderator notification failed (report itself succeeded)");
      }

      return { success: true, alreadyReported: false };
    }),
});
