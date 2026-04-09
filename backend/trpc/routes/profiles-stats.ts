import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";
import { getTodayDateKey, daysBetweenKeys, getWeekStartDateKey, getWeekEndDateKey } from "../../lib/date-utils";
import type { ProfileWithExpoRow, PushTokenRow, StreakRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";
import { logger } from "../../lib/logger";

export const profilesStatsProcedures = {
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [activeChallenges, completedChallenges, streakData, profileResult, freezesResult, lastStandUsesResult] = await Promise.all([
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'active')
          .limit(200),
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'completed')
          .limit(200),
        ctx.supabase
          .from('streaks')
          .select('user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from("profiles")
          .select("streak_freeze_used_count, streak_freeze_reset_at, total_days_secured, tier, preferred_secure_time, subscription_status")
          .eq("user_id", ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('streak_freezes')
          .select('date_key')
          .eq('user_id', ctx.userId)
          .limit(365),
        ctx.supabase
          .from('last_stand_uses')
          .select('date_key')
          .eq('user_id', ctx.userId)
          .limit(365),
      ]);

      const profileRow = profileResult?.error ? { data: null } : profileResult;
      const freezesRows = freezesResult?.error ? { data: [] } : freezesResult;
      const lastStandUsesRows = lastStandUsesResult?.error ? { data: [] } : lastStandUsesResult;

      const streakFreezePerMonth = 1;
      let usedCount = profileRow?.data?.streak_freeze_used_count ?? 0;
      let resetAt = profileRow?.data?.streak_freeze_reset_at ? new Date(profileRow.data.streak_freeze_reset_at) : new Date();
      const now = new Date();
      if (resetAt && (now.getTime() - new Date(resetAt).getTime()) / (1000 * 60 * 60 * 24) >= 30) {
        usedCount = 0;
        resetAt = now;
        const { error: resetErr } = await ctx.supabase
          .from("profiles")
          .update({ streak_freeze_used_count: 0, streak_freeze_reset_at: resetAt.toISOString() })
          .eq("user_id", ctx.userId);
        if (!resetErr) {
          /* optional reset */
        }
      }
      const freezesRemaining = Math.max(0, streakFreezePerMonth - usedCount);
      const frozenDateKeys = new Set((freezesRows?.data ?? []).map((r: { date_key: string }) => r.date_key));
      const lastStandUsedDateKeys = new Set((lastStandUsesRows?.data ?? []).map((r: { date_key: string }) => r.date_key));

      const lastCompletedDateKey = streakData.data?.last_completed_date_key ?? null;
      const todayKey = getTodayDateKey();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      let effectiveMissedDays = 0;
      let missedDateKeys: string[] = [];
      if (lastCompletedDateKey != null && lastCompletedDateKey < todayKey) {
        missedDateKeys = daysBetweenKeys(lastCompletedDateKey, yesterdayKey);
        effectiveMissedDays = missedDateKeys.filter(
          (k: string) => !frozenDateKeys.has(k) && !lastStandUsedDateKeys.has(k)
        ).length;
      }

      let lastStandsAvailable = Math.min(2, Math.max(0, (streakData.data as StreakRow | null)?.last_stands_available ?? 0));
      let lastStandUsedThisSession = false;
      let streakLostNoLastStand = false;
      let lastStandRequiresPremium = false;
      const subscriptionStatus = (profileRow?.data as { subscription_status?: string } | null)?.subscription_status ?? 'free';
      const isPremiumForLastStand = subscriptionStatus === 'premium' || subscriptionStatus === 'trial';

      if (effectiveMissedDays === 1 && lastStandsAvailable > 0) {
        if (!isPremiumForLastStand) {
          lastStandRequiresPremium = true;
        } else {
        const dateToProtect = missedDateKeys.filter(
          (k: string) => !frozenDateKeys.has(k) && !lastStandUsedDateKeys.has(k)
        )[0];
        if (dateToProtect) {
          const { error: insertErr } = await ctx.supabase
            .from('last_stand_uses')
            .insert({ user_id: ctx.userId, date_key: dateToProtect });
          const inserted = !insertErr;
          if (inserted) {
            const newAvailable = lastStandsAvailable - 1;
            const newUsedTotal = ((streakData.data as StreakRow | null)?.last_stands_used_total ?? 0) + 1;
            await ctx.supabase
              .from('streaks')
              .update({
                last_stands_available: newAvailable,
                last_stands_used_total: newUsedTotal,
              })
              .eq('user_id', ctx.userId);
            lastStandsAvailable = newAvailable;
            effectiveMissedDays = 0;
            lastStandUsedThisSession = true;
            const { sendExpoPush } = await import('../../lib/push');
            const [pushRes, profileTokenRes] = await Promise.all([
              ctx.supabase.from('push_tokens').select('token').eq('user_id', ctx.userId).limit(200),
              ctx.supabase.from('profiles').select('expo_push_token').eq('user_id', ctx.userId).single(),
            ]);
            const tokens = (pushRes?.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
            const pt = (profileTokenRes?.data as ProfileWithExpoRow | null)?.expo_push_token ?? null;
            const allT = [...new Set([...tokens, pt].filter(Boolean))].filter((t: string | null | undefined): t is string => typeof t === "string");
            try {
              await sendExpoPush(allT, 'Last Stand used', 'Your streak continues.');
            } catch (pushErr) {
              logger.error({ err: pushErr }, "[PUSH] Failed to send Last Stand notification");
            }
          }
        }
        }
      } else if (effectiveMissedDays >= 1 && lastStandsAvailable === 0) {
        const activeStreakBefore = streakData.data?.active_streak_count ?? 0;
        if (activeStreakBefore > 0) {
          await ctx.supabase
            .from('streaks')
            .update({ active_streak_count: 0 })
            .eq('user_id', ctx.userId);
          streakLostNoLastStand = true;
        }
      }

      const activeStreak = streakLostNoLastStand ? 0 : (streakData.data?.active_streak_count ?? 0);
      const canUseFreeze = effectiveMissedDays === 1 && activeStreak > 0 && freezesRemaining > 0;

      const totalDaysSecured = profileRow?.data?.total_days_secured ?? 0;
      const tier = profileRow?.data?.tier ?? getTierForDays(totalDaysSecured);
      const pointsToNextTier = getPointsToNextTier(totalDaysSecured);
      const nextTierName = getNextTierName(totalDaysSecured);
      const preferredSecureTime = profileRow?.data?.preferred_secure_time ?? "20:00";

      return {
        activeChallenges: activeChallenges.data?.length || 0,
        completedChallenges: completedChallenges.data?.length || 0,
        activeStreak: activeStreak || 0,
        longestStreak: streakData.data?.longest_streak_count || 0,
        lastCompletedDateKey: lastCompletedDateKey,
        streakFreezeUsedCount: usedCount,
        streakFreezeResetAt: resetAt.toISOString(),
        freezesRemaining,
        effectiveMissedDays,
        canUseFreeze,
        totalDaysSecured,
        tier,
        pointsToNextTier,
        nextTierName,
        preferredSecureTime,
        lastStandsAvailable,
        lastStandUsedThisSession,
        streakLostNoLastStand,
        lastStandRequiresPremium,
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
      const todayKey = getTodayDateKey();
      const start = new Date();
      start.setDate(start.getDate() - 365);
      const startKey = start.toISOString().split("T")[0];
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
      const todayKey = getTodayDateKey();
      const weekStart = getWeekStartDateKey();
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
        const weekStart = getWeekStartDateKey(d);
        const weekEnd = getWeekEndDateKey(d);
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

  /** Delete account: clears profile data; when SUPABASE_SERVICE_ROLE_KEY is set, also deletes auth user. Client must sign out after. */
};
