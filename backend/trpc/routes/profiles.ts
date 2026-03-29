import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
import { requireNoError } from "../errors";
import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";
import { getTodayDateKey, daysBetweenKeys, getWeekStartDateKey, getWeekEndDateKey } from "../../lib/date-utils";
import type { PgError, ProfileRow, ProfileWithExpoRow, PushTokenRow, StreakRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";

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
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
      display_name: z.string().max(50).optional(),
      bio: z.string().max(500).optional(),
      avatar_url: z.string().max(2000).optional(),
      cover_url: z.string().max(2000).optional(),
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

  /** Public profile by username (for deep link /profile/[username]). Uses service client so RLS does not block reads. */
  getPublicByUsername: publicProcedure
    .input(z.object({ username: z.string().min(1).max(64) }))
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const { data: profile, error: profileError } = await server
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, total_days_secured, tier, bio, created_at, profile_visibility")
        .eq("username", input.username.trim())
        .maybeSingle();
      if (profileError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ error: profileError, username: input.username }, "[profiles.getPublicByUsername]");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load profile." });
      }
      if (!profile) return null;
      const p = profile as {
        user_id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
        total_days_secured: number | null;
        tier: string | null;
        bio: string | null;
        created_at: string | null;
        profile_visibility?: string | null;
      };
      const { data: streakRow, error: streakError } = await server
        .from("streaks")
        .select("active_streak_count, longest_streak_count")
        .eq("user_id", p.user_id)
        .maybeSingle();
      if (streakError) {
        const { logger } = await import("../../lib/logger");
        logger.warn({ error: streakError, userId: p.user_id }, "[profiles.getPublicByUsername] streaks read");
      }
      const [{ count: activeChal }, { count: doneChal }] = await Promise.all([
        server
          .from("active_challenges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.user_id)
          .eq("status", "active"),
        server
          .from("active_challenges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.user_id)
          .eq("status", "completed"),
      ]);
      return {
        user_id: p.user_id,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        total_days_secured: p.total_days_secured ?? 0,
        tier: p.tier ?? "Starter",
        active_streak: (streakRow as { active_streak_count?: number } | null)?.active_streak_count ?? 0,
        longest_streak: (streakRow as { longest_streak_count?: number } | null)?.longest_streak_count ?? 0,
        active_challenges_count: activeChal ?? 0,
        completed_challenges_count: doneChal ?? 0,
        bio: p.bio ?? null,
        created_at: p.created_at ?? null,
        profile_visibility: String(p.profile_visibility ?? "public").toLowerCase(),
      };
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      // Only columns present in shipped Supabase migrations — avoids 500 when optional columns are missing.
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select(
          "user_id, username, display_name, bio, avatar_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility"
        )
        .eq("user_id", ctx.userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load profile." });
      }
      return data;
    }),

  /** Validates subscription with RevenueCat and writes to profiles. Client must not write subscription fields. */
  validateSubscription: protectedProcedure
    .input(z.object({}))
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
        const { data } = await ctx.supabase
          .from("profiles")
          .select(
            "user_id, username, display_name, bio, avatar_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility"
          )
          .eq("user_id", ctx.userId)
          .single();
        return data;
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
              ctx.supabase.from('push_tokens').select('token').eq('user_id', ctx.userId),
              ctx.supabase.from('profiles').select('expo_push_token').eq('user_id', ctx.userId).single(),
            ]);
            const tokens = (pushRes?.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
            const pt = (profileTokenRes?.data as ProfileWithExpoRow | null)?.expo_push_token ?? null;
            const allT = [...new Set([...tokens, pt].filter(Boolean))].filter((t: string | null | undefined): t is string => typeof t === "string");
            try {
              await sendExpoPush(allT, 'Last Stand used', 'Your streak continues.');
            } catch (pushErr) {
              console.error('[PUSH] Failed to send Last Stand notification:', pushErr);
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
        const { logger } = await import("../../lib/logger");
        logger.error({ error, userId: ctx.userId }, "[profiles.getSecuredDateKeys]");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load secured dates.",
        });
      }
      return (data ?? []).map((r: { date_key: string }) => r.date_key);
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100).transform((s) => s.trim()) }))
    .query(async ({ input, ctx }) => {
      const q = input.query.trim();
      if (!q) return [];
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .neq("user_id", ctx.userId)
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      requireNoError(error, "Failed to search profiles.");
      const rows = (data ?? []) as ProfileRow[];
      const ids = rows.map((r) => r.user_id);
      const { data: streakRows } =
        ids.length > 0
          ? await ctx.supabase.from("streaks").select("user_id, active_streak_count").in("user_id", ids)
          : { data: [] as { user_id: string; active_streak_count: number | null }[] };
      const streakMap = new Map((streakRows ?? []).map((s) => [s.user_id, s.active_streak_count ?? 0]));
      return rows.map((r) => ({
        user_id: r.user_id,
        username: r.username ?? "",
        display_name: r.display_name ?? r.username ?? "",
        avatar_url: r.avatar_url ?? null,
        current_streak: streakMap.get(r.user_id) ?? 0,
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

  getFollowCounts: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { getSupabaseServer } = await import("../../lib/supabase-server");
      const server = getSupabaseServer() ?? ctx.supabase;
      const { count: followers, error: fErr } = await server
        .from("user_follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", input.userId)
        .eq("status", "accepted");
      if (fErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: fErr.message });
      }
      const { count: following, error: gErr } = await server
        .from("user_follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", input.userId)
        .eq("status", "accepted");
      if (gErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: gErr.message });
      }
      return { followers: followers ?? 0, following: following ?? 0 };
    }),

  /** Whether the current user follows the given profile (for public profile UI). */
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("user_follows")
        .select("follower_id")
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId)
        .eq("status", "accepted")
        .maybeSingle();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { isFollowing: Boolean(data) };
    }),

  getFollowStatus: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        return { status: "none" as const };
      }
      const { data, error } = await ctx.supabase
        .from("user_follows")
        .select("status")
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId)
        .maybeSingle();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      const st = String((data as { status?: string } | null)?.status ?? "").toLowerCase();
      if (!data) return { status: "none" as const };
      if (st === "pending") return { status: "pending" as const };
      return { status: "following" as const };
    }),

  followUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself." });
      }
      const { data: target, error: tErr } = await ctx.supabase
        .from("profiles")
        .select("profile_visibility")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (tErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tErr.message });
      }
      const vis = String((target as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
      if (vis === "private" || vis === "friends") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This profile requires a follow request.",
        });
      }
      const { error } = await ctx.supabase.from("user_follows").insert({
        follower_id: ctx.userId,
        following_id: input.userId,
        status: "accepted",
      });
      if (error && (error as PgError).code !== "23505") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string; display_name?: string } | null)?.username ?? "Someone";
      const dname = (me as { username?: string; display_name?: string } | null)?.display_name ?? uname;
      const { error: nErr } = await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.userId,
        type: "follow",
        title: "New follower",
        body: `${dname} started following you`,
        read: false,
        data: {
          requesterId: ctx.userId,
          requesterUsername: uname,
          requesterDisplayName: dname,
        },
      });
      if (nErr && process.env.NODE_ENV !== "test") {
        console.error("[profiles.followUser] notification insert:", nErr);
      }

      return { success: true as const };
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { success: true as const };
    }),

  sendFollowRequest: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid target." });
      }
      const { data: target, error: tErr } = await ctx.supabase
        .from("profiles")
        .select("profile_visibility, username")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (tErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tErr.message });
      }
      const vis = String((target as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
      if (vis !== "private" && vis !== "friends") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Use follow for public profiles." });
      }
      const { data: existing } = await ctx.supabase
        .from("user_follows")
        .select("status")
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId)
        .maybeSingle();
      const exSt = String((existing as { status?: string } | null)?.status ?? "").toLowerCase();
      if (existing && exSt === "accepted") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already following." });
      }
      if (existing && exSt === "pending") {
        return { success: true as const };
      }
      const { error } = await ctx.supabase.from("user_follows").insert({
        follower_id: ctx.userId,
        following_id: input.userId,
        status: "pending",
      });
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string } | null)?.username ?? "Someone";
      const dname = (me as { display_name?: string } | null)?.display_name ?? uname;
      const { error: nErr } = await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.userId,
        type: "follow_request",
        title: "New follow request",
        body: `${uname} wants to follow you`,
        read: false,
        data: {
          requesterId: ctx.userId,
          requesterUsername: uname,
          requesterDisplayName: dname,
        },
      });
      if (nErr && process.env.NODE_ENV !== "test") {
        console.error("[profiles.sendFollowRequest] notification insert:", nErr);
      }
      return { success: true as const };
    }),

  acceptFollowRequest: protectedProcedure
    .input(z.object({ requesterId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: row, error: uErr } = await ctx.supabase
        .from("user_follows")
        .update({ status: "accepted" })
        .eq("follower_id", input.requesterId)
        .eq("following_id", ctx.userId)
        .eq("status", "pending")
        .select("follower_id")
        .maybeSingle();
      if (uErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: uErr.message });
      }
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No pending request." });
      }
      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string } | null)?.username ?? "Someone";
      await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.requesterId,
        type: "general",
        title: "Request accepted",
        body: `${uname} accepted your follow request`,
        read: false,
        data: { accepterId: ctx.userId, accepterUsername: uname },
      });
      return { success: true as const };
    }),

  declineFollowRequest: protectedProcedure
    .input(z.object({ requesterId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", input.requesterId)
        .eq("following_id", ctx.userId)
        .eq("status", "pending");
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { success: true as const };
    }),

  getPendingFollowRequests: protectedProcedure.query(async ({ ctx }) => {
    const { data: rows, error } = await ctx.supabase
      .from("user_follows")
      .select("follower_id, created_at")
      .eq("following_id", ctx.userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    const ids = [...new Set((rows ?? []).map((r: { follower_id: string }) => r.follower_id))];
    if (ids.length === 0) return [];
    const server = getSupabaseServer() ?? ctx.supabase;
    const { data: profs } = await server.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", ids);
    const pmap = new Map((profs ?? []).map((p: ProfileRow) => [p.user_id, p]));
    return (rows ?? []).map((r: { follower_id: string; created_at: string }) => {
      const p = pmap.get(r.follower_id);
      return {
        id: `${r.follower_id}:${r.created_at}`,
        requesterId: r.follower_id,
        requesterUsername: p?.username ?? "?",
        requesterAvatarUrl: p?.avatar_url ?? null,
        createdAt: r.created_at,
      };
    });
  }),

  getBadges: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const { data: streakRow } = await server
        .from("streaks")
        .select("longest_streak_count")
        .eq("user_id", input.userId)
        .maybeSingle();
      const bestStreak = (streakRow as { longest_streak_count?: number } | null)?.longest_streak_count ?? 0;

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
        return { earned: [] as { id: string; name: string; icon: string; color: string; progress: number; total: number }[], next: [] };
      }

      const allBadges = [
        { id: "3day", name: "3-Day Fire", icon: "Zap", color: "coral", requirement: 3, type: "streak" as const },
        { id: "7day", name: "Week Warrior", icon: "Star", color: "amber", requirement: 7, type: "streak" as const },
        { id: "14day", name: "Fortnight", icon: "Trophy", color: "purple", requirement: 14, type: "streak" as const },
        { id: "30day", name: "Month Master", icon: "Target", color: "teal", requirement: 30, type: "streak" as const },
        { id: "60day", name: "Iron Will", icon: "Zap", color: "coral", requirement: 60, type: "streak" as const },
      ];

      const earned = allBadges
        .filter((b) => bestStreak >= b.requirement)
        .map((b) => ({ ...b, progress: b.requirement, total: b.requirement }));
      const next = allBadges
        .filter((b) => bestStreak < b.requirement)
        .slice(0, 3)
        .map((b) => ({ ...b, progress: bestStreak, total: b.requirement }));
      return { earned, next };
    }),

  /** Delete account: clears profile data; when SUPABASE_SERVICE_ROLE_KEY is set, also deletes auth user. Client must sign out after. */
  deleteAccount: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const { error: profileError } = await ctx.supabase
        .from("profiles")
        .delete()
        .eq("user_id", ctx.userId);
      if (profileError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete account data." });
      }
      const { hasSupabaseAdmin, getSupabaseAdmin } = await import("../../lib/supabase-admin");
      if (hasSupabaseAdmin()) {
        const admin = getSupabaseAdmin();
        await admin.auth.admin.deleteUser(ctx.userId);
      }
      return { ok: true };
    }),
});

