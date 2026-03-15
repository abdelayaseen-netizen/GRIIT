import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
import { requireNoError } from "../errors";
import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";
import { getTodayDateKey, daysBetweenKeys, getWeekStartDateKey, getWeekEndDateKey } from "../../lib/date-utils";
import type { PgError, ProfileRow, ProfileWithExpoRow, PushTokenRow, StreakRow } from "../../types/db";

/** Subscription fields are written only by profiles.validateSubscription (server-side RevenueCat validation). */
const PROFILE_UPDATE_KEYS = [
  "username", "display_name", "bio", "avatar_url", "cover_url",
  "onboarding_completed", "onboarding_completed_at", "onboarding_answers",
  "primary_goal", "daily_time_budget",
  "starter_challenge_id", "preferred_secure_time",
  "profile_visibility", "weekly_goal",
] as const;

type SubscriptionStatus = "free" | "premium" | "trial";

function mapEntitlementToStatus(expiresDate: string | null): SubscriptionStatus {
  if (!expiresDate) return "free";
  const expiry = new Date(expiresDate);
  if (Number.isNaN(expiry.getTime())) return "free";
  return expiry > new Date() ? "premium" : "free";
}

export const profilesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      username: z.string().min(3),
      display_name: z.string().optional(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
      cover_url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .upsert({
          user_id: ctx.userId,
          username: input.username,
          display_name: input.display_name || input.username,
          bio: input.bio || '',
          avatar_url: input.avatar_url,
          cover_url: input.cover_url,
          onboarding_completed: false,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        const code = (error as PgError).code;
        if (code === "23505") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create profile." });
      }
      return data;
    }),

  /** Public profile by username (for deep link /profile/[username]). */
  getPublicByUsername: publicProcedure
    .input(z.object({ username: z.string().min(1).max(64) }))
    .query(async ({ input, ctx }) => {
      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, total_days_secured, tier")
        .eq("username", input.username.trim())
        .maybeSingle();
      if (profileError || !profile) return null;
      const { data: streakRow } = await ctx.supabase
        .from("streaks")
        .select("active_streak_count")
        .eq("user_id", profile.user_id)
        .maybeSingle();
      return {
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_days_secured: profile.total_days_secured ?? 0,
        tier: profile.tier ?? "Starter",
        active_streak: (streakRow as { active_streak_count?: number } | null)?.active_streak_count ?? 0,
      };
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', ctx.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load profile." });
      }
      return data;
    }),

  /** Validates subscription with RevenueCat and writes to profiles. Client must not write subscription fields. */
  validateSubscription: protectedProcedure
    .mutation(async ({ ctx }): Promise<{ subscription_status: SubscriptionStatus; subscription_expiry: string | null }> => {
      const apiKey = process.env.REVENUECAT_API_KEY?.trim();
      const appUserId = ctx.userId;

      const getCurrentFromDb = async () => {
        const { data, error } = await ctx.supabase
          .from("profiles")
          .select("subscription_status, subscription_expiry")
          .eq("user_id", appUserId)
          .maybeSingle();
        if (error || !data) {
          return { subscription_status: "free" as SubscriptionStatus, subscription_expiry: null as string | null };
        }
        const row = data as { subscription_status?: string | null; subscription_expiry?: string | null };
        const status = (row.subscription_status === "premium" || row.subscription_status === "trial" ? row.subscription_status : "free") as SubscriptionStatus;
        const expiry = typeof row.subscription_expiry === "string" ? row.subscription_expiry : null;
        return { subscription_status: status, subscription_expiry: expiry };
      };

      if (!apiKey) {
        if (process.env.NODE_ENV !== "test") {
          const { logger } = await import("../../lib/logger");
          logger.warn("[profiles.validateSubscription] REVENUECAT_API_KEY not set; skipping validation, returning current DB values.");
        }
        return getCurrentFromDb();
      }

      try {
        const url = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          if (process.env.NODE_ENV !== "test") {
            const { logger } = await import("../../lib/logger");
            logger.warn({ status: res.status, text: text?.slice(0, 200) }, "[profiles.validateSubscription] RevenueCat API error");
          }
          return getCurrentFromDb();
        }

        const json = (await res.json()) as {
          subscriber?: {
            entitlements?: Record<string, { expires_date?: string | null; product_identifier?: string }>;
          };
        };
        const entitlements = json?.subscriber?.entitlements ?? {};
        const premium = entitlements["premium"];
        const expiresDate = premium?.expires_date ?? null;
        const subscription_status = mapEntitlementToStatus(expiresDate);
        const subscription_expiry = expiresDate;

        const updatePayload: Record<string, unknown> = {
          subscription_status,
          subscription_expiry,
          subscription_platform: null,
          subscription_product_id: premium?.product_identifier ?? null,
        };

        const { error: updateError } = await ctx.supabase
          .from("profiles")
          .update(updatePayload)
          .eq("user_id", appUserId);

        if (updateError) {
          if (process.env.NODE_ENV !== "test") {
            const { logger } = await import("../../lib/logger");
            logger.warn({ message: updateError.message }, "[profiles.validateSubscription] Failed to update profile");
          }
          return getCurrentFromDb();
        }

        return { subscription_status, subscription_expiry };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (process.env.NODE_ENV !== "test") {
          const { logger } = await import("../../lib/logger");
          logger.warn({ message }, "[profiles.validateSubscription] Error");
        }
        return getCurrentFromDb();
      }
    }),

  update: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(64).optional(),
      display_name: z.string().max(128).optional(),
      bio: z.string().max(500).optional(),
      avatar_url: z.string().max(2000).optional(),
      cover_url: z.string().max(2000).optional(),
      onboarding_completed: z.boolean().optional(),
      onboarding_completed_at: z.string().max(64).optional(),
      primary_goal: z.string().max(128).optional(),
      daily_time_budget: z.string().max(32).optional(),
      starter_challenge_id: z.string().max(64).optional(),
      preferred_secure_time: z.string().max(16).optional(),
      onboarding_answers: z.record(z.string(), z.unknown()).optional(),
      profile_visibility: z.enum(["public", "friends", "private"]).optional(),
      weekly_goal: z.union([z.literal(3), z.literal(5), z.literal(7)]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const updatePayload: Record<string, unknown> = {};
      for (const key of PROFILE_UPDATE_KEYS) {
        if (input[key] !== undefined) {
          updatePayload[key] = input[key];
        }
      }
      if (Object.keys(updatePayload).length === 0) {
        return (await ctx.supabase.from('profiles').select('*').eq('user_id', ctx.userId).single()).data;
      }

      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', ctx.userId)
        .select()
        .single();

      if (error) {
        const code = (error as PgError).code;
        if (code === "23505") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update profile." });
      }
      return data;
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [activeChallenges, completedChallenges, streakData, profileResult, freezesResult, lastStandUsesResult] = await Promise.all([
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'active'),
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'completed'),
        ctx.supabase
          .from('streaks')
          .select('*')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('profiles')
          .select('streak_freeze_used_count, streak_freeze_reset_at, total_days_secured, tier, preferred_secure_time, subscription_status')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('streak_freezes')
          .select('date_key')
          .eq('user_id', ctx.userId),
        ctx.supabase
          .from('last_stand_uses')
          .select('date_key')
          .eq('user_id', ctx.userId),
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
          .from('profiles')
          .update({ streak_freeze_used_count: 0, streak_freeze_reset_at: resetAt.toISOString() })
          .eq('user_id', ctx.userId);
        if (!resetErr) { /* optional reset */ }
      }
      const freezesRemaining = Math.max(0, streakFreezePerMonth - usedCount);
      const frozenDateKeys = new Set((freezesRows?.data ?? []).map((r: { date_key: string }) => r.date_key));
      const lastStandUsedDateKeys = new Set((lastStandUsesRows?.data ?? []).map((r: { date_key: string }) => r.date_key));

      const lastCompletedDateKey = streakData.data?.last_completed_date_key ?? null;
      const todayKey = getTodayDateKey();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];

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
              ctx.supabase.from('push_tokens').select('token').eq('user_id', ctx.userId),
              ctx.supabase.from('profiles').select('expo_push_token').eq('user_id', ctx.userId).single(),
            ]);
            const tokens = (pushRes?.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
            const pt = (profileTokenRes?.data as ProfileWithExpoRow | null)?.expo_push_token ?? null;
            const allT = [...new Set([...tokens, pt].filter(Boolean))].filter((t: string | null | undefined): t is string => typeof t === "string");
            await sendExpoPush(allT, 'Last Stand used', 'Your streak continues.');
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
      const preferredSecureTime = profileRow?.data?.preferred_secure_time ?? '20:00';

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
        .in("id", challengeIds);
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
        .order("date_key", { ascending: false });

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load secured dates." });
      }
      return (data ?? []).map((r: { date_key: string }) => r.date_key);
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100).transform((s) => s.trim()) }))
    .query(async ({ input, ctx }) => {
      const q = input.query.trim().toLowerCase();
      if (!q) return [];
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .neq('user_id', ctx.userId)
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      requireNoError(error, "Failed to search profiles.");
      return (data ?? []).map((r: ProfileRow) => ({
        user_id: r.user_id,
        username: r.username ?? "",
        display_name: r.display_name ?? r.username ?? "",
      }));
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
        .lte("date_key", todayKey);
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
          .lte("date_key", weekEnd);
        result.push({
          weekStart,
          daysSecured: (secures ?? []).length,
          goal,
        });
      }
      return result.reverse();
    }),

  /** Delete account: clears profile data and returns; client must sign out. Full auth user deletion requires Supabase Admin API (auth.admin.deleteUser) in production. */
  deleteAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { error } = await ctx.supabase
        .from("profiles")
        .delete()
        .eq("user_id", ctx.userId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete account data." });
      }
      return { ok: true };
    }),
});

