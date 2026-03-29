import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { getVisibleUserIds } from "../../lib/get-visible-user-ids";
import { getSupabaseServer } from "../../lib/supabase-server";

const LIVE_FEED_TYPES = ["task_completed", "completed_challenge", "joined_challenge", "secured_day"] as const;

function normalizeChallengeVisibility(raw: string | null | undefined): "public" | "friends" | "private" {
  const s = (raw ?? "public").toLowerCase();
  if (s === "private") return "private";
  if (s === "friends") return "friends";
  return "public";
}

type EvRow = {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function followRowAccepted(row: { status?: string | null }): boolean {
  const s = String(row.status ?? "accepted").toLowerCase();
  return s === "accepted";
}

async function hydrateActivityEventsToPosts(
  events: EvRow[],
  viewerId: string,
  followingIds: Set<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server: any
): Promise<
  Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    streakCount: number;
    challengeId: string | null;
    challengeName: string;
    taskName?: string | null;
    currentDay: number;
    totalDays: number;
    eventType: string;
    isCompleted: boolean;
    hasProof: boolean;
    photoUrl: string | null;
    proofPhotoUrl?: string | null;
    verified: boolean;
    caption: string | null;
    createdAt: string;
    respectCount: number;
    reactedByMe: boolean;
    commentCount: number;
    visibility: "public" | "friends" | "private";
  }>
> {
  if (events.length === 0) return [];

  const challengeIds = [...new Set(events.map((e) => e.challenge_id).filter((id): id is string => !!id))];
  const userIds = [...new Set(events.map((e) => e.user_id))];

  const [chRes, acRes, profRes] = await Promise.all([
    challengeIds.length
      ? server.from("challenges").select("id, title, visibility, duration_days").in("id", challengeIds)
      : Promise.resolve({ data: [] as { id: string; title?: string; visibility?: string; duration_days?: number }[] }),
    challengeIds.length
      ? server
          .from("active_challenges")
          .select("user_id, challenge_id, current_day, status")
          .in("challenge_id", challengeIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] as { user_id: string; challenge_id: string; current_day?: number }[] }),
    userIds.length
      ? server.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", userIds)
      : Promise.resolve({ data: [] as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null }[] }),
  ]);

  const challenges = (chRes as { data: unknown }).data as { id: string; title?: string; visibility?: string; duration_days?: number }[];
  const activeRows = (acRes as { data: unknown }).data as { user_id: string; challenge_id: string; current_day?: number }[];
  const profiles = (profRes as { data: unknown }).data as {
    user_id: string;
    display_name?: string;
    username?: string;
    avatar_url?: string | null;
  }[];

  const challengeMap = new Map(challenges.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
  const activeMap = new Map<string, { current_day: number }>();
  for (const row of activeRows) {
    activeMap.set(`${row.user_id}:${row.challenge_id}`, { current_day: row.current_day ?? 1 });
  }

  const passesVisibility = (ev: EvRow, vis: "public" | "friends" | "private"): boolean => {
    if (vis === "private" && ev.user_id !== viewerId) return false;
    if (vis === "friends" && ev.user_id !== viewerId && !followingIds.has(ev.user_id)) return false;
    return true;
  };

  const filtered: EvRow[] = [];
  for (const ev of events) {
    const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
    if (ev.challenge_id && !ch) continue;
    const vis = normalizeChallengeVisibility(ch?.visibility);
    if (!passesVisibility(ev, vis)) continue;
    filtered.push(ev);
  }

  const eventIds = filtered.map((e) => e.id);
  const reactionStats = new Map<string, { count: number; reactedByMe: boolean }>();
  const commentCounts = new Map<string, number>();
  if (eventIds.length > 0) {
    const { data: reactions } = await ctx.supabase
      .from("feed_reactions")
      .select("event_id, user_id")
      .in("event_id", eventIds);
    for (const row of (reactions ?? []) as { event_id: string; user_id: string }[]) {
      const prev = reactionStats.get(row.event_id) ?? { count: 0, reactedByMe: false };
      reactionStats.set(row.event_id, {
        count: prev.count + 1,
        reactedByMe: prev.reactedByMe || row.user_id === viewerId,
      });
    }
    const { data: comments } = await ctx.supabase.from("feed_comments").select("event_id").in("event_id", eventIds);
    for (const row of (comments ?? []) as { event_id: string }[]) {
      commentCounts.set(row.event_id, (commentCounts.get(row.event_id) ?? 0) + 1);
    }
  }

  const streakByUser = new Map<string, number>();
  if (userIds.length > 0) {
    const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", userIds);
    for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) {
      streakByUser.set(s.user_id, s.active_streak_count ?? 0);
    }
  }

  return filtered.map((ev) => {
    const md = ev.metadata ?? {};
    const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
    const profile = profileMap.get(ev.user_id);
    const displayName = profile?.display_name ?? profile?.username ?? "Someone";
    const username = profile?.username ?? "?";
    const challengeName =
      typeof md.challenge_name === "string" && md.challenge_name.trim() ? md.challenge_name : ch?.title ?? "Challenge";
    const durationDays = typeof md.duration_days === "number" ? md.duration_days : ch?.duration_days ?? 14;
    const activeKey = ev.challenge_id ? `${ev.user_id}:${ev.challenge_id}` : "";
    const active = ev.challenge_id ? activeMap.get(activeKey) : undefined;
    const currentDay = typeof md.day_number === "number" ? md.day_number : active?.current_day ?? 1;
    const isCompletedChallenge = ev.event_type === "completed_challenge";
    const hasProof = Boolean(md.photo_url) || Boolean(md.proof_photo_url) || md.has_photo === true;
    const stat = reactionStats.get(ev.id);
    const mdStreak = typeof md.streak_count === "number" ? md.streak_count : null;
    const visibility = normalizeChallengeVisibility(ch?.visibility);
    return {
      id: ev.id,
      userId: ev.user_id,
      username,
      displayName,
      avatarUrl: profile?.avatar_url ?? null,
      streakCount: mdStreak ?? streakByUser.get(ev.user_id) ?? 0,
      challengeId: ev.challenge_id,
      challengeName,
      taskName: typeof md.task_name === "string" ? md.task_name : null,
      currentDay: Math.max(1, currentDay),
      totalDays: Math.max(1, durationDays),
      eventType: ev.event_type,
      isCompleted: isCompletedChallenge,
      hasProof: hasProof && !isCompletedChallenge,
      photoUrl: typeof md.photo_url === "string" ? md.photo_url : null,
      proofPhotoUrl: typeof md.proof_photo_url === "string" ? md.proof_photo_url : null,
      verified:
        Boolean(md.photo_url) ||
        Boolean(md.proof_photo_url) ||
        md.verification_method === "strava_activity" ||
        md.heart_rate_verified === true,
      caption:
        typeof md.note_text === "string" ? md.note_text : typeof md.caption === "string" ? md.caption : null,
      createdAt: ev.created_at,
      respectCount: stat?.count ?? 0,
      reactedByMe: stat?.reactedByMe ?? false,
      commentCount: commentCounts.get(ev.id) ?? 0,
      visibility,
    };
  });
}

