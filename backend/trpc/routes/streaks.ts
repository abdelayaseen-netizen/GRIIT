import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { dateKeyFromDate, parseDateKey, daysBetweenKeys } from "../../lib/date-utils";

const STREAK_FREEZE_PER_MONTH = 1;
const FREEZE_ELIGIBLE_MISSED_DAYS = 1;

export const streaksRouter = createTRPCRouter({
  /**
   * Use a streak freeze for the given missed date (e.g. yesterday).
   * Validates: exactly 1 missed day, streak > 0, freezes remaining this month.
   */
  useFreeze: protectedProcedure
    .input(z.object({ dateKeyToFreeze: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ input, ctx }) => {
      const todayKey = dateKeyFromDate(new Date());
      const yesterday = new Date(parseDateKey(todayKey));
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = dateKeyFromDate(yesterday);

      if (input.dateKeyToFreeze !== yesterdayKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used for yesterday." });
      }

      const [{ data: streak }, { data: profile }] = await Promise.all([
        ctx.supabase.from("streaks").select("last_completed_date_key, active_streak_count").eq("user_id", ctx.userId).single(),
        ctx.supabase.from("profiles").select("streak_freeze_used_count, streak_freeze_reset_at").eq("user_id", ctx.userId).single(),
      ]);

      const lastKey = streak?.last_completed_date_key ?? null;
      const activeStreak = streak?.active_streak_count ?? 0;
      let usedCount = profile?.streak_freeze_used_count ?? 0;
      let resetAt = profile?.streak_freeze_reset_at ? new Date(profile.streak_freeze_reset_at) : new Date();

      // Monthly reset
      const now = new Date();
      if ((now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24) >= 30) {
        usedCount = 0;
        resetAt = now;
        await ctx.supabase
          .from("profiles")
          .update({ streak_freeze_used_count: 0, streak_freeze_reset_at: resetAt.toISOString() })
          .eq("user_id", ctx.userId);
      }

      const missedDays = lastKey == null ? [] : daysBetweenKeys(lastKey, yesterdayKey);
      if (missedDays.length !== FREEZE_ELIGIBLE_MISSED_DAYS || !missedDays.includes(yesterdayKey)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used when you missed exactly one day (yesterday)." });
      }
      if (activeStreak <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active streak to protect." });
      }
      if (usedCount >= STREAK_FREEZE_PER_MONTH) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No streak freezes left this month." });
      }

      const { error: insertErr } = await ctx.supabase.from("streak_freezes").insert({
        user_id: ctx.userId,
        date_key: input.dateKeyToFreeze,
      });
      if (insertErr) {
        if ((insertErr as any).code === "23505") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze already used for this day." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to use streak freeze." });
      }

      await ctx.supabase
        .from("profiles")
        .update({
          streak_freeze_used_count: usedCount + 1,
        })
        .eq("user_id", ctx.userId);

      return { success: true };
    }),
});
