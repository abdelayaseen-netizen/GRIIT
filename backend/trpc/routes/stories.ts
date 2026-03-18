import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import type { StoryWithViews } from "../../types/db";
import { getVisibleUserIds } from "../../lib/get-visible-user-ids";

const MEDIA_URL_MAX = 2000;
const CAPTION_MAX = 500;

export const storiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      mediaUrl: z.string().min(1).max(MEDIA_URL_MAX),
      mediaType: z.enum(['image', 'video']),
      caption: z.string().max(CAPTION_MAX).optional(),
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

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create story." });
      return data;
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

      const now = new Date().toISOString();
      const visibleUserIds = await getVisibleUserIds(ctx.supabase, ctx.userId);

      const { data, error } = await ctx.supabase
        .from("stories")
        .select(
          `
          id, user_id, media_url, media_type, caption, expires_at, created_at,
          profiles (username, avatar_url),
          story_views!left (user_id)
        `
        )
        .in("user_id", visibleUserIds)
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load stories." });

      type StoryRow = StoryWithViews & { story_views?: { user_id: string }[] };
      const items = (data ?? []).map((story: StoryRow) => ({
        ...story,
        viewed: story.story_views?.some((v) => v.user_id === ctx.userId) ?? false,
      }));

      const hasMore = items.length === limit;
      const nextCursor = hasMore ? String(safeOffset + limit) : undefined;

      const noPagination = input?.cursor == null && input?.limit == null;
      return noPagination ? items : { items, nextCursor };
    }),

  markViewed: protectedProcedure
    .input(z.object({
      storyId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('story_views')
        .upsert({
          story_id: input.storyId,
          user_id: ctx.userId,
        });

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record view." });
      return { success: true };
    }),
});
