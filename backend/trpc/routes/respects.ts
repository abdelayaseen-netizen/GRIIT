import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const respectsRouter = createTRPCRouter({
  give: protectedProcedure
    .input(z.object({ recipientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.recipientId === ctx.userId) throw new Error("Cannot give respect to yourself");
      const { error } = await ctx.supabase.from("respects").insert({
        actor_id: ctx.userId,
        recipient_id: input.recipientId,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }),

  getForUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: rows } = await ctx.supabase
      .from("respects")
      .select("id, actor_id, created_at")
      .eq("recipient_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const count = rows?.length ?? 0;
    const recent = (rows ?? []).slice(0, 10).map((r: any) => ({ id: r.id, actorId: r.actor_id, at: r.created_at }));
    const actorIds = [...new Set((rows ?? []).map((r: any) => r.actor_id))];
    const { data: profiles } = await ctx.supabase.from("profiles").select("user_id, username, display_name").in("user_id", actorIds);
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const recentWithNames = recent.map((r) => ({
      ...r,
      actorUsername: profileMap.get(r.actorId)?.username ?? "?",
      actorDisplayName: profileMap.get(r.actorId)?.display_name ?? profileMap.get(r.actorId)?.username ?? "?",
    }));
    return { count, recent: recentWithNames };
  }),

  getCountForUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { count, error } = await ctx.supabase
        .from("respects")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", input.userId);
      if (error) throw new Error(error.message);
      return { count: count ?? 0 };
    }),
});
