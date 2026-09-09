import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const todayTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  done: z.boolean(),
  require_photo: z.boolean(),
  require_location: z.boolean(),
  config: z.record(z.string(), z.unknown()).nullable(),
});

const todayEnrollmentSchema = z.object({
  active_challenge_id: z.string().uuid(),
  challenge_id: z.string().uuid(),
  title: z.string(),
  current_day: z.number(),
  secured_today: z.boolean(),
  tasks: z.array(todayTaskSchema),
});

const todayStateSchema = z.object({
  date_key: z.string(),
  secured: z.boolean(),
  streak: z.number(),
  secured_date_keys: z.array(z.string()),
  enrollments: z.array(todayEnrollmentSchema),
  remaining_challenges: z.number(),
});

export const todayRouter = createTRPCRouter({
  get: protectedProcedure.output(todayStateSchema).query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc("today_state", { p_uid: ctx.userId });
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Could not load today.",
      });
    }
    return todayStateSchema.parse(data);
  }),
});
