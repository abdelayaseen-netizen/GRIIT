/**
 * Integrations router: Strava connect, disconnect, fetch activities.
 * Provider-agnostic structure for future Apple Health, WHOOP, etc.
 */

import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { assertActiveChallengeOwnership } from "../guards";
import { getStravaPublicConfig } from "../../lib/strava-config";
import { createState } from "../../lib/strava-oauth-state";
import {
  getAuthorizationUrl,
  ensureValidToken,
  getAthlete,
  getAthleteActivities,
  type ConnectedAccountRow,
  type StravaActivity,
} from "../../lib/strava-service";
import { verifyStravaTaskCompletion } from "../../lib/strava-verifier";
import { getTodayDateKey } from "../../lib/date-utils";

const PROVIDER_STRAVA = "strava";

export const integrationsRouter = createTRPCRouter({
  /** Returns Strava OAuth URL with state tied to current user. */
  getStravaAuthUrl: protectedProcedure.query(({ ctx }) => {
    const publicConfig = getStravaPublicConfig();
    if (!publicConfig.enabled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Strava integration is not configured",
      });
    }
    const state = createState(ctx.userId);
    const url = getAuthorizationUrl(state);
    return { url, state };
  }),

  /** Whether Strava is configured (no secret). */
  isStravaEnabled: protectedProcedure.query(() => {
    return getStravaPublicConfig().enabled;
  }),

  /** Get current user's Strava connection (no tokens in response). Never throws — returns null if disconnected or on any failure. */
  getStravaConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await ctx.supabase
        .from("connected_accounts")
        .select("id, provider, provider_user_id, expires_at, scope, metadata_json, created_at, updated_at")
        .eq("user_id", ctx.userId)
        .eq("provider", PROVIDER_STRAVA)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        provider: data.provider,
        providerUserId: data.provider_user_id,
        expiresAt: data.expires_at,
        scope: data.scope,
        metadata: (data.metadata_json as Record<string, unknown>) ?? {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return null;
    }
  }),

  /** Fetch recent Strava activities. Uses stored connection; refreshes token if needed. */
  getStravaActivities: protectedProcedure
    .input(
      z
        .object({
          after: z.number().optional(),
          before: z.number().optional(),
          page: z.number().min(1).optional(),
          perPage: z.number().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { data: row, error: fetchError } = await ctx.supabase
        .from("connected_accounts")
        .select("id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scope, metadata_json, created_at, updated_at")
        .eq("user_id", ctx.userId)
        .eq("provider", PROVIDER_STRAVA)
        .maybeSingle();

      if (fetchError || !row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Strava not connected. Connect your account first.",
        });
      }

      const connection = row as ConnectedAccountRow;
      const accessToken = await ensureValidToken(connection, async (updates) => {
        await ctx.supabase
          .from("connected_accounts")
          .update({
            access_token: updates.access_token,
            refresh_token: updates.refresh_token ?? connection.refresh_token,
            expires_at: updates.expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);
      });

      const params = {
        after: input?.after,
        before: input?.before,
        page: input?.page ?? 1,
        per_page: input?.perPage ?? 30,
      };
      const activities = await getAthleteActivities(accessToken, params);
      return activities as StravaActivity[];
    }),

  /** Get Strava athlete profile (for display). */
  getStravaAthlete: protectedProcedure.query(async ({ ctx }) => {
    const { data: row, error: fetchError } = await ctx.supabase
      .from("connected_accounts")
      .select("id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scope, metadata_json, created_at, updated_at")
      .eq("user_id", ctx.userId)
      .eq("provider", PROVIDER_STRAVA)
      .maybeSingle();

    if (fetchError || !row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Strava not connected",
      });
    }

    const connection = row as ConnectedAccountRow;
    const accessToken = await ensureValidToken(connection, async (updates) => {
      await ctx.supabase
        .from("connected_accounts")
        .update({
          access_token: updates.access_token,
          refresh_token: updates.refresh_token ?? connection.refresh_token,
          expires_at: updates.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connection.id);
    });

    const athlete = await getAthlete(accessToken);
    return athlete;
  }),

  /** Disconnect Strava. */
  disconnectStrava: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from("connected_accounts")
      .delete()
      .eq("user_id", ctx.userId)
      .eq("provider", PROVIDER_STRAVA);

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to disconnect" });
    }
    return { ok: true };
  }),

  /** Verify a Strava-verified task for today: fetch activities and match rule, upsert check_in if match. */
  verifyStravaTask: protectedProcedure
    .input(
      z.object({
        activeChallengeId: z.string().uuid(),
        taskId: z.string().uuid(),
        dateKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const dateKey = input.dateKey ?? getTodayDateKey();
      const result = await verifyStravaTaskCompletion(
        ctx.supabase,
        ctx.userId,
        input.activeChallengeId,
        input.taskId,
        dateKey
      );
      return result;
    }),
});
