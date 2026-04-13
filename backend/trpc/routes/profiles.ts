/**
 * REQUIRED ENV VAR for server-side subscription validation:
 *   REVENUECAT_API_KEY — RevenueCat secret API key (starts with sk_).
 *   Get from: app.revenuecat.com → Project Settings → API Keys → Secret API key
 *   Set in Railway dashboard as environment variable.
 *   If unset, validateSubscription returns current DB values without verification.
 */
// NOTE(architecture): Split into sub-routers — see docs/ARCHITECTURE.md
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
import { requireNoError } from "../errors";
import type { PgError, ProfileRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";
import { sanitizeSearchQuery } from "../../lib/sanitize-search";
import { profilesSocialProcedures } from "./profiles-social";
import { profilesStatsProcedures } from "./profiles-stats";

/** Must match the entitlement identifier in RevenueCat dashboard exactly. */
const RC_ENTITLEMENT_ID = "GRIIT Pro";

/** Subscription fields are written only by profiles.validateSubscription (server-side RevenueCat validation). */
const PROFILE_UPDATE_KEYS = [
  "username", "display_name", "bio", "avatar_url", "cover_url",
  "onboarding_completed", "onboarding_completed_at", "onboarding_answers",
  "primary_goal", "daily_time_budget",
  "starter_challenge_id", "preferred_secure_time",
  "profile_visibility", "weekly_goal",
  "timezone",
] as const;

type SubscriptionStatus = "free" | "premium" | "trial";

function mapEntitlementToStatus(expiresDate: string | null): SubscriptionStatus {
  if (!expiresDate) return "free";
  const expiry = new Date(expiresDate);
  if (Number.isNaN(expiry.getTime())) return "free";
  return expiry > new Date() ? "premium" : "free";
}

export const profilesRouter = createTRPCRouter({
  ...profilesSocialProcedures,
  ...profilesStatsProcedures,
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
        .select(
          "user_id, username, display_name, bio, avatar_url, cover_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility, onboarding_completed, timezone"
        )
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
    .input(z.object({ username: z.string().min(1).max(100) }))
    .query(async ({ input, ctx }) => {
      const unauthService = ctx.userId ? null : getSupabaseServer();
      const server = ctx.userId ? ctx.supabase : (unauthService ?? ctx.supabase);
      const trimmed = input.username.trim();
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
      const profileQuery = isUuid
        ? server
            .from("profiles")
            .select("user_id, username, display_name, avatar_url, total_days_secured, tier, bio, created_at, profile_visibility")
            .eq("user_id", trimmed)
            .maybeSingle()
        : server
            .from("profiles")
            .select("user_id, username, display_name, avatar_url, total_days_secured, tier, bio, created_at, profile_visibility")
            .eq("username", trimmed)
            .maybeSingle();
      const { data: profile, error: profileError } = await profileQuery;
      if (profileError) {
        const errMsg =
          typeof profileError === "object" && profileError !== null
            ? (profileError as { message?: string }).message ?? JSON.stringify(profileError)
            : String(profileError);
        const { logger } = await import("../../lib/logger");
        logger.error({ error: profileError, username: input.username }, "[profiles.getPublicByUsername]");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to load profile: ${errMsg}` });
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
      let activeChal: number | null = 0;
      let doneChal: number | null = 0;
      try {
        const [activeRes, doneRes] = await Promise.all([
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
        activeChal = activeRes.count;
        doneChal = doneRes.count;
      } catch {
        // active_challenges RLS may block reading other users' rows — degrade gracefully
      }
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

  /**
   * Native push: persist Expo token on `profiles.push_token`.
   * REQUIRES (run manually in Supabase SQL editor — Yaseen): `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;`
   */
  updatePushToken: protectedProcedure
    .input(z.object({ pushToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("profiles")
        .update({ push_token: input.pushToken })
        .eq("user_id", ctx.userId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save push token." });
      }
      return { success: true as const };
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      // Only columns present in shipped Supabase migrations — avoids 500 when optional columns are missing.
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select(
          "user_id, username, display_name, bio, avatar_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility, timezone"
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
        const rcEntitlement = entitlements[RC_ENTITLEMENT_ID];
        const expiresDate = rcEntitlement?.expires_date ?? null;
        const subscription_status = mapEntitlementToStatus(expiresDate);
        const subscription_expiry = expiresDate;

        const updatePayload: Record<string, unknown> = {
          subscription_status,
          subscription_expiry,
          subscription_platform: null,
          subscription_product_id: rcEntitlement?.product_identifier ?? null,
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
      timezone: z.string().max(64).optional(),
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
            "user_id, username, display_name, bio, avatar_url, cover_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility, onboarding_completed, timezone"
          )
          .eq("user_id", ctx.userId)
          .single();
        return data;
      }

      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', ctx.userId)
        .select(
          "user_id, username, display_name, bio, avatar_url, cover_url, tier, subscription_status, subscription_expiry, total_days_secured, created_at, updated_at, profile_visibility, onboarding_completed, timezone"
        )
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

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100).transform((s) => s.trim()) }))
    .query(async ({ input, ctx }) => {
      const q = input.query.trim();
      if (!q) return [];
      const escapedSafe = sanitizeSearchQuery(q);
      if (!escapedSafe) return [];
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .neq("user_id", ctx.userId)
        .or(`username.ilike.%${escapedSafe}%,display_name.ilike.%${escapedSafe}%`)
        .limit(20);
      requireNoError(error, "Failed to search profiles.");
      const rows = (data ?? []) as ProfileRow[];
      const ids = rows.map((r) => r.user_id);
      const { data: streakRows } =
        ids.length > 0
          ? await ctx.supabase.from("streaks").select("user_id, active_streak_count").in("user_id", ids).limit(200)
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

  getFollowers: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: rows, error } = await ctx.supabase
        .from("user_follows")
        .select("follower_id")
        .eq("following_id", input.userId)
        .eq("status", "accepted")
        .limit(50);
      if (error || !rows?.length) {
        return [] as {
          user_id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          is_following: boolean;
        }[];
      }
      const ids = [...new Set(rows.map((r: { follower_id: string }) => r.follower_id))];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", ids)
        .limit(50);
      const pmap = new Map((profiles ?? []).map((p: { user_id: string }) => [p.user_id, p]));

      let followingSet = new Set<string>();
      if (ctx.userId && ids.length > 0) {
        const { data: my } = await ctx.supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", ctx.userId)
          .eq("status", "accepted")
          .in("following_id", ids)
          .limit(50);
        followingSet = new Set((my ?? []).map((m: { following_id: string }) => m.following_id));
      }

      return ids.map((id) => {
        const p = pmap.get(id) as { username?: string; display_name?: string | null; avatar_url?: string | null } | undefined;
        return {
          user_id: id,
          username: p?.username ?? "unknown",
          display_name: p?.display_name ?? null,
          avatar_url: p?.avatar_url ?? null,
          is_following: followingSet.has(id),
        };
      });
    }),

  getFollowing: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: rows, error } = await ctx.supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", input.userId)
        .eq("status", "accepted")
        .limit(50);
      if (error || !rows?.length) {
        return [] as {
          user_id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          is_following: boolean;
        }[];
      }
      const ids = [...new Set(rows.map((r: { following_id: string }) => r.following_id))];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", ids)
        .limit(50);
      const pmap = new Map((profiles ?? []).map((p: { user_id: string }) => [p.user_id, p]));

      let followingSet = new Set<string>();
      if (ctx.userId && ids.length > 0) {
        const { data: my } = await ctx.supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", ctx.userId)
          .eq("status", "accepted")
          .in("following_id", ids)
          .limit(50);
        followingSet = new Set((my ?? []).map((m: { following_id: string }) => m.following_id));
      }

      return ids.map((id) => {
        const p = pmap.get(id) as { username?: string; display_name?: string | null; avatar_url?: string | null } | undefined;
        return {
          user_id: id,
          username: p?.username ?? "unknown",
          display_name: p?.display_name ?? null,
          avatar_url: p?.avatar_url ?? null,
          is_following: followingSet.has(id),
        };
      });
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

