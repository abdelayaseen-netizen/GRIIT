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

  getRecentLogs: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid(), limit: z.number().min(1).max(50).optional().default(20) }))
    .query(async ({ input, ctx }) => {
      const { data: member } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this challenge." });
      }
      const { data: rows } = await ctx.supabase
        .from("shared_goal_logs")
        .select("id, user_id, amount, unit, note, logged_at")
        .eq("challenge_id", input.challengeId)
        .order("logged_at", { ascending: false })
        .limit(input.limit);
      const logs = (rows ?? []) as { id: string; user_id: string; amount: number; unit: string; note: string | null; logged_at: string }[];
      if (logs.length === 0) return [];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", [...new Set(logs.map((l) => l.user_id))]);
      const profileMap = new Map(
        (profiles ?? []).map((p: { user_id: string; display_name?: string | null; username?: string | null }) => [p.user_id, p])
      );
      return logs.map((l) => ({
        id: l.id,
        user_id: l.user_id,
        amount: l.amount,
        unit: l.unit,
        note: l.note,
        logged_at: l.logged_at,
        display_name: profileMap.get(l.user_id)?.display_name ?? profileMap.get(l.user_id)?.username ?? "Someone",
      }));
    }),

  getContributions: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: member } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this challenge." });
      }
      const { data: rows } = await ctx.supabase
        .from("shared_goal_logs")
        .select("user_id, amount")
        .eq("challenge_id", input.challengeId);
      const logs = (rows ?? []) as { user_id: string; amount: number }[];
      const byUser = new Map<string, number>();
      for (const l of logs) {
        byUser.set(l.user_id, (byUser.get(l.user_id) ?? 0) + Number(l.amount));
      }
      const totalAll = [...byUser.values()].reduce((a, b) => a + b, 0);
      const userIds = [...byUser.keys()];
      if (userIds.length === 0) return [];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", userIds);
      const profileMap = new Map(
        (profiles ?? []).map((p: { user_id: string; display_name?: string | null; username?: string | null }) => [p.user_id, p])
      );
      const list = userIds.map((uid) => ({
        user_id: uid,
        display_name: profileMap.get(uid)?.display_name ?? profileMap.get(uid)?.username ?? "Someone",
        total: byUser.get(uid) ?? 0,
        percent: totalAll > 0 ? ((byUser.get(uid) ?? 0) / totalAll) * 100 : 0,
      }));
      list.sort((a, b) => b.total - a.total);
      return list;
    }),
});
