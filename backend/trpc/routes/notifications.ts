import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const notificationsRouter = createTRPCRouter({
  registerToken: protectedProcedure
    .input(z.object({ token: z.string().min(1), device_id: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("push_tokens")
        .upsert(
          {
            user_id: ctx.userId,
            token: input.token.trim(),
            device_id: input.device_id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,token" }
        );

      if (error) {
        if ((error as any).code === "42P01") {
          return { success: true, message: "Push tokens table not yet migrated; token not stored." };
        }
        throw new Error(error.message);
      }

      await ctx.supabase
        .from("profiles")
        .update({ expo_push_token: input.token.trim() })
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

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  getReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("preferred_secure_time, reminder_enabled, reminder_timezone")
      .eq("user_id", ctx.userId)
      .single();

    if (error && (error as any).code !== "PGRST116") throw new Error(error.message);
    return {
      reminder_time: (data as any)?.preferred_secure_time ?? "20:00",
      enabled: (data as any)?.reminder_enabled !== false,
      timezone: (data as any)?.reminder_timezone ?? "UTC",
    };
  }),
});
