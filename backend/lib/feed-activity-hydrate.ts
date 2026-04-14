import type { SupabaseClient } from "@supabase/supabase-js";
import type { Context } from "../trpc/create-context";

export const LIVE_FEED_TYPES = ["task_completed", "completed_challenge", "joined_challenge", "secured_day"] as const;

export function normalizeChallengeVisibility(raw: string | null | undefined): "public" | "friends" | "private" {
  const s = (raw ?? "public").toLowerCase();
  if (s === "private") return "private";
  if (s === "friends") return "friends";
  return "public";
}

export type EvRow = {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function followRowAccepted(row: { status?: string | null }): boolean {
  const s = String(row.status ?? "accepted").toLowerCase();
  return s === "accepted";
}

export async function hydrateActivityEventsToPosts(
  events: EvRow[],
  viewerId: string,
  followingIds: Set<string>,
  ctx: Context,
  server: SupabaseClient
): Promise<
  {
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
    lastReactorName: string | null;
    commentCount: number;
    visibility: "public" | "friends" | "private";
  }[]
> {
  if (events.length === 0) return [];
  const challengeIds = [...new Set(events.map((e) => e.challenge_id).filter((id): id is string => !!id))];
  const userIds = [...new Set(events.map((e) => e.user_id))];
  const [chRes, acRes, profRes] = await Promise.all([
    challengeIds.length
      ? server.from("challenges").select("id, title, visibility, duration_days").in("id", challengeIds)
      : Promise.resolve({ data: [] as { id: string; title?: string; visibility?: string; duration_days?: number }[] }),
    challengeIds.length
      ? server.from("active_challenges").select("user_id, challenge_id, current_day, status").in("challenge_id", challengeIds).eq("status", "active")
      : Promise.resolve({ data: [] as { user_id: string; challenge_id: string; current_day?: number }[] }),
    userIds.length
      ? server.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", userIds)
      : Promise.resolve({ data: [] as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null }[] }),
  ]);
  const challenges = (chRes as { data: unknown }).data as { id: string; title?: string; visibility?: string; duration_days?: number }[];
  const activeRows = (acRes as { data: unknown }).data as { user_id: string; challenge_id: string; current_day?: number }[];
  const profiles = (profRes as { data: unknown }).data as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null }[];
  const challengeMap = new Map(challenges.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
  const activeMap = new Map<string, { current_day: number }>();
  for (const row of activeRows) activeMap.set(`${row.user_id}:${row.challenge_id}`, { current_day: row.current_day ?? 1 });
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
  const reactionStats = new Map<string, { count: number; reactedByMe: boolean; lastReactorId: string | null }>();
  const commentCounts = new Map<string, number>();
  if (eventIds.length > 0) {
    const { data: reactions } = await ctx.supabase
      .from("feed_reactions")
      .select("event_id, user_id, created_at")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });
    for (const row of (reactions ?? []) as { event_id: string; user_id: string }[]) {
      const prev = reactionStats.get(row.event_id) ?? { count: 0, reactedByMe: false, lastReactorId: null as string | null };
      reactionStats.set(row.event_id, {
        count: prev.count + 1,
        reactedByMe: prev.reactedByMe || row.user_id === viewerId,
        lastReactorId: prev.lastReactorId ?? row.user_id,
      });
    }
    const { data: comments } = await ctx.supabase.from("feed_comments").select("event_id").in("event_id", eventIds);
    for (const row of (comments ?? []) as { event_id: string }[]) commentCounts.set(row.event_id, (commentCounts.get(row.event_id) ?? 0) + 1);
  }
  const reactorIds = new Set<string>();
  for (const [, stat] of reactionStats) {
    if (stat.lastReactorId && !profileMap.has(stat.lastReactorId)) {
      reactorIds.add(stat.lastReactorId);
    }
  }
  if (reactorIds.size > 0) {
    const { data: reactorProfiles } = await server
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", [...reactorIds]);
    for (const p of (reactorProfiles ?? []) as { user_id: string; display_name?: string | null; username?: string | null; avatar_url?: string | null }[]) {
      profileMap.set(p.user_id, {
        user_id: p.user_id,
        display_name: p.display_name ?? undefined,
        username: p.username ?? undefined,
        avatar_url: p.avatar_url ?? null,
      });
    }
  }
  const streakByUser = new Map<string, number>();
  if (userIds.length > 0) {
    const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", userIds);
    for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) streakByUser.set(s.user_id, s.active_streak_count ?? 0);
  }
  return filtered.map((ev) => {
    const md = ev.metadata ?? {};
    const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
    const profile = profileMap.get(ev.user_id);
    const displayName = profile?.display_name ?? profile?.username ?? "Someone";
    const username = profile?.username ?? "?";
    const challengeName = typeof md.challenge_name === "string" && md.challenge_name.trim() ? md.challenge_name : ch?.title ?? "Challenge";
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
      verified: Boolean(md.photo_url) || Boolean(md.proof_photo_url) || md.verification_method === "strava_activity" || md.heart_rate_verified === true,
      caption: typeof md.note_text === "string" ? md.note_text : typeof md.caption === "string" ? md.caption : null,
      createdAt: ev.created_at,
      respectCount: stat?.count ?? 0,
      reactedByMe: stat?.reactedByMe ?? false,
      lastReactorName: stat?.lastReactorId
        ? (profileMap.get(stat.lastReactorId)?.display_name ?? profileMap.get(stat.lastReactorId)?.username ?? null)
        : null,
      commentCount: commentCounts.get(ev.id) ?? 0,
      visibility,
    };
  });
}
