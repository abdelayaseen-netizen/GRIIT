import { createTRPCRouter, protectedProcedure } from "../create-context";

export const achievementsRouter = createTRPCRouter({
  getForUser: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("user_achievements")
      .select("achievement_key, unlocked_at")
      .eq("user_id", ctx.userId)
      .order("unlocked_at", { ascending: false });
    return data ?? [];
  }),
});