export const feedRouter = createTRPCRouter({
  getLiveFeed: protectedProcedure
    .input(
      z.object({
        scope: z.enum(["following", "everyone"]),
        limit: z.number().min(1).max(30).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const viewerId = ctx.userId;

      const dayAgo = new Date(Date.now() - 86400000).toISOString();
      const { data: recentMovers } = await server
        .from("activity_events")
        .select("user_id")
        .gte("created_at", dayAgo);
      const movingUserCount = new Set((recentMovers ?? []).map((r: { user_id: string }) => r.user_id)).size;

      const followingIds = new Set<string>();
      const { data: follows } = await ctx.supabase.from("user_follows").select("following_id, status").eq("follower_id", viewerId);
      for (const r of (follows ?? []) as { following_id: string; status?: string | null }[]) {
        if (followRowAccepted(r)) followingIds.add(r.following_id);
      }

      const { data: rawEvents, error: evErr } = await server
        .from("activity_events")
        .select("id, user_id, event_type, challenge_id, metadata, created_at")
        .in("event_type", [...LIVE_FEED_TYPES])
        .order("created_at", { ascending: false })
        .limit(150);
      if (evErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: evErr.message });
      }

      const events = (rawEvents ?? []) as EvRow[];

      const challengeIds = [...new Set(events.map((e) => e.challenge_id).filter((id): id is string => !!id))];
      const challengeMap = new Map<string, { id: string; title?: string; visibility?: string; duration_days?: number }>();
      if (challengeIds.length) {
        const { data: chs } = await server.from("challenges").select("id, title, visibility, duration_days").in("id", challengeIds);
        for (const c of (chs ?? []) as { id: string; title?: string; visibility?: string; duration_days?: number }[]) {
          challengeMap.set(c.id, c);
        }
      }

      const passesVisibility = (ev: EvRow, vis: "public" | "friends" | "private"): boolean => {
        if (vis === "private" && ev.user_id !== viewerId) return false;
        if (vis === "friends" && ev.user_id !== viewerId && !followingIds.has(ev.user_id)) return false;
        return true;
      };

      const preFiltered: EvRow[] = [];
      for (const ev of events) {
        if (preFiltered.length >= input.limit) break;
        if (input.scope === "following" && ev.user_id !== viewerId && !followingIds.has(ev.user_id)) continue;
        const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
        if (ev.challenge_id && !ch) continue;
        const vis = normalizeChallengeVisibility(ch?.visibility);
        if (!passesVisibility(ev, vis)) continue;
        preFiltered.push(ev);
      }

      const posts = await hydrateActivityEventsToPosts(preFiltered, viewerId, followingIds, ctx, server);

      return { movingCount: movingUserCount, posts };
    }),

  getUserPosts: protectedProcedure
    .input(z.object({ userId: z.string().uuid(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const viewerId = ctx.userId;
      const server = getSupabaseServer() ?? ctx.supabase;

      const { data: targetRow, error: pErr } = await server
        .from("profiles")
        .select("user_id, profile_visibility")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (pErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: pErr.message });
      }
      if (!targetRow) return { posts: [] as Awaited<ReturnType<typeof hydrateActivityEventsToPosts>> };

      const profileVis = String((targetRow as { profile_visibility?: string }).profile_visibility ?? "public").toLowerCase();
      let canSee = input.userId === viewerId;
      if (!canSee && (profileVis === "private" || profileVis === "friends")) {
        const { data: row } = await ctx.supabase
          .from("user_follows")
          .select("status")
          .eq("follower_id", viewerId)
          .eq("following_id", input.userId)
          .maybeSingle();
        canSee = Boolean(row && followRowAccepted(row as { status?: string | null }));
      }

      if (!canSee) return { posts: [] as Awaited<ReturnType<typeof hydrateActivityEventsToPosts>> };

      const followingIds = new Set<string>();
      const { data: follows } = await ctx.supabase.from("user_follows").select("following_id, status").eq("follower_id", viewerId);
      for (const r of (follows ?? []) as { following_id: string; status?: string | null }[]) {
        if (followRowAccepted(r)) followingIds.add(r.following_id);
      }

      const { data: rawEvents, error: evErr } = await server
        .from("activity_events")
        .select("id, user_id, event_type, challenge_id, metadata, created_at")
        .eq("user_id", input.userId)
        .in("event_type", [...LIVE_FEED_TYPES])
        .order("created_at", { ascending: false })
        .limit(Math.min(80, input.limit * 3));
      if (evErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: evErr.message });
      }

      const events = (rawEvents ?? []) as EvRow[];
      const posts = await hydrateActivityEventsToPosts(events, viewerId, followingIds, ctx, server);
      return { posts: posts.slice(0, input.limit) };
    }),

  /** Single feed post by activity_events id (for post thread / deep links). */
  getPost: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const viewerId = ctx.userId;

      type EvRow = {
        id: string;
        user_id: string;
        event_type: string;
        challenge_id: string | null;
        metadata: Record<string, unknown>;
        created_at: string;
      };

      const { data: raw, error: evErr } = await server
        .from("activity_events")
        .select("id, user_id, event_type, challenge_id, metadata, created_at")
        .eq("id", input.eventId)
        .maybeSingle();
      if (evErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: evErr.message });
      }
      if (!raw) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      const ev = raw as EvRow;
      if (!LIVE_FEED_TYPES.includes(ev.event_type as (typeof LIVE_FEED_TYPES)[number])) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const followingIds = new Set<string>();
      const { data: follows } = await ctx.supabase.from("user_follows").select("following_id, status").eq("follower_id", viewerId);
      for (const r of (follows ?? []) as { following_id: string; status?: string | null }[]) {
        if (followRowAccepted(r)) followingIds.add(r.following_id);
      }

      const challengeIds = ev.challenge_id ? [ev.challenge_id] : [];
      const userIds = [ev.user_id];

      const [chRes, acRes, profRes] = await Promise.all([
        challengeIds.length
          ? server.from("challenges").select("id, title, visibility, duration_days").in("id", challengeIds)
          : Promise.resolve({ data: [] as { id: string; title?: string; visibility?: string; duration_days?: number }[] }),
        challengeIds.length
          ? server
              .from("active_challenges")
              .select("user_id, challenge_id, current_day, status")
              .in("challenge_id", challengeIds)
              .eq("status", "active")
          : Promise.resolve({ data: [] as { user_id: string; challenge_id: string; current_day?: number }[] }),
        userIds.length
          ? server.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", userIds)
          : Promise.resolve({ data: [] as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null }[] }),
      ]);

      const challenges = (chRes as { data: unknown }).data as { id: string; title?: string; visibility?: string; duration_days?: number }[];
      const activeRows = (acRes as { data: unknown }).data as { user_id: string; challenge_id: string; current_day?: number }[];
      const profiles = (profRes as { data: unknown }).data as {
        user_id: string;
        display_name?: string;
        username?: string;
        avatar_url?: string | null;
      }[];

      const challengeMap = new Map(challenges.map((c) => [c.id, c]));
      const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
      const activeMap = new Map<string, { current_day: number }>();
      for (const row of activeRows) {
        activeMap.set(`${row.user_id}:${row.challenge_id}`, { current_day: row.current_day ?? 1 });
      }

      const passesVisibility = (e: EvRow, vis: "public" | "friends" | "private"): boolean => {
        if (vis === "private" && e.user_id !== viewerId) return false;
        if (vis === "friends" && e.user_id !== viewerId && !followingIds.has(e.user_id)) return false;
        return true;
      };

      const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
      if (ev.challenge_id && !ch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      const vis = normalizeChallengeVisibility(ch?.visibility);
      if (!passesVisibility(ev, vis)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can't view this post" });
      }

      const { data: reactions } = await ctx.supabase
        .from("feed_reactions")
        .select("event_id, user_id")
        .eq("event_id", ev.id);
      let reactionCount = 0;
      let reactedByMe = false;
      for (const row of (reactions ?? []) as { event_id: string; user_id: string }[]) {
        reactionCount += 1;
        if (row.user_id === viewerId) reactedByMe = true;
      }

      const { count: commentTotal, error: cErr } = await ctx.supabase
        .from("feed_comments")
        .select("id", { count: "exact", head: true })
        .eq("event_id", ev.id);
      if (cErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: cErr.message });
      }

      const { data: streakRow } = await server.from("streaks").select("active_streak_count").eq("user_id", ev.user_id).maybeSingle();
      const streakFromDb = (streakRow as { active_streak_count?: number } | null)?.active_streak_count ?? 0;

      const md = ev.metadata ?? {};
      const profile = profileMap.get(ev.user_id);
      const displayName = profile?.display_name ?? profile?.username ?? "Someone";
      const username = profile?.username ?? "?";
      const challengeName =
        typeof md.challenge_name === "string" && md.challenge_name.trim()
          ? md.challenge_name
          : ch?.title ?? "Challenge";
      const durationDays = typeof md.duration_days === "number" ? md.duration_days : ch?.duration_days ?? 14;
      const activeKey = ev.challenge_id ? `${ev.user_id}:${ev.challenge_id}` : "";
      const active = ev.challenge_id ? activeMap.get(activeKey) : undefined;
      const currentDay = typeof md.day_number === "number" ? md.day_number : active?.current_day ?? 1;
      const isCompletedChallenge = ev.event_type === "completed_challenge";
      const hasProof =
        Boolean(md.photo_url) || Boolean(md.proof_photo_url) || md.has_photo === true;
      const mdStreak = typeof md.streak_count === "number" ? md.streak_count : null;

      return {
        id: ev.id,
        userId: ev.user_id,
        username,
        displayName,
        avatarUrl: profile?.avatar_url ?? null,
        streakCount: mdStreak ?? streakFromDb,
        challengeId: ev.challenge_id,
        challengeName,
        currentDay: Math.max(1, currentDay),
        totalDays: Math.max(1, durationDays),
        eventType: ev.event_type,
        isCompleted: isCompletedChallenge,
        hasProof: hasProof && !isCompletedChallenge,
        photoUrl: typeof md.photo_url === "string" ? md.photo_url : null,
        proofPhotoUrl: typeof md.proof_photo_url === "string" ? md.proof_photo_url : null,
        verified:
          Boolean(md.photo_url) ||
          Boolean(md.proof_photo_url) ||
          md.verification_method === "strava_activity" ||
          md.heart_rate_verified === true,
        caption:
          typeof md.note_text === "string"
            ? md.note_text
            : typeof md.caption === "string"
              ? md.caption
              : null,
        createdAt: ev.created_at,
        respectCount: reactionCount,
        reactedByMe,
        commentCount: commentTotal ?? 0,
        visibility: vis,
      };
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const visibleUserIds = await getVisibleUserIds(ctx.supabase, ctx.userId);

      let query = ctx.supabase
        .from("activity_events")
        .select("id, user_id, event_type, challenge_id, metadata, created_at")
        .in("user_id", visibleUserIds)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      const { data: events, error } = await query;
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const items = events ?? [];
      const userIds = [...new Set(items.map((e: { user_id: string }) => e.user_id))];
      let profileMap = new Map<string, { display_name?: string | null; username?: string | null; avatar_url?: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await ctx.supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url")
          .in("user_id", userIds);
        profileMap = new Map(
          (profiles ?? []).map((p: { user_id: string; display_name?: string | null; username?: string | null; avatar_url?: string | null }) => [
            p.user_id,
            { display_name: p.display_name, username: p.username, avatar_url: p.avatar_url },
          ])
        );
      }

      const withProfiles = items.map((e: { id: string; user_id: string; event_type: string; challenge_id?: string | null; metadata?: Record<string, unknown>; created_at: string }) => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          user_id: e.user_id,
          event_type: e.event_type,
          challenge_id: e.challenge_id ?? null,
          metadata: e.metadata ?? {},
          created_at: e.created_at,
          display_name: profile?.display_name ?? profile?.username ?? "Someone",
          username: profile?.username ?? "?",
          avatar_url: profile?.avatar_url ?? null,
        };
      });
      const eventIds = items.map((e) => e.id);
      const reactionStats = new Map<string, { count: number; reactedByMe: boolean }>();
      const commentCounts = new Map<string, number>();
      if (eventIds.length > 0) {
        const { data: reactions } = await ctx.supabase
          .from("feed_reactions")
          .select("event_id, user_id")
          .in("event_id", eventIds);
        for (const row of (reactions ?? []) as { event_id: string; user_id: string }[]) {
          const prev = reactionStats.get(row.event_id) ?? { count: 0, reactedByMe: false };
          reactionStats.set(row.event_id, {
            count: prev.count + 1,
            reactedByMe: prev.reactedByMe || row.user_id === ctx.userId,
          });
        }
        const { data: comments } = await ctx.supabase
          .from("feed_comments")
          .select("event_id")
          .in("event_id", eventIds);
        for (const row of (comments ?? []) as { event_id: string }[]) {
          commentCounts.set(row.event_id, (commentCounts.get(row.event_id) ?? 0) + 1);
        }
      }
      const withReactions = withProfiles.map((item) => {
        const stat = reactionStats.get(item.id);
        return {
          ...item,
          reaction_count: stat?.count ?? 0,
          reacted_by_me: stat?.reactedByMe ?? false,
          comment_count: commentCounts.get(item.id) ?? 0,
        };
      });

      const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
      return {
        items: withReactions,
        nextCursor: items.length === input.limit && lastItem ? lastItem.created_at : null,
      };
    }),
  listMine: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("activity_events")
        .select("id, event_type, challenge_id, metadata, created_at")
        .eq("user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      const { data: events, error } = await query;
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const items = (events ?? []) as {
        id: string;
        event_type: string;
        challenge_id: string | null;
        metadata?: Record<string, unknown>;
        created_at: string;
      }[];
      const challengeIds = [...new Set(items.map((e) => e.challenge_id).filter((id): id is string => !!id))];
      let challengeMap = new Map<string, { title: string; category: string | null }>();
      if (challengeIds.length > 0) {
        const { data: challenges } = await ctx.supabase
          .from("challenges")
          .select("id, title, category")
          .in("id", challengeIds);
        challengeMap = new Map(
          (challenges ?? []).map((c: { id: string; title?: string | null; category?: string | null }) => [
            c.id,
            { title: c.title ?? "Challenge", category: c.category ?? null },
          ])
        );
      }

      const out = items.map((event) => {
        const metadata = event.metadata ?? {};
        const challenge = event.challenge_id ? challengeMap.get(event.challenge_id) : undefined;
        const streakCount = Number((metadata as Record<string, unknown>).streak_count ?? 0);
        const isMilestone = event.event_type === "streak_milestone";
        const fallbackTask =
          event.event_type === "completed_task"
            ? "Task completed"
            : event.event_type === "challenge_joined"
              ? "Challenge joined"
              : "Activity";
        return {
          id: event.id,
          type: isMilestone ? "milestone" : "activity",
          eventType: event.event_type,
          challengeId: event.challenge_id ?? null,
          taskName: String((metadata as Record<string, unknown>).task_name ?? fallbackTask),
          challengeTitle: challenge?.title ?? String((metadata as Record<string, unknown>).challenge_name ?? "Challenge"),
          challengeCategory: challenge?.category ?? String((metadata as Record<string, unknown>).challenge_category ?? "discipline"),
          completedAt: event.created_at,
          hasProof: Boolean((metadata as Record<string, unknown>).has_photo) || Boolean((metadata as Record<string, unknown>).photo_url),
          proofUrl: ((metadata as Record<string, unknown>).photo_url as string | undefined) ?? undefined,
          milestoneTitle: isMilestone ? `${Math.max(0, streakCount)}-day streak!` : null,
          milestoneSubtitle: isMilestone ? "You've been consistent. Keep it up." : null,
        };
      });

      const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
      return {
        items: out,
        nextCursor: items.length === input.limit && lastItem ? lastItem.created_at : null,
      };
    }),
  getMySummary: protectedProcedure.query(async ({ ctx }) => {
    const [completedTasksResult, streakResult, activeChallengesResult] = await Promise.all([
      ctx.supabase
        .from("activity_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("event_type", "completed_task"),
      ctx.supabase
        .from("streaks")
        .select("active_streak_count")
        .eq("user_id", ctx.userId)
        .maybeSingle(),
      ctx.supabase
        .from("active_challenges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("status", "active"),
    ]);

    return {
      totalTasksCompleted: completedTasksResult.count ?? 0,
      currentStreak: (streakResult.data as { active_streak_count?: number } | null)?.active_streak_count ?? 0,
      activeChallenges: activeChallengesResult.count ?? 0,
    };
  }),

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
          const { data: evRow } = await srv.from("activity_events").select("user_id").eq("id", input.eventId).maybeSingle();
          const ownerId = (evRow as { user_id?: string } | null)?.user_id;
          if (ownerId && ownerId !== ctx.userId) {
            const anySrv = srv as unknown as {
              from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { message?: string } | null }> };
            };
            const { error: nErr } = await anySrv.from("in_app_notifications").insert({
              user_id: ownerId,
              type: "respect",
              read: false,
              actor_id: ctx.userId,
              metadata: { event_id: input.eventId },
            });
            if (nErr) console.error("[feed.react] in_app_notifications insert:", nErr);
          }
        }
      }

      return { success: true as const, reacted, reactionCount: count ?? 0 };
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
        const { data: evRow } = await srv.from("activity_events").select("user_id").eq("id", input.eventId).maybeSingle();
        const ownerId = (evRow as { user_id?: string } | null)?.user_id;
        if (ownerId && ownerId !== ctx.userId) {
          const anySrv = srv as unknown as {
            from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { message?: string } | null }> };
          };
          const { error: nErr } = await anySrv.from("in_app_notifications").insert({
            user_id: ownerId,
            type: "comment",
            read: false,
            actor_id: ctx.userId,
            metadata: { event_id: input.eventId, comment_text: input.text.trim().slice(0, 200) },
          });
          if (nErr) console.error("[feed.comment] in_app_notifications insert:", nErr);
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

  /** Attach caption to the latest task_completed activity event (feed). Uses service role for update. */
  shareCompletion: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        caption: z.string().max(500).optional(),
        proofPhotoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const server = getSupabaseServer();
      if (!server) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Sharing is temporarily unavailable." });
      }
      const { data: ev, error: qErr } = await server
        .from("activity_events")
        .select("id, metadata")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("event_type", "task_completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (qErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: qErr.message });
      }
      if (!ev) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nothing to share yet." });
      }
      const prev = (ev as { metadata?: Record<string, unknown> }).metadata ?? {};
      const nextMeta = {
        ...prev,
        caption: input.caption?.trim() || null,
        proof_photo_url: input.proofPhotoUrl?.trim() || null,
        feed_shared: true,
      };
      const sb = server as unknown as {
        from: (t: string) => {
          update: (row: { metadata: Record<string, unknown> }) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
        };
      };
      const { error: uErr } = await sb.from("activity_events").update({ metadata: nextMeta }).eq("id", (ev as { id: string }).id);
      if (uErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: uErr.message });
      }
      return { ok: true as const };
    }),
});
