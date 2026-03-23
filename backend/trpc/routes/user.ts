import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import type { PgError } from "../../types/db";

/** Map onboarding challenge id to DB challenge uuid (must match seed). */
const ONBOARDING_CHALLENGE_IDS: Record<string, string> = {
  "75_hard": "a1000001-4000-4000-8000-000000000001",
  cold_shower_30: "a1000001-4000-4000-8000-000000000002",
  read_10_pages: "a1000001-4000-4000-8000-000000000005",
};

function notificationTimeFromTrainingTime(trainingTime: string | null | undefined): string {
  const map: Record<string, string> = {
    morning: "07:30",
    midday: "12:00",
    evening: "18:00",
    whenever: "09:00",
  };
  return (trainingTime && map[trainingTime]) || "09:00";
}

export const userRouter = createTRPCRouter({
  /**
   * After signup from onboarding: create/update profile with onboarding answers,
   * set onboarding_completed, and join the selected starter challenge.
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        motivation: z.string().optional(),
        persona: z.string().optional(),
        barrier: z.string().optional(),
        intensity: z.string().optional(),
        socialStyle: z.string().optional(),
        trainingTime: z.string().optional(),
        selectedChallengeId: z.string().optional(),
        displayName: z.string().optional(),
        username: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const displayName = (input.displayName ?? "").trim() || "User";
      const rawUsername = (input.username ?? "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20);
      const baseUsername = rawUsername.length >= 3 ? rawUsername : displayName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 24) || "user";
      const uniqueUsername = baseUsername.length >= 3 ? `${baseUsername}_${userId.slice(0, 6)}` : `user_${userId.slice(0, 8)}`;

      const { error: profileError } = await ctx.supabase.from("profiles").upsert(
        {
          user_id: userId,
          username: uniqueUsername,
          display_name: displayName,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_motivation: input.motivation ?? null,
          onboarding_persona: input.persona ?? null,
          onboarding_barrier: input.barrier ?? null,
          onboarding_intensity: input.intensity ?? null,
          onboarding_social_style: input.socialStyle ?? null,
          onboarding_training_time: input.trainingTime ?? null,
          notification_time_preference: notificationTimeFromTrainingTime(input.trainingTime),
          preferred_secure_time: notificationTimeFromTrainingTime(input.trainingTime),
          initial_challenge_id: input.selectedChallengeId
            ? ONBOARDING_CHALLENGE_IDS[input.selectedChallengeId] ?? null
            : null,
          onboarding_answers: {
            motivation: input.motivation,
            persona: input.persona,
            barrier: input.barrier,
            intensity: input.intensity,
            social_style: input.socialStyle,
            training_time: input.trainingTime,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (profileError) {
        const code = (profileError as PgError).code;
        if (code === "23505") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken." });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save profile.",
        });
      }

      const challengeUuid = input.selectedChallengeId
        ? ONBOARDING_CHALLENGE_IDS[input.selectedChallengeId]
        : null;

      if (challengeUuid) {
        try {
          const { joinChallengeDirect } = await import("../../lib/join-challenge");
          await joinChallengeDirect(ctx.supabase, userId, challengeUuid);
        } catch (err: unknown) {
          const code = (err as { code?: string })?.code;
          const msg = (err as { message?: string })?.message ?? "";
          if (code === "BAD_REQUEST" && msg.includes("already joined")) {
            // idempotent, ignore
          } else if (
            code === "NOT_FOUND" ||
            (err as { data?: { code?: string } }).data?.code === "23503"
          ) {
            // challenge missing or FK constraint; do not crash onboarding
          } else if (process.env.NODE_ENV !== "test") {
            const { logger } = await import("../../lib/logger");
            logger.warn({ msg, code }, "user.completeOnboarding joinChallengeDirect failed");
          }
        }
      }

      return { ok: true };
    }),
});
