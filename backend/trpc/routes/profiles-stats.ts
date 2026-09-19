import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";
import {
  getTodayDateKey,
  getYesterdayDateKey,
  daysBetweenKeys,
  getWeekStartDateKey,
  getWeekEndDateKey,
  addCalendarDaysToDateKey,
  getProfileTimeZoneForUser,
} from "../../lib/date-utils";
import type { StreakRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";
import { logger } from "../../lib/logger";
import { reconcileMissForUser } from "../../lib/miss-reconcile";
import { loadDayTaskTally } from "../../lib/record-days";
import { restoreStreakCount } from "./streaks";

/** Production profiles columns only. No streak_freeze_* / preferred_secure_time. */
export const GET_STATS_PROFILE_SELECT =
  "total_days_secured, tier, subscription_status, timezone, reminder_timezone";

export const RECONCILE_PROFILE_SELECT =
  "subscription_status, timezone, reminder_timezone";

export const profilesStatsProcedures = {
  /**
   * Last Stand consumption and streak zeroing via miss-reconcile.
   * Frozen days come from freeze_uses. Must run before getStats.
   */
  reconcileStreak: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await reconcileMissForUser(ctx.supabase, ctx.userId);
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const todayKey = getTodayDateKey(tz);
      const yesterdayKey = getYesterdayDateKey(tz);
      const [tally, securesRes, standRes, freezeRes, streakAfter] = await Promise.all([
        loadDayTaskTally(ctx.supabase, ctx.userId, yesterdayKey, tz),
        ctx.supabase.from("day_secures").select("date_key").eq("user_id", ctx.userId).limit(400),
        ctx.supabase.from("last_stand_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
        ctx.supabase.from("freeze_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
        ctx.supabase
          .from("streaks")
          .select("active_streak_count, last_completed_date_key")
          .eq("user_id", ctx.userId)
          .maybeSingle(),
      ]);
      const securedDateKeys = (securesRes.data ?? []).map((r: { date_key: string }) => r.date_key);
      const lastStandDateKeys = (standRes.data ?? []).map((r: { date_key: string }) => r.date_key);
      const frozenDateKeys = (freezeRes.data ?? []).map((r: { date_key: string }) => r.date_key);
      const yesterdayMissed = !securedDateKeys.includes(yesterdayKey);
      const yesterdayCovered =
        lastStandDateKeys.includes(yesterdayKey) || frozenDateKeys.includes(yesterdayKey);
      const lostStreak =
        yesterdayMissed && !yesterdayCovered
          ? restoreStreakCount({
              todayKey,
              lastCompletedDateKey:
                (streakAfter.data as { last_completed_date_key?: string | null } | null)
                  ?.last_completed_date_key ?? result.lastCompletedDateKey,
              securedDateKeys,
              lastStandDateKeys,
              // Same prospective yesterday bridge as useFreeze (streaks.ts:178-181).
              frozenDateKeys: [...frozenDateKeys, yesterdayKey],
            })
          : undefined;
      return {
        streak_broken: result.streak_broken,
        previous_streak: result.previous_streak,
        ...(lostStreak !== undefined ? { lostStreak } : {}),
        lastStandUsedThisSession: result.lastStandUsedThisSession,
        lastStandsAvailable: result.lastStandsAvailable,
        missedTaskNames: tally.missedTaskNames,
        done: tally.done,
        total: tally.total,
      };
    } catch (error) {
      logger.error({ error, userId: ctx.userId }, "[profiles.reconcileStreak] miss reconcile failed");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reconcile streak.",
      });
    }
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      activeChallenges,
      completedChallenges,
      streakData,
      profileResult,
      lastStandUsesResult,
      freezeUsesResult,
    ] = await Promise.all([
      ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("status", "active")
        .limit(200),
      ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("status", "completed")
        .limit(200),
      ctx.supabase
        .from("streaks")
        .select(
          "user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available"
        )
        .eq("user_id", ctx.userId)
        .maybeSingle(),
      ctx.supabase
        .from("profiles")
        .select(GET_STATS_PROFILE_SELECT)
        .eq("user_id", ctx.userId)
        .maybeSingle(),
      ctx.supabase.from("last_stand_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
      ctx.supabase.from("freeze_uses").select("date_key").eq("user_id", ctx.userId).limit(365),
    ]);

    if (profileResult.error && profileResult.error.code !== "PGRST116") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load profile." });
    }
    if (lastStandUsesResult.error || freezeUsesResult.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load streak.",
      });
    }

    if (streakData.error) {
      logger.error(
        { error: streakData.error, userId: ctx.userId },
        "[profiles.getStats] streaks read failed"
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load streak.",
      });
    }
    const streakRow = streakData.data ?? null;
    const profileRow = profileResult;

    const lastStandUsedDateKeys = new Set(
      (lastStandUsesResult.data ?? []).map((r: { date_key: string }) => r.date_key)
    );

    const lastCompletedDateKey = streakRow?.last_completed_date_key ?? null;
    const tzRaw = profileRow?.data as
      | { timezone?: string | null; reminder_timezone?: string | null }
      | null;
    const tz = tzRaw?.timezone?.trim() || tzRaw?.reminder_timezone?.trim() || "UTC";
    const todayKey = getTodayDateKey(tz);
    const yesterdayKey = getYesterdayDateKey(tz);
    const frozenDateKeys = new Set(
      (freezeUsesResult.data ?? []).map((r: { date_key: string }) => r.date_key)
    );

    let effectiveMissedDays = 0;
    let missedDateKeys: string[] = [];
    if (lastCompletedDateKey != null && lastCompletedDateKey < todayKey) {
      missedDateKeys = daysBetweenKeys(lastCompletedDateKey, yesterdayKey);
      effectiveMissedDays = missedDateKeys.filter(
        (k: string) => !frozenDateKeys.has(k) && !lastStandUsedDateKeys.has(k)
      ).length;
    }

    const { data: yesterdaySecure } = await ctx.supabase
      .from("day_secures")
      .select("date_key")
      .eq("user_id", ctx.userId)
      .eq("date_key", yesterdayKey)
      .maybeSingle();
    const yesterdaySecured = Boolean(yesterdaySecure);

    const lastStandsAvailable = Math.min(
      2,
      Math.max(0, (streakRow as StreakRow | null)?.last_stands_available ?? 0)
    );
    const subscriptionStatus =
      (profileRow?.data as { subscription_status?: string } | null)?.subscription_status ?? "free";
    const isPremiumForLastStand =
      subscriptionStatus === "premium" || subscriptionStatus === "trial";

    let lastStandRequiresPremium = false;
    if (effectiveMissedDays === 1 && lastStandsAvailable > 0 && !isPremiumForLastStand) {
      lastStandRequiresPremium = true;
    }

    // Missing row (RLS / no streak yet) must not collapse to a real zero.
    const activeStreak =
      streakRow == null ? null : (streakRow.active_streak_count ?? 0);

    const totalDaysSecured = profileRow?.data?.total_days_secured ?? 0;
    const tier = profileRow?.data?.tier ?? getTierForDays(totalDaysSecured);
    const pointsToNextTier = getPointsToNextTier(totalDaysSecured);
    const nextTierName = getNextTierName(totalDaysSecured);

    return {
      activeChallenges: activeChallenges.data?.length || 0,
      completedChallenges: completedChallenges.data?.length || 0,
      activeStreak,
      longestStreak: streakRow?.longest_streak_count || 0,
      lastCompletedDateKey: lastCompletedDateKey,
      effectiveMissedDays,
      totalDaysSecured,
      tier,
      pointsToNextTier,
      nextTierName,
      lastStandsAvailable,
      lastStandUsedThisSession: lastStandUsedDateKeys.has(yesterdayKey),
      streakLostNoLastStand:
        activeStreak === 0 &&
        !yesterdaySecured &&
        !lastStandUsedDateKeys.has(yesterdayKey) &&
        !frozenDateKeys.has(yesterdayKey),
      lastStandRequiresPremium,
      frozenDateKeys: [...frozenDateKeys],
      lastStandDateKeys: [...lastStandUsedDateKeys],
    };
  }),

  /** Completed challenges for profile dashboard (name + completion date). */
  getCompletedChallenges: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("active_challenges")
        .select("id, challenge_id, created_at")
        .eq("user_id", ctx.userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load completed challenges." });
      }
      const rows = (data ?? []) as { id: string; challenge_id: string; created_at?: string }[];
      if (rows.length === 0) return [];
      const challengeIds = [...new Set(rows.map((r) => r.challenge_id))];
      const { data: challenges } = await ctx.supabase
        .from("challenges")
        .select("id, title")
        .in("id", challengeIds)
        .limit(200);
      const titleMap = new Map((challenges ?? []).map((c: { id: string; title?: string }) => [c.id, c.title ?? "Challenge"]));
      return rows.map((r) => ({
        id: r.id,
        challengeId: r.challenge_id,
        challengeName: titleMap.get(r.challenge_id) ?? "Challenge",
        completedAt: r.created_at ?? new Date().toISOString(),
      }));
    }),

  /** Secured date keys for discipline calendar (last 365 days). */
  getSecuredDateKeys: protectedProcedure
    .query(async ({ ctx }) => {
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const todayKey = getTodayDateKey(tz);
      const startKey = addCalendarDaysToDateKey(todayKey, -365);
      const { data, error } = await ctx.supabase
        .from("day_secures")
        .select("date_key")
        .eq("user_id", ctx.userId)
        .gte("date_key", startKey)
        .lte("date_key", todayKey)
        .order("date_key", { ascending: false })
        .limit(366);

      if (error) {
        const { logger } = await import("../../lib/logger");
        logger.error({ error, userId: ctx.userId }, "[profiles.getSecuredDateKeys]");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load secured dates.",
        });
      }
      return (data ?? []).map((r: { date_key: string }) => r.date_key);
    }),

  getWeeklyProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const todayKey = getTodayDateKey(tz);
      const weekStart = getWeekStartDateKey(new Date(), tz);
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("weekly_goal")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const goal = (profile as { weekly_goal?: number } | null)?.weekly_goal ?? 5;
      const { data: secures } = await ctx.supabase
        .from("day_secures")
        .select("date_key")
        .eq("user_id", ctx.userId)
        .gte("date_key", weekStart)
        .lte("date_key", todayKey)
        .limit(14);
      const completed = (secures ?? []).length;
      const remaining = Math.max(0, goal - completed);
      return { goal, completed, remaining };
    }),

  getWeeklyTrend: protectedProcedure
    .query(async ({ ctx }) => {
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const today = new Date();
      const result: { weekStart: string; daysSecured: number; goal: number }[] = [];
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("weekly_goal")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const goal = (profile as { weekly_goal?: number } | null)?.weekly_goal ?? 5;
      for (let w = 0; w < 8; w++) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - w * 7);
        const weekStart = getWeekStartDateKey(d, tz);
        const weekEnd = getWeekEndDateKey(d, tz);
        const { data: secures } = await ctx.supabase
          .from("day_secures")
          .select("date_key")
          .eq("user_id", ctx.userId)
          .gte("date_key", weekStart)
          .lte("date_key", weekEnd)
          .limit(14);
        result.push({
          weekStart,
          daysSecured: (secures ?? []).length,
          goal,
        });
      }
      return result.reverse();
    }),

  setWeeklyGoal: protectedProcedure
    .input(z.object({ goal: z.union([z.literal(3), z.literal(5), z.literal(7)]) }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({ weekly_goal: input.goal })
        .eq("user_id", ctx.userId)
        .select("weekly_goal")
        .single();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to set weekly goal." });
      }
      return { goal: (data as { weekly_goal?: number })?.weekly_goal ?? 5 };
    }),

  getBadges: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { getAchievementsByDimension } = await import("../../lib/achievement-definitions");
      const server = getSupabaseServer() ?? ctx.supabase;

      let canSee = input.userId === ctx.userId;
      if (!canSee) {
        const { data: pr } = await server
          .from("profiles")
          .select("profile_visibility")
          .eq("user_id", input.userId)
          .maybeSingle();
        const vis = String((pr as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
        if (vis === "public") {
          canSee = true;
        } else {
          const { data: fol } = await ctx.supabase
            .from("user_follows")
            .select("status")
            .eq("follower_id", ctx.userId)
            .eq("following_id", input.userId)
            .maybeSingle();
          canSee = Boolean(fol && String((fol as { status?: string }).status ?? "").toLowerCase() === "accepted");
        }
      }
      if (!canSee) {
        return { earned: [], next: [] };
      }

      const { data: unlockedRows } = await server
        .from("user_achievements")
        .select("achievement_key")
        .eq("user_id", input.userId)
        .limit(500);
      const unlockedKeys = new Set((unlockedRows ?? []).map((r: { achievement_key: string }) => r.achievement_key));

      const { data: streakRow } = await server
        .from("streaks")
        .select("active_streak_count, longest_streak_count")
        .eq("user_id", input.userId)
        .maybeSingle();
      const longestStreak = (streakRow as { longest_streak_count?: number } | null)?.longest_streak_count ?? 0;

      const { data: profileRow } = await server
        .from("profiles")
        .select("total_days_secured")
        .eq("user_id", input.userId)
        .maybeSingle();
      const totalDays = (profileRow as { total_days_secured?: number } | null)?.total_days_secured ?? 0;

      const allDefs = getAchievementsByDimension();

      const earned = allDefs
        .filter((b) => unlockedKeys.has(b.key))
        .map((b) => ({
          id: b.key,
          name: b.label,
          icon: b.icon,
          color: b.color,
          dimension: b.dimension,
          description: b.description,
          progress: b.threshold ?? 1,
          total: b.threshold ?? 1,
        }));

      const next = allDefs
        .filter((b) => !unlockedKeys.has(b.key))
        .slice(0, 5)
        .map((b) => {
          let progress = 0;
          if (b.dimension === "discipline" && b.threshold) {
            progress = Math.min(longestStreak, b.threshold);
          } else if (b.key === "total_days_50" || b.key === "total_days_100") {
            progress = Math.min(totalDays, b.threshold ?? 0);
          }
          return {
            id: b.key,
            name: b.label,
            icon: b.icon,
            color: b.color,
            dimension: b.dimension,
            description: b.description,
            progress,
            total: b.threshold ?? 1,
          };
        });

      return { earned, next };
    }),

  getCheckinHeatmap: protectedProcedure
    .input(
      z
        .object({
          userId: z.string().uuid().optional(),
          days: z.number().min(7).max(365).default(30),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const userId = input?.userId ?? ctx.userId;
      const days = input?.days ?? 30;

      const buildEmpty = () =>
        Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
          level: 0 as const,
        }));

      let canSee = userId === ctx.userId;
      if (!canSee) {
        const { data: pr } = await server
          .from("profiles")
          .select("profile_visibility")
          .eq("user_id", userId)
          .maybeSingle();
        const vis = String(
          (pr as { profile_visibility?: string } | null)?.profile_visibility ?? "public"
        ).toLowerCase();
        if (vis === "public") {
          canSee = true;
        } else {
          const { data: fol } = await ctx.supabase
            .from("user_follows")
            .select("status")
            .eq("follower_id", ctx.userId)
            .eq("following_id", userId)
            .maybeSingle();
          canSee = Boolean(
            fol && String((fol as { status?: string }).status ?? "").toLowerCase() === "accepted"
          );
        }
      }
      if (!canSee) {
        return { days: buildEmpty() };
      }

      const startDate = new Date(Date.now() - (days - 1) * 86400000)
        .toISOString()
        .slice(0, 10);

      const { data: checkinRows, error } = await server
        .from("check_ins")
        .select("date_key")
        .eq("user_id", userId)
        .gte("date_key", startDate)
        .limit(2000);

      if (error) {
        return { days: buildEmpty() };
      }

      const countByDate = new Map<string, number>();
      for (const row of checkinRows ?? []) {
        const key = (row as { date_key: string }).date_key;
        countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
      }

      // Map count -> level (0-4). Tuned for typical multi-task days: 0 quiet,
      // 1 light, 2 medium, 3-4 heavy, 5+ saturated.
      const toLevel = (n: number): 0 | 1 | 2 | 3 | 4 => {
        if (n === 0) return 0;
        if (n === 1) return 1;
        if (n === 2) return 2;
        if (n <= 4) return 3;
        return 4;
      };

      const result = Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - 1 - i) * 86400000)
          .toISOString()
          .slice(0, 10);
        const count = countByDate.get(date) ?? 0;
        return { date, level: toLevel(count) };
      });

      return { days: result };
    }),

  /** Delete account: clears profile data; when SUPABASE_SERVICE_ROLE_KEY is set, also deletes auth user. Client must sign out after. */
};
