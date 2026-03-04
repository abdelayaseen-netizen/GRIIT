import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const storiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      mediaUrl: z.string(),
      mediaType: z.enum(['image', 'video']),
      caption: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await ctx.supabase
        .from('stories')
        .insert({
          user_id: ctx.userId,
          media_url: input.mediaUrl,
          media_type: input.mediaType,
          caption: input.caption,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date().toISOString();

      const { data, error } = await ctx.supabase
        .from('stories')
        .select(`
          *,
          profiles (username, avatar_url),
          story_views!left (user_id)
        `)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      return (data ?? []).map((story: any) => ({
        ...story,
        viewed: story.story_views?.some((v: any) => v.user_id === ctx.userId) || false,
      }));
    }),

  markViewed: protectedProcedure
    .input(z.object({
      storyId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('story_views')
        .upsert({
          story_id: input.storyId,
          user_id: ctx.userId,
        });

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
