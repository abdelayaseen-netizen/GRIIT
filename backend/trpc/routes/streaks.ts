import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import {
  addCalendarDaysToDateKey,
  daysBetweenKeys,
  getYesterdayDateKey,
  getProfileTimeZoneForUser,
} from "../../lib/date-utils";

/** Free-tier monthly freeze allotment. Pro uses STREAK_FREEZE_PER_MONTH_PRO. */
export const STREAK_FREEZE_PER_MONTH_FREE = 1;
export const STREAK_FREEZE_PER_MONTH_PRO = 4;
const FREEZE_ELIGIBLE_MISSED_DAYS = 1;
/** 30-day refill window from last_freeze_used_at (same interval as the old reset clock). */
export const FREEZE_RESET_DAYS = 30;

export function monthlyFreezeLimit(isPremium: boolean): number {
  return isPremium ? STREAK_FREEZE_PER_MONTH_PRO : STREAK_FREEZE_PER_MONTH_FREE;
}

export function freezeWindowExpired(lastUsedAt: Date | null, now: Date): boolean {
  if (!lastUsedAt) return false;
  return (now.getTime() - lastUsedAt.getTime()) / (1000 * 60 * 60 * 24) >= FREEZE_RESET_DAYS;
}

export function restoreStreakCount(input: {
  activeStreakCount: number;
  lastCompletedDateKey: string | null;
  securedDateKeys: readonly string[];
}): number {
  if (input.activeStreakCount > 0) return input.activeStreakCount;
  if (!input.lastCompletedDateKey) return 0;
  const set = new Set(input.securedDateKeys);
  let n = 0;
  let cursor = input.lastCompletedDateKey;
  while (set.has(cursor)) {
    n += 1;
    cursor = addCalendarDaysToDateKey(cursor, -1);
  }
  return n > 0 ? n : 1;
}

export function effectiveFreezesRemaining(input: {
  storedRemaining: number | null | undefined;
  lastFreezeUsedAt: string | null | undefined;
  isPro: boolean;
  now?: Date;
}): { remaining: number; limit: number } {
  const limit = monthlyFreezeLimit(input.isPro);
  const lastUsed = input.lastFreezeUsedAt ? new Date(input.lastFreezeUsedAt) : null;
  const now = input.now ?? new Date();
  // Never used: DB default remaining is 1, which would hide a Pro allotment of 4.
  if (!input.lastFreezeUsedAt || freezeWindowExpired(lastUsed, now)) {
    return { remaining: limit, limit };
  }
  const stored = input.storedRemaining;
  const remaining = typeof stored === "number" && Number.isFinite(stored) ? stored : limit;
  return { remaining: Math.max(0, remaining), limit };
}

export const streaksRouter = createTRPCRouter({
  getFreezeStatus: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from("profiles")
      .select("is_premium, streak_freezes_remaining, last_freeze_used_at")
      .eq("user_id", ctx.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load freeze status." });
    }

    const isPro = !!(profile as { is_premium?: boolean } | null)?.is_premium;
    const { remaining, limit } = effectiveFreezesRemaining({
      storedRemaining: (profile as { streak_freezes_remaining?: number | null } | null)
        ?.streak_freezes_remaining,
      lastFreezeUsedAt: (profile as { last_freeze_used_at?: string | null } | null)
        ?.last_freeze_used_at,
      isPro,
    });
    return { remaining, limit, isPro };
  }),
  /**
   * Spend a freeze for yesterday. Inserts freeze_uses, decrements remaining,
   * stamps last_freeze_used_at, and writes active_streak_count back.
   */
  useFreeze: protectedProcedure
    .input(z.object({ dateKeyToFreeze: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ input, ctx }) => {
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const yesterdayKey = getYesterdayDateKey(tz);

      if (input.dateKeyToFreeze !== yesterdayKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used for yesterday." });
      }

      const [streakRes, profileRes, securesRes] = await Promise.all([
        ctx.supabase
          .from("streaks")
          .select("last_completed_date_key, active_streak_count")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase
          .from("profiles")
          .select("streak_freezes_remaining, last_freeze_used_at, is_premium")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase.from("day_secures").select("date_key").eq("user_id", ctx.userId).limit(400),
      ]);

      if (streakRes.error && streakRes.error.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load streak." });
      }
      if (profileRes.error && profileRes.error.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load profile." });
      }

      const streak = streakRes.data;
      const profile = profileRes.data as {
        streak_freezes_remaining?: number | null;
        last_freeze_used_at?: string | null;
        is_premium?: boolean;
      } | null;

      const lastKey = streak?.last_completed_date_key ?? null;
      const activeStreak = streak?.active_streak_count ?? 0;
      const isPro = !!profile?.is_premium;
      const { remaining } = effectiveFreezesRemaining({
        storedRemaining: profile?.streak_freezes_remaining,
        lastFreezeUsedAt: profile?.last_freeze_used_at,
        isPro,
      });

      const missedDays = lastKey == null ? [] : daysBetweenKeys(lastKey, yesterdayKey);
      if (missedDays.length !== FREEZE_ELIGIBLE_MISSED_DAYS || !missedDays.includes(yesterdayKey)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used when you missed exactly one day (yesterday)." });
      }
      if (remaining <= 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No streak freezes left this month." });
      }

      const previous = restoreStreakCount({
        activeStreakCount: activeStreak,
        lastCompletedDateKey: lastKey,
        securedDateKeys: (securesRes.data ?? []).map((r: { date_key: string }) => r.date_key),
      });
      if (previous <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No streak to restore." });
      }

      const nextRemaining = remaining - 1;
      const { error: insertErr } = await ctx.supabase
        .from("freeze_uses")
        .insert({ user_id: ctx.userId, date_key: yesterdayKey });
      if (insertErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to use streak freeze." });
      }

      const { error: profileErr } = await ctx.supabase
        .from("profiles")
        .update({
          streak_freezes_remaining: nextRemaining,
          last_freeze_used_at: new Date().toISOString(),
        })
        .eq("user_id", ctx.userId);
      if (profileErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to use streak freeze." });
      }

      const { error: streakErr } = await ctx.supabase
        .from("streaks")
        .update({ active_streak_count: previous })
        .eq("user_id", ctx.userId);
      if (streakErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to use streak freeze." });
      }

      return { restoredStreak: previous, remaining: nextRemaining };
    }),
});
