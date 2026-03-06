import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

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
        if ((error as any).code === "42P01") {
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
        reminder_time: z.string().optional(),
        timezone: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const update: Record<string, unknown> = {};
      if (input.reminder_time !== undefined) update.preferred_secure_time = input.reminder_time;
      if (input.timezone !== undefined) update.reminder_timezone = input.timezone;
      if (input.enabled !== undefined) update.reminder_enabled = input.enabled;
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
      .select("preferred_secure_time, reminder_enabled, reminder_timezone")
      .eq("user_id", ctx.userId)
      .single();

    if (error && (error as any).code !== "PGRST116") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load reminder settings." });
    }
    return {
      reminder_time: (data as any)?.preferred_secure_time ?? "20:00",
      enabled: (data as any)?.reminder_enabled !== false,
      timezone: (data as any)?.reminder_timezone ?? "UTC",
    };
  }),
});
