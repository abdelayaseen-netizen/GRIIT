import * as z from "zod";
import { publicProcedure } from "../create-context";
import { requireNoError } from "../errors";
import type { ChallengeWithTasksRow } from "../../types/db";
import {
  type ChallengeTaskRowRaw,
  mapTaskRowsToApi,
} from "../../lib/challenge-tasks";
import { filterOnboardingStarterPack } from "../../lib/onboarding-starter-pack";
import { deriveProofType } from "../../lib/task-model";
import { getSupabaseServer } from "../../lib/supabase-server";
import { getCached, setCached } from "../../lib/cache";
import { escapeLikeWildcards } from "../../lib/sanitize-search";
import { RETENTION_CONFIG } from "../../../lib/retention-config";
import { filterDiscoverCatalog } from "../../lib/discover-catalog";
import { anonymousUserIdSet } from "../../lib/anonymous-authors";
import { getSupabaseAdmin, hasSupabaseAdmin } from "../../lib/supabase-admin";
import { mutualFriendIds } from "../../lib/is-friend";
import {
  DISCOVER_V43_CATEGORY_IDS,
  DISCOVER_V43_CHALLENGE_SELECT,
  matchesDiscoverV43Category,
  rankChallengeIdsByJoins,
  weekAgoIso,
} from "../../lib/discover-v43";

/** Discover v3 category chips → DB `challenges.category` values. */
const DISCOVER_CATEGORY_VALUES = ["all", "body", "mind", "faith", "focus"] as const;
type DiscoverCategory = (typeof DISCOVER_CATEGORY_VALUES)[number];
const DiscoverCategoryEnum = z.enum(DISCOVER_CATEGORY_VALUES);

/**
 * Map a Discover chip to the underlying DB category. Some apps store legacy
 * names ("fitness", "discipline"); we accept either the chip name or the
 * legacy DB name during lookup.
 */
function dbCategoriesForChip(chip: DiscoverCategory): string[] {
  switch (chip) {
    case "body":
      return ["body", "fitness"];
    case "mind":
      return ["mind"];
    case "faith":
      return ["faith"];
    case "focus":
      return ["focus", "discipline"];
    default:
      return [];
  }
}

type ProofType = "photo" | "self_reported";

type DiscoverDifficulty = "EASY" | "MED" | "HARD";

function toDiscoverDifficulty(d: string | null | undefined): DiscoverDifficulty {
  const x = String(d ?? "medium").toLowerCase();
  if (x === "easy") return "EASY";
  if (x === "hard" || x === "extreme") return "HARD";
  return "MED";
}

type DiscoverCategoryOut = "body" | "mind" | "faith" | "focus";

function toDiscoverCategory(cat: string | null | undefined): DiscoverCategoryOut {
  const x = String(cat ?? "").toLowerCase();
  if (x === "body" || x === "fitness") return "body";
  if (x === "mind") return "mind";
  if (x === "faith") return "faith";
  return "focus";
}

function isTeamRow(row: { participation_type?: string | null }): boolean {
  const pt = String(row.participation_type ?? "").toLowerCase();
  return pt === "duo" || pt === "team" || pt === "shared_goal";
}

/** Ensure 24h challenges have ends_at for frontend countdown (derive from live_date if missing). */
function with24hEndsAt<T extends { duration_type?: string; ends_at?: string | null; live_date?: string | null }>(row: T): T {
  if (row.duration_type !== "24h") return row;
  if (row.ends_at) return row;
  if (!row.live_date) return row;
  const start = new Date(row.live_date).getTime();
  if (Number.isNaN(start)) return row;
  return { ...row, ends_at: new Date(start + 24 * 60 * 60 * 1000).toISOString() };
}

