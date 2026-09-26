import type { SupabaseClient } from "@supabase/supabase-js";
import type { Context } from "../trpc/create-context";
import { getTodayDateKey } from "./date-utils";
import { exclusiveEndDateKey } from "./record-days";
import { calendarDayFromStartAt, dateKeyFromIso } from "../../lib/home-day-total";
import { securedElapsed } from "../../lib/consistency";
import { dueKeysForRange } from "../../lib/profile-v2-record";

export const LIVE_FEED_TYPES = [
  "task_completed",
  "completed_challenge",
  "joined_challenge",
  "challenge_created",
  "secured_day",
] as const;

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
  shared?: boolean;
};

const START_PAIR_MS = 60_000;

/** One feed row when create + join for the same user/challenge land within 60s. Keep challenge_created. */
export function dedupePairedStartEvents(events: EvRow[]): EvRow[] {
  const created = events.filter((e) => e.event_type === "challenge_created" && e.challenge_id);
  const dropJoined = new Set<string>();
  for (const ev of events) {
    if (ev.event_type !== "joined_challenge" || !ev.challenge_id) continue;
    const t = Date.parse(ev.created_at);
    const pair = created.find(
      (c) =>
        c.user_id === ev.user_id &&
        c.challenge_id === ev.challenge_id &&
        Number.isFinite(t) &&
        Math.abs(Date.parse(c.created_at) - t) <= START_PAIR_MS,
    );
    if (pair) dropJoined.add(ev.id);
  }
  return events.filter((e) => !dropJoined.has(e.id));
}

export function followRowAccepted(row: { status?: string | null }): boolean {
  const s = String(row.status ?? "accepted").toLowerCase();
  return s === "accepted";
}

export function finishedSecuredDays(args: {
  startAt?: string | null;
  endAt?: string | null;
  endedAt?: string | null;
  status?: string;
  timeZone: string;
  todayKey: string;
  securedDateKeys: readonly string[];
}): number | undefined {
  if (!args.startAt) return undefined;
  const startDateKey = dateKeyFromIso(args.startAt, args.timeZone);
  const status = args.status && args.status.length > 0 ? args.status : "completed";
  const endDateKey = exclusiveEndDateKey(
    { status, end_at: args.endAt ?? args.startAt, ended_at: args.endedAt ?? null },
    startDateKey,
    args.timeZone,
  );
  const dueDayKeys = dueKeysForRange({ status, startDateKey, endDateKey }, args.todayKey);
  return securedElapsed({
    dueDayKeys,
    securedDateKeys: args.securedDateKeys,
    todayKey: args.todayKey,
  }).secured;
}

/** Calendar position from start_at — not current_day or metadata.day_number. */
export function feedEventCurrentDay(input: {
  startAt?: string | null;
  timeZone?: string;
  todayKey: string;
  durationDays?: number | null;
}): number {
  return calendarDayFromStartAt(
    input.startAt,
    input.timeZone ?? "UTC",
    input.todayKey,
    input.durationDays,
  );
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
    securedDays?: number;
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
      ? server.from("active_challenges").select("id, user_id, challenge_id, start_at, end_at, ended_at, status").in("challenge_id", challengeIds)
      : Promise.resolve({ data: [] as { id?: string; user_id: string; challenge_id: string; start_at?: string; end_at?: string; ended_at?: string | null; status?: string }[] }),
    userIds.length
      ? server.from("profiles").select("user_id, display_name, username, avatar_url, timezone").in("user_id", userIds)
      : Promise.resolve({ data: [] as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null; timezone?: string | null }[] }),
  ]);
  const challenges = (chRes as { data: unknown }).data as { id: string; title?: string; visibility?: string; duration_days?: number }[];
  const activeRows = (acRes as { data: unknown }).data as {
    id?: string;
    user_id: string;
    challenge_id: string;
    start_at?: string;
    end_at?: string;
    ended_at?: string | null;
    status?: string;
  }[];
  const profiles = (profRes as { data: unknown }).data as { user_id: string; display_name?: string; username?: string; avatar_url?: string | null; timezone?: string | null }[];
  const challengeMap = new Map(challenges.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
  type EnrollmentRow = (typeof activeRows)[number];
  const activeById = new Map<string, EnrollmentRow>();
  const activeMap = new Map<string, EnrollmentRow>();
  for (const row of activeRows) {
    if (row.id) activeById.set(row.id, row);
    activeMap.set(`${row.user_id}:${row.challenge_id}`, row);
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
  const visible = dedupePairedStartEvents(filtered);
  const eventIds = visible.map((e) => e.id);
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
  const securedTodayByUser = new Set<string>();
  const securedKeysByUser = new Map<string, string[]>();
  if (userIds.length > 0) {
    const todayKey = getTodayDateKey("UTC");
    const [{ data: streakRows }, { data: secureRows }, { data: allSecures }] = await Promise.all([
      server.from("streaks").select("user_id, active_streak_count").in("user_id", userIds),
      server.from("day_secures").select("user_id").in("user_id", userIds).eq("date_key", todayKey),
      server.from("day_secures").select("user_id, date_key").in("user_id", userIds),
    ]);
    for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) streakByUser.set(s.user_id, s.active_streak_count ?? 0);
    for (const row of (secureRows ?? []) as { user_id: string }[]) securedTodayByUser.add(row.user_id);
    for (const row of (allSecures ?? []) as { user_id: string; date_key: string }[]) {
      const list = securedKeysByUser.get(row.user_id) ?? [];
      list.push(row.date_key);
      securedKeysByUser.set(row.user_id, list);
    }
  }
  return visible.map((ev) => {
    const md = ev.metadata ?? {};
    const ch = ev.challenge_id ? challengeMap.get(ev.challenge_id) : undefined;
    const profile = profileMap.get(ev.user_id);
    const displayName = profile?.display_name ?? profile?.username ?? "Someone";
    const username = profile?.username ?? "?";
    const challengeName = typeof md.challenge_name === "string" && md.challenge_name.trim() ? md.challenge_name : ch?.title ?? "Challenge";
    const durationDays = typeof md.duration_days === "number" ? md.duration_days : ch?.duration_days ?? 14;
    const activeKey = ev.challenge_id ? `${ev.user_id}:${ev.challenge_id}` : "";
    const active = ev.challenge_id ? activeMap.get(activeKey) : undefined;
    const tz = profile?.timezone?.trim() || "UTC";
    const todayKey = dateKeyFromIso(ev.created_at, tz);
    const currentDay = feedEventCurrentDay({
      startAt: active?.start_at,
      timeZone: tz,
      todayKey,
      durationDays,
    });
    const isCompletedChallenge = ev.event_type === "completed_challenge";
    const enrollmentId = typeof md.active_challenge_id === "string" ? md.active_challenge_id : "";
    const enrollment = (enrollmentId ? activeById.get(enrollmentId) : undefined) ?? active;
    const securedDays = isCompletedChallenge
      ? finishedSecuredDays({
          startAt: enrollment?.start_at,
          endAt: enrollment?.end_at,
          endedAt: enrollment?.ended_at,
          status: enrollment?.status,
          timeZone: tz,
          todayKey,
          securedDateKeys: securedKeysByUser.get(ev.user_id) ?? [],
        })
      : undefined;
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
      securedDays,
      securedToday: securedTodayByUser.has(ev.user_id),
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
