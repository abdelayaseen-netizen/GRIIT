import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import {
  addCalendarDaysToDateKey,
  getTodayDateKey,
  getYesterdayDateKey,
  getProfileTimeZoneForUser,
} from "../../lib/date-utils";
import { getSupabaseAdmin } from "../../lib/supabase-admin";
import { logger } from "../../lib/logger";

type FreezeWriteError = {
  code?: string;
  message?: string;
  details?: string;
};

function rethrowFreezeWrite(requestId: string, op: string, error: FreezeWriteError): never {
  logger.error(
    {
      requestId,
      op,
      code: error.code,
      message: error.message,
      details: error.details,
    },
    "useFreeze write failed",
  );
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to use streak freeze." });
}

/** Free-tier monthly freeze allotment. Pro uses STREAK_FREEZE_PER_MONTH_PRO. */
export const STREAK_FREEZE_PER_MONTH_FREE = 1;
export const STREAK_FREEZE_PER_MONTH_PRO = 4;
/** 30-day refill window from last_freeze_used_at (same interval as the old reset clock). */
export const FREEZE_RESET_DAYS = 30;

export function monthlyFreezeLimit(isPremium: boolean): number {
  return isPremium ? STREAK_FREEZE_PER_MONTH_PRO : STREAK_FREEZE_PER_MONTH_FREE;
}

/** Yesterday is the only hole: last completed is the day before it, or today after a same-day secure. */
export function freezeEligibleYesterday(input: {
  lastCompletedDateKey: string | null;
  yesterdayKey: string;
  todayKey: string;
  securedDateKeys: readonly string[];
}): boolean {
  if (input.lastCompletedDateKey == null) return false;
  if (input.securedDateKeys.includes(input.yesterdayKey)) return false;
  const dayBefore = addCalendarDaysToDateKey(input.yesterdayKey, -1);
  return (
    input.lastCompletedDateKey === dayBefore || input.lastCompletedDateKey === input.todayKey
  );
}

export function freezeWindowExpired(lastUsedAt: Date | null, now: Date): boolean {
  if (!lastUsedAt) return false;
  return (now.getTime() - lastUsedAt.getTime()) / (1000 * 60 * 60 * 24) >= FREEZE_RESET_DAYS;
}

export function restoreStreakCount(input: {
  todayKey: string;
  lastCompletedDateKey: string | null;
  securedDateKeys: readonly string[];
  lastStandDateKeys?: readonly string[];
  frozenDateKeys?: readonly string[];
}): number {
  const secured = new Set(input.securedDateKeys);
  const bridge = new Set([
    ...(input.lastStandDateKeys ?? []),
    ...(input.frozenDateKeys ?? []),
  ]);
  const start = secured.has(input.todayKey) ? input.todayKey : input.lastCompletedDateKey;
  if (!start) return 0;
  let n = 0;
  let cursor = start;
  while (secured.has(cursor) || bridge.has(cursor)) {
    // Live increment: backend/lib/streak.ts:19 — only a secured day adds 1.
    if (secured.has(cursor)) n += 1;
    cursor = addCalendarDaysToDateKey(cursor, -1);
  }
  return n;
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
    return {
      remaining,
      limit,
      isPro,
      lastFreezeUsedAt:
        (profile as { last_freeze_used_at?: string | null } | null)?.last_freeze_used_at ?? null,
    };
  }),
  /**
   * Spend a freeze for yesterday. Inserts freeze_uses, decrements remaining,
   * stamps last_freeze_used_at, and writes active_streak_count back.
   */
  useFreeze: protectedProcedure
    .input(z.object({ dateKeyToFreeze: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ input, ctx }) => {
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const todayKey = getTodayDateKey(tz);
      const yesterdayKey = getYesterdayDateKey(tz);

      if (input.dateKeyToFreeze !== yesterdayKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used for yesterday." });
      }

      const [streakRes, profileRes, securesRes, standRes, freezeRes] = await Promise.all([
        ctx.supabase
          .from("streaks")
          .select("last_completed_date_key, active_streak_count, longest_streak_count")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase
          .from("profiles")
          .select("streak_freezes_remaining, last_freeze_used_at, is_premium")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase.from("day_secures").select("date_key").eq("user_id", ctx.userId).limit(400),
        ctx.supabase.from("last_stand_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
        ctx.supabase.from("freeze_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
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
      const isPro = !!profile?.is_premium;
      const { remaining } = effectiveFreezesRemaining({
        storedRemaining: profile?.streak_freezes_remaining,
        lastFreezeUsedAt: profile?.last_freeze_used_at,
        isPro,
      });

      const securedDateKeys = (securesRes.data ?? []).map((r: { date_key: string }) => r.date_key);
      if (
        !freezeEligibleYesterday({
          lastCompletedDateKey: lastKey,
          yesterdayKey,
          todayKey,
          securedDateKeys,
        })
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Freeze can only be used when you missed exactly one day (yesterday)." });
      }
      if (remaining <= 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No streak freezes left this month." });
      }

      const previous = restoreStreakCount({
        todayKey,
        lastCompletedDateKey: lastKey,
        securedDateKeys,
        lastStandDateKeys: (standRes.data ?? []).map((r: { date_key: string }) => r.date_key),
        frozenDateKeys: [
          ...(freezeRes.data ?? []).map((r: { date_key: string }) => r.date_key),
          yesterdayKey,
        ],
      });
      if (previous <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No streak to restore." });
      }

      const nextRemaining = remaining - 1;
      const admin = getSupabaseAdmin();
      const { error: insertErr } = await admin
        .from("freeze_uses")
        .insert({ user_id: ctx.userId, date_key: yesterdayKey });
      if (insertErr) {
        rethrowFreezeWrite(ctx.requestId, "freeze_uses.insert", insertErr);
      }

      const { error: profileErr } = await admin
        .from("profiles")
        .update({
          streak_freezes_remaining: nextRemaining,
          last_freeze_used_at: new Date().toISOString(),
        })
        .eq("user_id", ctx.userId);
      if (profileErr) {
        rethrowFreezeWrite(ctx.requestId, "profiles.update", profileErr);
      }

      const longestStreak = Math.max(previous, streak?.longest_streak_count || 0);
      const { error: streakErr } = await admin
        .from("streaks")
        .update({ active_streak_count: previous, longest_streak_count: longestStreak })
        .eq("user_id", ctx.userId);
      if (streakErr) {
        rethrowFreezeWrite(ctx.requestId, "streaks.update", streakErr);
      }

      return { restoredStreak: previous, remaining: nextRemaining };
    }),
});