export const challengesDiscoverProcedures = {
  getDiscoverFeed: publicProcedure.query(async ({ ctx }) => {
    const server = getSupabaseServer() ?? ctx.supabase;

    let q = server
      .from("challenges")
      .select(
        "id, title, description, metadata, duration_days, difficulty, category, status, visibility, is_featured, participants_count, created_at, creator_id, source_starter_id, duration_type, ends_at, live_date, participation_type, team_size, challenge_tasks (id, title, task_type, order_index, config)",
        { count: "exact" }
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    q = q.eq("visibility", "PUBLIC").neq("visibility", "PRIVATE");

    const { data: chRowsRaw, error } = await q;
    requireNoError(error, "Failed to load discover challenges.");
    const chRows = filterDiscoverCatalog(
      (chRowsRaw ?? []).filter(
        (c: { visibility?: string | null }) => String(c.visibility ?? "").toUpperCase() !== "PRIVATE"
      ),
      ctx.userId,
    );

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayStartIso = dayStart.toISOString();

    const challengeIds = (chRows ?? []).map((c: { id: string }) => c.id);
    if (challengeIds.length === 0) {
      return { challenges: [] };
    }

    const { data: joinWeek } = await server
      .from("active_challenges")
      .select("challenge_id")
      .in("challenge_id", challengeIds)
      .gte("created_at", weekAgo)
      .limit(500);

    const { data: joinToday } = await server
      .from("active_challenges")
      .select("challenge_id")
      .in("challenge_id", challengeIds)
      .gte("created_at", dayStartIso)
      .limit(500);

    const recent7 = new Map<string, number>();
    for (const r of joinWeek ?? []) {
      const id = (r as { challenge_id: string }).challenge_id;
      recent7.set(id, (recent7.get(id) ?? 0) + 1);
    }
    const todayMap = new Map<string, number>();
    for (const r of joinToday ?? []) {
      const id = (r as { challenge_id: string }).challenge_id;
      todayMap.set(id, (todayMap.get(id) ?? 0) + 1);
    }

    const teamChallengeIds = (chRows ?? [])
      .filter((c: { participation_type?: string | null }) => {
        const pt = String(c.participation_type ?? "").toLowerCase();
        return pt === "duo" || pt === "team" || pt === "shared_goal";
      })
      .map((c: { id: string }) => c.id);

    const previewByChallenge = new Map<string, { user_id: string; username: string | null; avatar_url: string | null }[]>();

    if (teamChallengeIds.length > 0) {
      const { data: acPart } = await server
        .from("active_challenges")
        .select("challenge_id, user_id")
        .in("challenge_id", teamChallengeIds)
        .eq("status", "active")
        .limit(50);

      const userIds = [...new Set((acPart ?? []).map((r: { user_id: string }) => r.user_id))];
      const { data: profs } =
        userIds.length > 0
          ? await server.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds).limit(50)
          : { data: [] as { user_id: string; username: string | null; avatar_url: string | null }[] };
      const profMap = new Map((profs ?? []).map((p) => [p.user_id, p]));

      for (const cid of teamChallengeIds) {
        const rows = (acPart ?? []).filter((r: { challenge_id: string }) => r.challenge_id === cid);
        const seen = new Set<string>();
        const out: { user_id: string; username: string | null; avatar_url: string | null }[] = [];
        for (const r of rows) {
          const uid = (r as { user_id: string }).user_id;
          if (seen.has(uid)) continue;
          seen.add(uid);
          const p = profMap.get(uid);
          out.push({
            user_id: uid,
            username: p?.username ?? null,
            avatar_url: p?.avatar_url ?? null,
          });
          if (out.length >= 3) break;
        }
        if (out.length > 0) previewByChallenge.set(cid, out);
      }
    }

    const items = (chRows ?? []).map((challenge: ChallengeWithTasksRow) => {
      const meta = (challenge as { metadata?: Record<string, unknown> }).metadata;
      const short_hook = typeof meta?.short_hook === "string" ? meta.short_hook : null;
      const normalized = with24hEndsAt(
        challenge as { duration_type?: string; ends_at?: string | null; live_date?: string | null } & ChallengeWithTasksRow
      );
      const id = normalized.id;
      return {
        ...normalized,
        short_hook,
        tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
        recent_joins_7d: recent7.get(id) ?? 0,
        joins_today: todayMap.get(id) ?? 0,
        team_preview: previewByChallenge.get(id) ?? [],
      };
    });

    return { challenges: items };
  }),

  /**
   * Discover v3 — single featured hero challenge.
   *
   * Selection: trending-this-week (highest 24h join count) → fallback to most popular
   * public challenge → fallback to most recently created. Optionally filtered by
   * the Discover category chip.
   *
   * Covers never come from check-ins, activity_events, or participant proofs.
   * `featuredProof` is always null; the client uses the challenge cover field
   * or generated fallback art. `friendsStarted` is social proof (names only).
   */
  getDiscoverFeatured: publicProcedure
    .input(z.object({ category: DiscoverCategoryEnum.optional() }).optional())
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const chip: DiscoverCategory = input?.category ?? "all";

      let baseQuery = server
        .from("challenges")
        .select(
          // challenges.cover_url does not exist in prod — client uses generated covers.
          "id, title, duration_days, difficulty, category, status, visibility, participants_count, created_at, creator_id, participation_type, challenge_tasks (id, title, task_type, order_index, config)"
        )
        .eq("status", "published")
        .eq("visibility", "PUBLIC")
        .order("created_at", { ascending: false })
        .limit(60);

      if (chip !== "all") {
        const dbCats = dbCategoriesForChip(chip);
        if (dbCats.length === 1) baseQuery = baseQuery.eq("category", dbCats[0]!);
        else if (dbCats.length > 1) baseQuery = baseQuery.in("category", dbCats);
      }

      const { data: chRows, error } = await baseQuery;
      requireNoError(error, "Failed to load featured challenge.");
      const candidates = filterDiscoverCatalog(
        (chRows ?? []) as (ChallengeWithTasksRow & {
          difficulty?: string | null;
          duration_days?: number;
          creator_id?: string | null;
        })[],
        ctx.userId,
      );
      if (candidates.length === 0) return null;

      const dayStart = new Date();
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayStartIso = dayStart.toISOString();

      const ids = candidates.map((c) => c.id);
      const { data: joinToday } = await server
        .from("active_challenges")
        .select("challenge_id, user_id")
        .in("challenge_id", ids)
        .gte("created_at", dayStartIso)
        .limit(500);
      const joinRows = (joinToday ?? []) as { challenge_id: string; user_id: string }[];
      const joinAnonIds = hasSupabaseAdmin()
        ? await anonymousUserIdSet(
            getSupabaseAdmin(),
            joinRows.map((r) => r.user_id),
          )
        : new Set<string>();
      const todayMap = new Map<string, number>();
      for (const r of joinRows) {
        if (joinAnonIds.has(r.user_id)) continue;
        todayMap.set(r.challenge_id, (todayMap.get(r.challenge_id) ?? 0) + 1);
      }

      const scored = [...candidates].sort((a, b) => {
        const aJoins = todayMap.get(a.id) ?? 0;
        const bJoins = todayMap.get(b.id) ?? 0;
        if (aJoins !== bJoins) return bJoins - aJoins;
        return (Number(b.participants_count) || 0) - (Number(a.participants_count) || 0);
      });
      const pick = scored[0];
      if (!pick) return null;

      const joinedTodayCount = todayMap.get(pick.id) ?? 0;

      let friendNames: string[] = [];
      let othersCount = joinedTodayCount;
      let circleCount = 0;
      if (ctx.userId) {
        const { data: follows } = await server
          .from("user_follows")
          .select("following_id, status")
          .eq("follower_id", ctx.userId)
          .limit(500);
        const followingIds = new Set<string>();
        for (const r of (follows ?? []) as { following_id: string; status?: string | null }[]) {
          const status = String(r.status ?? "accepted").toLowerCase();
          if (status === "accepted") followingIds.add(r.following_id);
        }
        if (followingIds.size > 0) {
          const { data: starters } = await server
            .from("active_challenges")
            .select("user_id")
            .eq("challenge_id", pick.id)
            .gte("created_at", dayStartIso)
            .in("user_id", [...followingIds])
            .limit(50);
          const friendIds = [
            ...new Set((starters ?? []).map((r: { user_id: string }) => r.user_id)),
          ];
          circleCount = friendIds.length;
          if (friendIds.length > 0) {
            const { data: friendProfs } = await server
              .from("profiles")
              .select("user_id, display_name, username")
              .in("user_id", friendIds)
              .limit(10);
            for (const p of (friendProfs ?? []) as {
              display_name?: string | null;
              username?: string | null;
            }[]) {
              const name = (p.display_name?.trim() || p.username?.trim() || "").trim();
              if (name && friendNames.length < 2) friendNames.push(name);
            }
            othersCount = Math.max(0, joinedTodayCount - friendNames.length);
          }
        }
      }

      return {
        id: pick.id,
        slug: null as string | null,
        name: pick.title ?? "Challenge",
        cover_url: null,
        duration_days: pick.duration_days ?? 7,
        difficulty: toDiscoverDifficulty(pick.difficulty),
        proof_type: deriveProofType(
          (pick.challenge_tasks ?? null) as ChallengeTaskRowRaw[] | null
        ),
        task_types: ((pick.challenge_tasks ?? []) as ChallengeTaskRowRaw[]).map(
          (t) => String(t.task_type ?? ""),
        ),
        category: toDiscoverCategory(pick.category),
        joinedTodayCount,
        circleCount,
        featuredProof: null,
        friendsStarted: {
          friend_names: friendNames,
          others_count: othersCount,
        },
      };
    }),

  /**
   * Discover v3 — Quick wins · 24 hours grid.
   *
   * Returns up to 4 challenges with `duration_days === 1`, sorted by today's
   * join count desc. Counts below `RETENTION_CONFIG.SOCIAL_PROOF_MIN_THRESHOLD`
   * are returned as zero so the frontend can fall back to the
   * "Be first today" empty state.
   */
  getDiscoverGrid: publicProcedure
    .input(z.object({ category: DiscoverCategoryEnum.optional() }).optional())
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const chip: DiscoverCategory = input?.category ?? "all";

      let q = server
        .from("challenges")
        .select(
          "id, title, duration_days, difficulty, category, status, visibility, participants_count, creator_id, participation_type, challenge_tasks (id, title, task_type, order_index, config)"
        )
        .eq("status", "published")
        .eq("visibility", "PUBLIC")
        .eq("duration_days", 1)
        .limit(40);

      if (chip !== "all") {
        const dbCats = dbCategoriesForChip(chip);
        if (dbCats.length === 1) q = q.eq("category", dbCats[0]!);
        else if (dbCats.length > 1) q = q.in("category", dbCats);
      }

      const { data: chRows, error } = await q;
      requireNoError(error, "Failed to load Quick wins challenges.");
      const candidates = filterDiscoverCatalog(
        (chRows ?? []) as (ChallengeWithTasksRow & {
          difficulty?: string | null;
          duration_days?: number;
          creator_id?: string | null;
        })[],
        ctx.userId,
      );
      if (candidates.length === 0) return [];

      const dayStart = new Date();
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayStartIso = dayStart.toISOString();
      const ids = candidates.map((c) => c.id);
      const { data: joinToday } = await server
        .from("active_challenges")
        .select("challenge_id")
        .in("challenge_id", ids)
        .gte("created_at", dayStartIso)
        .limit(500);
      const todayMap = new Map<string, number>();
      for (const r of joinToday ?? []) {
        const id = (r as { challenge_id: string }).challenge_id;
        todayMap.set(id, (todayMap.get(id) ?? 0) + 1);
      }

      const sorted = [...candidates].sort(
        (a, b) => (todayMap.get(b.id) ?? 0) - (todayMap.get(a.id) ?? 0)
      );
      return sorted.slice(0, 4).map((c) => {
        const raw = todayMap.get(c.id) ?? 0;
        const joinedTodayCount =
          raw >= RETENTION_CONFIG.SOCIAL_PROOF_MIN_THRESHOLD ? raw : 0;
        return {
          id: c.id,
          slug: null as string | null,
          name: c.title ?? "Challenge",
          duration_days: c.duration_days ?? 1,
          difficulty: toDiscoverDifficulty(c.difficulty),
          proof_type: deriveProofType(
            (c.challenge_tasks ?? null) as ChallengeTaskRowRaw[] | null
          ),
          category: toDiscoverCategory(c.category),
          joinedTodayCount,
        };
      });
    }),

  /**
   * Discover v3 — Build a habit list.
   *
   * Up to 4 multi-day (`duration_days >= 2`) challenges. Composition: if a
   * team challenge with available spots exists, place it first; remaining
   * slots are filled with solo challenges sorted by total participants desc.
   */
  getDiscoverHabits: publicProcedure
    .input(z.object({ category: DiscoverCategoryEnum.optional() }).optional())
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const chip: DiscoverCategory = input?.category ?? "all";

      let q = server
        .from("challenges")
        .select(
          "id, title, duration_days, difficulty, category, status, visibility, participants_count, creator_id, participation_type, team_size, challenge_tasks (id, title, task_type, order_index, config)"
        )
        .eq("status", "published")
        .eq("visibility", "PUBLIC")
        .gte("duration_days", 2)
        .limit(80);

      if (chip !== "all") {
        const dbCats = dbCategoriesForChip(chip);
        if (dbCats.length === 1) q = q.eq("category", dbCats[0]!);
        else if (dbCats.length > 1) q = q.in("category", dbCats);
      }

      const { data: chRows, error } = await q;
      requireNoError(error, "Failed to load Build a habit challenges.");
      const all = filterDiscoverCatalog(
        (chRows ?? []) as (ChallengeWithTasksRow & {
          difficulty?: string | null;
          duration_days?: number;
          creator_id?: string | null;
          team_size?: number | null;
        })[],
        ctx.userId,
      );
      if (all.length === 0) return [];

      const teamRows = all.filter(isTeamRow);
      const soloRows = all.filter((c) => !isTeamRow(c));

      const teamWithSpots = teamRows.find((c) => {
        const size = Number(c.team_size ?? 4);
        const filled = Number(c.participants_count ?? 0);
        return size > 0 && filled < size;
      });

      const sortedSolo = [...soloRows].sort(
        (a, b) => (Number(b.participants_count) || 0) - (Number(a.participants_count) || 0)
      );

      const teamPreviewByChallenge = new Map<
        string,
        { user_id: string; username: string | null; avatar_url: string | null }[]
      >();
      if (teamWithSpots) {
        const { data: members } = await server
          .from("active_challenges")
          .select("user_id")
          .eq("challenge_id", teamWithSpots.id)
          .eq("status", "active")
          .limit(20);
        const memberIds = [
          ...new Set((members ?? []).map((r: { user_id: string }) => r.user_id)),
        ].slice(0, 3);
        if (memberIds.length > 0) {
          const { data: profs } = await server
            .from("profiles")
            .select("user_id, username, avatar_url")
            .in("user_id", memberIds)
            .limit(10);
          teamPreviewByChallenge.set(
            teamWithSpots.id,
            (profs ?? []).map((p) => ({
              user_id: p.user_id,
              username: p.username ?? null,
              avatar_url: p.avatar_url ?? null,
            }))
          );
        }
      }

      const out: {
        id: string;
        slug: string | null;
        name: string;
        duration_days: number;
        difficulty: DiscoverDifficulty;
        proof_type: ProofType;
        category: DiscoverCategoryOut;
        is_team: boolean;
        team_size: number | null;
        filled_spots: number;
        team_preview: { user_id: string; username: string | null; avatar_url: string | null }[];
      }[] = [];

      const toShape = (
        c: ChallengeWithTasksRow & {
          difficulty?: string | null;
          duration_days?: number;
          team_size?: number | null;
        },
        is_team: boolean
      ) => ({
        id: c.id,
        slug: null as string | null,
        name: c.title ?? "Challenge",
        duration_days: c.duration_days ?? 7,
        difficulty: toDiscoverDifficulty(c.difficulty),
        proof_type: deriveProofType(
          (c.challenge_tasks ?? null) as ChallengeTaskRowRaw[] | null
        ),
        category: toDiscoverCategory(c.category),
        is_team,
        team_size: is_team ? Number(c.team_size ?? 4) : null,
        filled_spots: Number(c.participants_count ?? 0),
        team_preview: is_team ? teamPreviewByChallenge.get(c.id) ?? [] : [],
      });

      if (teamWithSpots) {
        out.push(toShape(teamWithSpots, true));
      }
      for (const c of sortedSolo) {
        if (out.length >= 4) break;
        out.push(toShape(c, false));
      }
      return out;
    }),

  /** Discover “Picked for you”: popular published solo challenges. */
  getRecommended: publicProcedure.query(async ({ ctx }) => {
    const server = getSupabaseServer() ?? ctx.supabase;
    // NOTE(v2): Personalize by user goals when goal data is available
    const { data: rows, error } = await server
      .from("challenges")
      // challenges.cover_url does not exist in prod — client uses generated covers.
      .select("id, title, duration_days, difficulty, category, participants_count, participation_type, visibility, status, creator_id")
      .eq("status", "published")
      .eq("visibility", "PUBLIC")
      .limit(60);
    requireNoError(error, "Failed to load recommendations.");

    const sorted = [...filterDiscoverCatalog(rows ?? [], ctx.userId)].sort(
      (a, b) => (Number(b.participants_count) || 0) - (Number(a.participants_count) || 0)
    );
    const solo = sorted.filter((c: { participation_type?: string | null }) => {
      const pt = String(c.participation_type ?? "").toLowerCase();
      return pt !== "duo" && pt !== "team" && pt !== "shared_goal";
    });
    const top = solo.slice(0, 5);
    if (top.length === 0) return { challenges: [] };

    const ids = top.map((c: { id: string }) => c.id);
    const { data: acPart } = await server
      .from("active_challenges")
      .select("challenge_id, user_id")
      .in("challenge_id", ids)
      .eq("status", "active")
      .limit(120);

    const byC = new Map<string, string[]>();
    for (const r of acPart ?? []) {
      const row = r as { challenge_id: string; user_id: string };
      const arr = byC.get(row.challenge_id) ?? [];
      if (arr.includes(row.user_id)) continue;
      if (arr.length >= 3) continue;
      arr.push(row.user_id);
      byC.set(row.challenge_id, arr);
    }

    const allU = [...new Set((acPart ?? []).map((r: { user_id: string }) => r.user_id))];
    const { data: profs } =
      allU.length > 0
        ? await server.from("profiles").select("user_id, username, avatar_url").in("user_id", allU).limit(50)
        : { data: [] as { user_id: string; username: string | null; avatar_url: string | null }[] };
    const profMap = new Map((profs ?? []).map((p) => [p.user_id, p]));

    function toDiff(d: string | null | undefined): "EASY" | "MED" | "HARD" {
      const x = String(d ?? "medium").toLowerCase();
      if (x === "easy") return "EASY";
      if (x === "hard" || x === "extreme") return "HARD";
      return "MED";
    }

    const challenges = top.map((c: Record<string, unknown>) => {
      const id = c.id as string;
      const pc = Number(c.participants_count) || 0;
      const previewUids = (byC.get(id) ?? []).slice(0, 3);
      const previewUsers = previewUids.map((uid) => {
        const pr = profMap.get(uid);
        return {
          user_id: uid,
          username: pr?.username ?? null,
          avatar_url: pr?.avatar_url ?? null,
        };
      });
      return {
        id,
        title: (c.title as string) ?? "Challenge",
        duration: (c.duration_days as number) ?? 7,
        difficulty: toDiff(c.difficulty as string | undefined),
        category: String(c.category ?? "discipline"),
        cover_url: null,
        participantCount: pc,
        previewUsers,
      };
    });

    return { challenges };
  }),

  getDiscoverHome: publicProcedure
    .input(
      z
        .object({
          q: z.string().max(100).optional(),
          category: z.enum(["all", ...DISCOVER_V43_CATEGORY_IDS] as [string, ...string[]]).optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const q = input?.q?.trim() ?? "";
      const category = (input?.category ?? "all").toLowerCase();
      const safeQ = q ? escapeLikeWildcards(q) : "";

      const applyFilters = <T extends { title?: string | null; category?: string | null }>(rows: T[]): T[] =>
        rows.filter((row) => {
          if (!matchesDiscoverV43Category(row.category, category)) return false;
          if (safeQ && !String(row.title ?? "").toLowerCase().includes(q.toLowerCase())) return false;
          return true;
        });

      type Row = {
        id: string;
        title?: string | null;
        duration_days?: number | null;
        category?: string | null;
        participants_count?: number | null;
        creator_id?: string | null;
        challenge_tasks?: unknown;
      };

      const toCard = (
        row: Row,
        extra: { creator_name?: string | null; friend_names?: string[]; joined_week?: number } = {},
      ) => ({
        id: row.id,
        title: row.title ?? "Challenge",
        duration_days: row.duration_days ?? 7,
        category: String(row.category ?? "").toLowerCase(),
        participants_count: Number(row.participants_count) || 0,
        proof_type: deriveProofType((row.challenge_tasks ?? []) as Parameters<typeof deriveProofType>[0]),
        creator_id: row.creator_id ?? null,
        creator_name: extra.creator_name ?? null,
        friend_names: extra.friend_names ?? [],
        joined_week: extra.joined_week ?? 0,
      });

      const { data: joinRows, error: joinErr } = await server
        .from("active_challenges")
        .select("challenge_id, created_at")
        .gte("created_at", weekAgoIso())
        .limit(2000);
      requireNoError(joinErr, "Failed to load weekly joins.");
      const joinCounts = new Map<string, number>();
      for (const r of (joinRows ?? []) as { challenge_id: string }[]) {
        joinCounts.set(r.challenge_id, (joinCounts.get(r.challenge_id) ?? 0) + 1);
      }
      const popularIds = rankChallengeIdsByJoins((joinRows ?? []) as { challenge_id: string }[]).slice(0, 20);

      const [{ data: popularRows, error: popErr }, { data: communityRows, error: newErr }] = await Promise.all([
        popularIds.length
          ? server.from("challenges").select(DISCOVER_V43_CHALLENGE_SELECT).in("id", popularIds).eq("status", "published").eq("visibility", "PUBLIC")
          : Promise.resolve({ data: [], error: null }),
        server
          .from("challenges")
          .select(DISCOVER_V43_CHALLENGE_SELECT)
          .eq("status", "published")
          .eq("visibility", "PUBLIC")
          .not("creator_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(40),
      ]);
      requireNoError(popErr, "Failed to load popular challenges.");
      requireNoError(newErr, "Failed to load community challenges.");

      const popularMap = new Map(((popularRows ?? []) as Row[]).map((r) => [r.id, r]));
      const popularThisWeek = applyFilters(
        popularIds.map((id) => popularMap.get(id)).filter((r): r is Row => Boolean(r)),
      )
        .slice(0, 8)
        .map((r) => toCard(r, { joined_week: joinCounts.get(r.id) ?? 0 }));

      const community = applyFilters((communityRows ?? []) as Row[]).slice(0, 12);
      const creatorIds = [...new Set(community.map((r) => r.creator_id).filter((id): id is string => Boolean(id)))];
      const { data: creators } = creatorIds.length
        ? await server.from("profiles").select("user_id, display_name, username").in("user_id", creatorIds).limit(50)
        : { data: [] as { user_id: string; display_name?: string | null; username?: string | null }[] };
      const creatorMap = new Map(
        (creators ?? []).map((p) => [
          p.user_id,
          (p.display_name ?? p.username ?? "").trim() || null,
        ]),
      );
      const newFromCommunity = community.map((r) =>
        toCard(r, { creator_name: r.creator_id ? creatorMap.get(r.creator_id) ?? null : null }),
      );

      let friendsDoing: ReturnType<typeof toCard>[] = [];
      if (ctx.userId) {
        const friends = await mutualFriendIds(ctx.supabase, ctx.userId);
        if (friends.size > 0) {
          const { data: friendAc } = await server
            .from("active_challenges")
            .select("challenge_id, user_id")
            .in("user_id", [...friends])
            .eq("status", "active")
            .limit(400);
          const byChallenge = new Map<string, string[]>();
          for (const r of (friendAc ?? []) as { challenge_id: string; user_id: string }[]) {
            const arr = byChallenge.get(r.challenge_id) ?? [];
            if (!arr.includes(r.user_id)) arr.push(r.user_id);
            byChallenge.set(r.challenge_id, arr);
          }
          const friendChallengeIds = [...byChallenge.keys()].slice(0, 20);
          if (friendChallengeIds.length > 0) {
            const { data: friendCh } = await server
              .from("challenges")
              .select(DISCOVER_V43_CHALLENGE_SELECT)
              .in("id", friendChallengeIds)
              .eq("status", "published")
              .eq("visibility", "PUBLIC");
            const friendIds = [...new Set([...byChallenge.values()].flat())];
            const { data: friendProfs } = friendIds.length
              ? await server.from("profiles").select("user_id, display_name, username").in("user_id", friendIds).limit(80)
              : { data: [] as { user_id: string; display_name?: string | null; username?: string | null }[] };
            const nameMap = new Map(
              (friendProfs ?? []).map((p) => [
                p.user_id,
                (p.display_name ?? p.username ?? "").trim() || "Friend",
              ]),
            );
            friendsDoing = applyFilters((friendCh ?? []) as Row[])
              .slice(0, 8)
              .map((r) =>
                toCard(r, {
                  friend_names: (byChallenge.get(r.id) ?? [])
                    .map((uid) => nameMap.get(uid))
                    .filter((n): n is string => Boolean(n)),
                }),
              );
          }
        }
      }

      let results: ReturnType<typeof toCard>[] = [];
      if (safeQ) {
        const { data: searchRows, error: searchErr } = await server
          .from("challenges")
          .select(DISCOVER_V43_CHALLENGE_SELECT)
          .eq("status", "published")
          .eq("visibility", "PUBLIC")
          .ilike("title", `%${safeQ}%`)
          .limit(40);
        requireNoError(searchErr, "Failed to search challenges.");
        results = applyFilters((searchRows ?? []) as Row[]).slice(0, 20).map((r) => toCard(r));
      }

      return { friendsDoing, popularThisWeek, newFromCommunity, results };
    }),

  /** Count published public challenges per Discover category label (includes Team = duo/team runs). */
  getCategoryCounts: publicProcedure.query(async ({ ctx }) => {
    const server = getSupabaseServer() ?? ctx.supabase;
    const { data, error } = await server
      .from("challenges")
      .select("category, participation_type, creator_id")
      .eq("status", "published")
      .eq("visibility", "PUBLIC")
      .limit(5000);
    requireNoError(error, "Failed to load category counts.");
    const catalogRows = filterDiscoverCatalog(data ?? [], ctx.userId);
    const counts: Record<string, number> = {
      Fitness: 0,
      Mind: 0,
      Discipline: 0,
      Faith: 0,
      Team: 0,
    };
    for (const row of catalogRows) {
      const r = row as { category?: string | null; participation_type?: string | null };
      const cat = String(r.category ?? "").toLowerCase();
      if (cat === "fitness") counts.Fitness = (counts.Fitness ?? 0) + 1;
      else if (cat === "mind") counts.Mind = (counts.Mind ?? 0) + 1;
      else if (cat === "discipline") counts.Discipline = (counts.Discipline ?? 0) + 1;
      else if (cat === "faith") counts.Faith = (counts.Faith ?? 0) + 1;
      const pt = String(r.participation_type ?? "").toLowerCase();
      if (pt === "duo" || pt === "team") counts.Team = (counts.Team ?? 0) + 1;
    }
    return counts;
  }),

  /** Curated list of starter-pack challenges (e.g. onboarding). Stable order. Requires challenges seeded with source_starter_id. */
  getFeatured: publicProcedure
    .input(z.object({
      search: z.string().max(100).optional(),
      category: z.string().max(50).optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;
      const noPagination = input?.cursor == null && input?.limit == null;
      const canFeatureCache =
        noPagination &&
        !input?.search?.trim() &&
        (!input?.category || input.category === "all");

      const cacheKey = `challenges:featured:v1:${ctx.userId ?? "anon"}`;
      if (canFeatureCache) {
        const cached = await getCached<unknown>(cacheKey);
        if (cached != null) return cached;
      }

      let query = ctx.supabase
        .from("challenges")
        .select(
          "id, title, description, metadata, duration_days, difficulty, category, status, visibility, is_featured, participants_count, created_at, creator_id, source_starter_id, duration_type, ends_at, live_date, participation_type, team_size, challenge_tasks (id, title, task_type, order_index, config)",
          { count: "exact" }
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      query = query.eq("visibility", "PUBLIC").neq("visibility", "PRIVATE");

      const search = input?.search?.trim();
      if (search) {
        const safeSearch = escapeLikeWildcards(search);
        if (safeSearch) query = query.ilike("title", `%${safeSearch}%`);
      }
      if (input?.category && input.category !== "all") {
        if (input.category === "team") {
          query = query.in("participation_type", ["duo", "team"]);
        } else {
          query = query.eq("category", input.category);
        }
      }

      const { data, error, count } = await query;
      requireNoError(error, "Failed to load featured challenges.");
      const catalog = filterDiscoverCatalog(
        (data ?? []) as (ChallengeWithTasksRow & { creator_id?: string | null })[],
        ctx.userId,
      );
      const items = catalog.map((challenge: ChallengeWithTasksRow) => {
        const meta = (challenge as { metadata?: Record<string, unknown> }).metadata;
        const short_hook = typeof meta?.short_hook === "string" ? meta.short_hook : null;
        const normalized = with24hEndsAt(challenge as { duration_type?: string; ends_at?: string | null; live_date?: string | null } & ChallengeWithTasksRow);
        return {
          ...normalized,
          short_hook,
          tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
        };
      });
      const nextOffset = safeOffset + items.length;
      const hasMore = count != null && nextOffset < count;
      const withCursor = { items, nextCursor: hasMore ? String(nextOffset) : undefined };
      if (canFeatureCache) {
        await setCached(cacheKey, items, 60);
      }
      return noPagination ? items : withCursor;
    }),

  /** Discover tab: all published public challenges with join stats + team avatar previews (service role when available). */
  getStarterPack: publicProcedure
    .query(async ({ ctx }) => {
      const { data: rows, error } = await ctx.supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          duration_days,
          category,
          visibility,
          status,
          is_hard_mode,
          participation_type,
          source_starter_id,
          creator_id,
          challenge_tasks (id, title, task_type, order_index, config)
        `)
        .eq('visibility', 'PUBLIC')
        .eq('status', 'published')
        .limit(50);

      requireNoError(error, "Failed to load starter pack.");
      const catalog = filterOnboardingStarterPack(
        (rows ?? []) as (ChallengeWithTasksRow & { creator_id?: string | null; source_starter_id?: string | null; duration_days?: number | null })[],
      );
      return catalog.map((c) => ({
        ...c,
        tasks: mapTaskRowsToApi((c.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
      }));
    }),

};
