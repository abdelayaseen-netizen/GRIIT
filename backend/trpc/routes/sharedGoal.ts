import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const sharedGoalRouter = createTRPCRouter({
  logProgress: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        amount: z.number().positive(),
        unit: z.string().min(1).max(50),
        note: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: challenge, error: challengeErr } = await ctx.supabase
        .from("challenges")
        .select("id, participation_type, run_status, shared_goal_target, deadline_type, deadline_date")
        .eq("id", input.challengeId)
        .single();

      if (challengeErr || !challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      }

      const c = challenge as {
        participation_type?: string;
        run_status?: string;
        shared_goal_target?: number | null;
        deadline_type?: string | null;
        deadline_date?: string | null;
      };

      if (c.participation_type !== "shared_goal") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not a shared-goal challenge." });
      }
      if (c.run_status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge run is not active." });
      }

      const { data: member } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId)
        .maybeSingle();

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this challenge." });
      }

      const { error: insertErr } = await ctx.supabase.from("shared_goal_logs").insert({
        challenge_id: input.challengeId,
        user_id: ctx.userId,
        amount: input.amount,
        unit: input.unit,
        note: input.note ?? null,
      });

      if (insertErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to log progress." });
      }

      const { data: logs } = await ctx.supabase
        .from("shared_goal_logs")
        .select("amount")
        .eq("challenge_id", input.challengeId);

      const total = (logs ?? []).reduce((acc: number, r: { amount: number }) => acc + Number(r.amount), 0);
      const target = c.shared_goal_target ?? 0;
      const today = new Date().toISOString().split("T")[0];

      if (target > 0 && total >= target) {
        await ctx.supabase.from("challenges").update({ run_status: "completed" }).eq("id", input.challengeId);
        return { logged: true, total, completed: true };
      }

      if (c.deadline_type === "hard" && c.deadline_date) {
        if (c.deadline_date < today && total < target) {
          await ctx.supabase.from("challenges").update({ run_status: "failed" }).eq("id", input.challengeId);
          return { logged: true, total, failed: true };
        }
      }

      return { logged: true, total };
    }),
});
