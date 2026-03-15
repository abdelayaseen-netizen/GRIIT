import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import type { PgError } from "../../types/db";

const PUSH_TOKEN_MAX = 500;
const DEVICE_ID_MAX = 256;

export const notificationsRouter = createTRPCRouter({
  registerToken: protectedProcedure
    .input(z.object({
      token: z.string().min(1).max(PUSH_TOKEN_MAX),
      device_id: z.string().max(DEVICE_ID_MAX).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const token = input.token.trim();
      const { error } = await ctx.supabase
        .from("push_tokens")
        .upsert(
          {
            user_id: ctx.userId,
            token,
            device_id: input.device_id?.trim().slice(0, DEVICE_ID_MAX) ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,token" }
        );

      if (error) {
        if ((error as PgError).code === "42P01") {
          return { success: true, message: "Push tokens table not yet migrated; token not stored." };
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to register push token." });
      }

      await ctx.supabase
        .from("profiles")
        .update({ expo_push_token: token })
        .eq("user_id", ctx.userId);

      return { success: true };
    }),

  updateReminderSettings: protectedProcedure
    .input(
      z.object({
        reminder_time: z.string().max(16).optional(),
        timezone: z.string().max(64).optional(),
        enabled: z.boolean().optional(),
        last_call_enabled: z.boolean().optional(),
        friend_activity_enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const update: Record<string, unknown> = {};
      if (input.reminder_time !== undefined) update.reminder_time = input.reminder_time;
      if (input.timezone !== undefined) update.reminder_timezone = input.timezone;
      if (input.enabled !== undefined) update.reminder_enabled = input.enabled;
      if (input.last_call_enabled !== undefined) update.last_call_enabled = input.last_call_enabled;
      if (input.friend_activity_enabled !== undefined) update.friend_activity_enabled = input.friend_activity_enabled;
      if (Object.keys(update).length === 0) return { success: true };

      const { error } = await ctx.supabase
        .from("profiles")
        .update(update)
        .eq("user_id", ctx.userId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update reminder settings." });
      return { success: true };
    }),

  getReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("reminder_time, preferred_secure_time, reminder_enabled, reminder_timezone, last_call_enabled, friend_activity_enabled")
      .eq("user_id", ctx.userId)
      .single();

    if (error && (error as PgError).code !== "PGRST116") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load reminder settings." });
    }
    const row = data as {
      reminder_time?: string | null;
      preferred_secure_time?: string | null;
      reminder_enabled?: boolean | null;
      reminder_timezone?: string | null;
      last_call_enabled?: boolean | null;
      friend_activity_enabled?: boolean | null;
    } | null;
    return {
      reminder_time: row?.reminder_time ?? row?.preferred_secure_time ?? "09:00",
      enabled: row?.reminder_enabled !== false,
      timezone: row?.reminder_timezone ?? "UTC",
      last_call_enabled: row?.last_call_enabled !== false,
      friend_activity_enabled: row?.friend_activity_enabled !== false,
    };
  }),
});
