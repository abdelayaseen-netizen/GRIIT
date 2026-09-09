import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { todayStateSchema, type TodayState } from "../../../lib/today-state";

export const todayRouter = createTRPCRouter({
  get: protectedProcedure.output(todayStateSchema).query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc("today_state", { p_uid: ctx.userId });
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Could not load today.",
      });
    }
    return todayStateSchema.parse(data) as TodayState;
  }),
});
