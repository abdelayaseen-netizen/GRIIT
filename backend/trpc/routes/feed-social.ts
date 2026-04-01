import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure } from "../create-context";
import { getSupabaseServer } from "../../lib/supabase-server";
import { sendExpoPush } from "../../lib/push";
import { logger } from "../../lib/logger";

type EvRow = {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const feedSocialProcedures = {
  react: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: existing } = await ctx.supabase
        .from("feed_reactions")
        .select("id")
        .eq("event_id", input.eventId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      let reacted = false;
      if (existing?.id) {
        const { error } = await ctx.supabase
          .from("feed_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to remove reaction." });
      } else {
        const { error } = await ctx.supabase
          .from("feed_reactions")
          .insert({
            user_id: ctx.userId,
            event_id: input.eventId,
            reaction: "fire",
          });
        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to react." });
        reacted = true;
      }
      const { count } = await ctx.supabase
        .from("feed_reactions")
        .select("id", { count: "exact", head: true })
        .eq("event_id", input.eventId);

      if (reacted) {
        const srv = getSupabaseServer();
        if (srv) {
          const { data: evRow } = await srv
            .from("activity_events")
            .select("user_id, challenge_id, metadata")
            .eq("id", input.eventId)
            .maybeSingle();
          const evTyped = evRow as { user_id?: string; challenge_id?: string | null; metadata?: Record<string, unknown> } | null;
          const ownerId = evTyped?.user_id;
          if (ownerId && ownerId !== ctx.userId) {
            // Notification batching: skip if there's an unread respect notif for this event in last 5 min
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: recentRespectRows } = await srv
              .from("in_app_notifications")
              .select("id, data")
              .eq("user_id", ownerId)
              .eq("type", "respect")
              .eq("read", false)
              .gte("created_at", fiveMinAgo);
            const skipNotification = (recentRespectRows ?? []).some((r: { data?: unknown }) => {
              const d = r.data;
              if (!d || typeof d !== "object" || Array.isArray(d)) return false;
              return String((d as Record<string, unknown>).event_id ?? "") === input.eventId;
            });

            if (!skipNotification) {
              const { data: actorProfile } = await srv
                .from("profiles")
                .select("username, display_name, avatar_url")
                .eq("user_id", ctx.userId)
                .maybeSingle();
              const actor = actorProfile as { username?: string; display_name?: string | null; avatar_url?: string | null } | null;
              const actorUsername = actor?.username ?? "someone";
              const actorDisplayName = actor?.display_name ?? actorUsername;

              let challengeTitle = "challenge";
              const evMeta = evTyped?.metadata ?? {};
              if (typeof evMeta.challenge_name === "string" && evMeta.challenge_name.trim()) {
                challengeTitle = evMeta.challenge_name.trim();
              } else if (evTyped?.challenge_id) {
                const { data: chRow } = await srv.from("challenges").select("title").eq("id", evTyped.challenge_id).maybeSingle();
                challengeTitle = (chRow as { title?: string } | null)?.title ?? "challenge";
              }
              const dayNum =
                typeof evMeta.day_number === "number"
                  ? evMeta.day_number
                  : typeof evMeta.current_day === "number"
                    ? evMeta.current_day
                    : null;
              const dayLabel = dayNum ? `Day ${dayNum}` : "";

              const anySrv = srv as unknown as {
                from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { message?: string } | null }> };
              };
              const { error: nErr } = await anySrv.from("in_app_notifications").insert({
                user_id: ownerId,
                type: "respect",
                read: false,
                data: {
                  actor_id: ctx.userId,
                  actor_username: actorUsername,
                  actor_display_name: actorDisplayName,
                  actor_avatar_url: actor?.avatar_url ?? null,
                  event_id: input.eventId,
                  challenge_title: challengeTitle,
                  day_label: dayLabel,
                },
              });
              if (nErr) logger.error({ err: nErr }, "[feed.react] in_app_notifications insert");

              try {
                const [pushTokenResult, ownerProfileResult] = await Promise.all([
                  srv.from("push_tokens").select("token").eq("user_id", ownerId),
                  srv.from("profiles").select("expo_push_token").eq("user_id", ownerId).maybeSingle(),
                ]);
                const tokensFromTable = (pushTokenResult.data ?? []).map((r: { token: string }) => r.token).filter(Boolean);
                const profileToken = (ownerProfileResult.data as { expo_push_token?: string | null } | null)?.expo_push_token ?? null;
                const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))].filter((t): t is string => typeof t === "string");
                if (allTokens.length > 0) {
                  const pushTitle = "New respect";
                  const pushBody = dayLabel
                    ? `${actorDisplayName} respected your ${dayLabel} ${challengeTitle} post`
                    : `${actorDisplayName} respected your ${challengeTitle} post`;
                  await sendExpoPush(allTokens, pushTitle, pushBody);
                }
              } catch (pushErr) {
                logger.error({ err: pushErr }, "[feed.react] push send error");
              }
            }
          }
        }
      }

      return { success: true as const, reacted, reactionCount: count ?? 0 };
    }),

  getComments: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const { data: comments, error } = await ctx.supabase
        .from("feed_comments")
        .select("id, event_id, user_id, text, created_at")
        .eq("event_id", input.eventId)
        .order("created_at", { ascending: true })
        .limit(input.limit);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to load comments." });
      }
      const userIds = [...new Set((comments ?? []).map((c: { user_id: string }) => c.user_id))];
      const { data: profiles } = userIds.length
        ? await ctx.supabase
            .from("profiles")
            .select("user_id, display_name, username, avatar_url")
            .in("user_id", userIds)
        : { data: [] as { user_id: string; display_name?: string | null; username?: string | null; avatar_url?: string | null }[] };
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );
      return (comments ?? []).map((row) => {
        const profile = profileMap.get(row.user_id);
        return {
          id: row.id,
          event_id: row.event_id,
          user_id: row.user_id,
          text: row.text,
          created_at: row.created_at,
          display_name: profile?.display_name ?? profile?.username ?? "Someone",
          username: profile?.username ?? "?",
          avatar_url: profile?.avatar_url ?? null,
        };
      });
    }),

  comment: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        text: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: inserted, error } = await ctx.supabase.from("feed_comments").insert({
        user_id: ctx.userId,
        event_id: input.eventId,
        text: input.text.trim(),
      }).select("id, event_id, user_id, text, created_at").single();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to comment." });
      }
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("user_id", ctx.userId)
        .maybeSingle();

      const srv = getSupabaseServer();
      if (srv) {
        const { data: evRow } = await srv
          .from("activity_events")
          .select("user_id, challenge_id, metadata")
          .eq("id", input.eventId)
          .maybeSingle();
        const evTyped = evRow as { user_id?: string; challenge_id?: string | null; metadata?: Record<string, unknown> } | null;
        const ownerId = evTyped?.user_id;
        if (ownerId && ownerId !== ctx.userId) {
          const commentActorUsername = profile?.username ?? "someone";
          const commentActorDisplayName = profile?.display_name ?? commentActorUsername;

          let commentChallengeTitle = "challenge";
          const cMeta = evTyped?.metadata ?? {};
          if (typeof cMeta.challenge_name === "string" && cMeta.challenge_name.trim()) {
            commentChallengeTitle = cMeta.challenge_name.trim();
          } else if (evTyped?.challenge_id) {
            const { data: chRow } = await srv.from("challenges").select("title").eq("id", evTyped.challenge_id).maybeSingle();
            commentChallengeTitle = (chRow as { title?: string } | null)?.title ?? "challenge";
          }

          const anySrv = srv as unknown as {
            from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { message?: string } | null }> };
          };
          const { error: nErr } = await anySrv.from("in_app_notifications").insert({
            user_id: ownerId,
            type: "comment",
            read: false,
            data: {
              actor_id: ctx.userId,
              actor_username: commentActorUsername,
              actor_display_name: commentActorDisplayName,
              actor_avatar_url: profile?.avatar_url ?? null,
              event_id: input.eventId,
              comment_text: input.text.trim().slice(0, 200),
              challenge_title: commentChallengeTitle,
            },
          });
          if (nErr) logger.error({ err: nErr }, "[feed.comment] in_app_notifications insert");

          try {
            const [pushTokenResult, ownerProfileResult] = await Promise.all([
              srv.from("push_tokens").select("token").eq("user_id", ownerId),
              srv.from("profiles").select("expo_push_token").eq("user_id", ownerId).maybeSingle(),
            ]);
            const tokensFromTable = (pushTokenResult.data ?? []).map((r: { token: string }) => r.token).filter(Boolean);
            const profileToken = (ownerProfileResult.data as { expo_push_token?: string | null } | null)?.expo_push_token ?? null;
            const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))].filter((t): t is string => typeof t === "string");
            if (allTokens.length > 0) {
              const commentPreview = input.text.trim().slice(0, 60);
              const pushTitle = "New comment";
              const pushBody = `${commentActorDisplayName} commented: "${commentPreview}"`;
              await sendExpoPush(allTokens, pushTitle, pushBody);
            }
          } catch (pushErr) {
            logger.error({ err: pushErr }, "[feed.comment] push send error");
          }
        }
      }

      return {
        success: true as const,
        comment: {
          id: inserted?.id,
          event_id: inserted?.event_id,
          user_id: inserted?.user_id,
          text: inserted?.text,
          created_at: inserted?.created_at,
          display_name: profile?.display_name ?? profile?.username ?? "You",
          username: profile?.username ?? "you",
          avatar_url: profile?.avatar_url ?? null,
        },
      };
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: comment, error: qErr } = await ctx.supabase
        .from("feed_comments")
        .select("id, user_id")
        .eq("id", input.commentId)
        .maybeSingle();
      if (qErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: qErr.message || "Failed to load comment." });
      }
      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }
      const row = comment as { id: string; user_id: string };
      if (row.user_id !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments" });
      }
      const { error } = await ctx.supabase.from("feed_comments").delete().eq("id", input.commentId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to delete comment" });
      }
      return { deleted: true as const };
    }),

  /** Remove the viewer's own activity event from the feed (cascades to reactions/comments). */
  deletePost: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: row, error: qErr } = await ctx.supabase
        .from("activity_events")
        .select("user_id")
        .eq("id", input.eventId)
        .maybeSingle();
      if (qErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: qErr.message });
      }
      const ownerId = (row as { user_id?: string } | null)?.user_id;
      if (!ownerId || ownerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own posts." });
      }
      const { error } = await ctx.supabase.from("activity_events").delete().eq("id", input.eventId).eq("user_id", ctx.userId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to delete post." });
      }
      return { ok: true as const };
    }),

  getReactions: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: reactions, error } = await ctx.supabase
        .from("feed_reactions")
        .select("user_id, created_at")
        .eq("event_id", input.eventId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to load reactions." });
      }
      const userIds = [...new Set((reactions ?? []).map((r: { user_id: string }) => r.user_id))];
      if (userIds.length === 0) return [];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map(
        (profiles ?? []).map((p: { user_id: string; username?: string | null; display_name?: string | null; avatar_url?: string | null }) => [
          p.user_id,
          p,
        ])
      );
      return userIds.map((uid) => {
        const p = profileMap.get(uid);
        return {
          userId: uid,
          username: p?.username ?? "?",
          displayName: p?.display_name ?? p?.username ?? "Someone",
          avatarUrl: p?.avatar_url ?? null,
        };
      });
    }),

  /** Attach caption to the latest task_completed activity event (feed). Uses service role for update. */
  getRecentCompletions: publicProcedure.query(async ({ ctx }) => {
    const server = getSupabaseServer() ?? ctx.supabase;
    const { data: raw, error } = await server
      .from("activity_events")
      .select("id, user_id, challenge_id, metadata, created_at")
      .eq("event_type", "task_completed")
      .order("created_at", { ascending: false })
      .limit(45);
    if (error) {
      logger.error({ err: error }, "[feed.getRecentCompletions] query failed");
      return [];
    }
    const events = (raw ?? []) as EvRow[];
    const challengeIds = [...new Set(events.map((e) => e.challenge_id).filter((x): x is string => !!x))];
    if (challengeIds.length === 0) return [];

    const { data: chRows } = await server.from("challenges").select("id, title, visibility").in("id", challengeIds);
    const publicIds = new Set(
      (chRows ?? [])
        .filter((c: { visibility?: string | null }) => String(c.visibility ?? "").toUpperCase() === "PUBLIC")
        .map((c: { id: string }) => c.id)
    );
    const chTitle = new Map((chRows ?? []).map((c: { id: string; title?: string | null }) => [c.id, c.title ?? ""]));

    const userIds = [...new Set(events.map((e) => e.user_id))];
    const { data: profRows } = await server
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", userIds);
    const profMap = new Map(
      (profRows ?? []).map((p: { user_id: string; display_name?: string | null; username?: string | null; avatar_url?: string | null }) => [
        p.user_id,
        p,
      ])
    );

    const picked: EvRow[] = [];
    for (const ev of events) {
      if (!ev.challenge_id || !publicIds.has(ev.challenge_id)) continue;
      picked.push(ev);
      if (picked.length >= 15) break;
    }
    if (picked.length === 0) return [];

    const pairs = picked.map((e) => ({ uid: e.user_id, cid: e.challenge_id as string }));
    const cids = [...new Set(pairs.map((p) => p.cid))];
    const uids = [...new Set(pairs.map((p) => p.uid))];
    const { data: acRows } = await server
      .from("active_challenges")
      .select("user_id, challenge_id, current_day")
      .in("challenge_id", cids)
      .in("user_id", uids)
      .eq("status", "active");
    const dayMap = new Map<string, number>();
    for (const r of acRows ?? []) {
      const row = r as { user_id: string; challenge_id: string; current_day?: number | null };
      dayMap.set(`${row.user_id}:${row.challenge_id}`, row.current_day ?? 1);
    }

    return picked.map((ev) => {
      const meta = ev.metadata ?? {};
      const p = profMap.get(ev.user_id);
      const titleFromMeta = typeof meta.challenge_name === "string" ? meta.challenge_name.trim() : "";
      const challengeTitle = titleFromMeta || chTitle.get(ev.challenge_id as string) || "a challenge";
      const day =
        typeof meta.current_day === "number"
          ? meta.current_day
          : dayMap.get(`${ev.user_id}:${ev.challenge_id}`) ?? 1;
      return {
        id: ev.id,
        completedAt: ev.created_at,
        userName: (p?.display_name?.trim() || p?.username || "Someone") as string,
        avatarUrl: p?.avatar_url ?? null,
        challengeTitle,
        challengeId: ev.challenge_id as string,
        currentDay: day,
      };
    });
  }),

};
