import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));

/**
 * Build 90 08 (board_opt_in): an invite-only challenge (`visibility = PRIVATE`, the wizard's
 * default, "Only people with your link can join") is a board of its members. Seen live: the
 * creator's board said "A board needs two." after a friend joined through the link, because
 * getChallengeBoard treated PRIVATE as "show only the viewer".
 */
const CREATOR = "11111111-1111-4111-8111-111111111111";
const FRIEND = "22222222-2222-4222-8222-222222222222";
const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

type Eq = Record<string, unknown>;
type Inn = Record<string, unknown[]>;

const profiles = [
  { user_id: CREATOR, username: "maker", display_name: "Maker", avatar_url: null, is_test: false, profile_visibility: "public", timezone: "UTC", total_days_secured: 1, created_at: "2026-01-01T00:00:00Z" },
  { user_id: FRIEND, username: "pal", display_name: "Pal", avatar_url: null, is_test: false, profile_visibility: "private", timezone: "UTC", total_days_secured: 0, created_at: "2026-01-02T00:00:00Z" },
];

function rowsFor(table: string, eq: Eq, inn: Inn): unknown[] {
  if (table === "profiles") {
    return profiles.filter((p) => {
      if (eq.user_id != null && p.user_id !== eq.user_id) return false;
      if (Array.isArray(inn.user_id) && !inn.user_id.includes(p.user_id)) return false;
      return true;
    });
  }
  if (table === "challenges") {
    return [{ id: CH, title: "Friend loop walk", visibility: "PRIVATE" }].filter((c) => eq.id == null || c.id === eq.id);
  }
  if (table === "active_challenges") {
    return [
      { user_id: CREATOR, challenge_id: CH, status: "active", board_opt_in: true, start_at: "2026-10-01T00:00:00Z" },
      { user_id: FRIEND, challenge_id: CH, status: "active", board_opt_in: true, start_at: "2026-10-17T00:00:00Z" },
    ].filter((r) => {
      if (eq.challenge_id != null && r.challenge_id !== eq.challenge_id) return false;
      if (eq.status != null && r.status !== eq.status) return false;
      if (eq.user_id != null && r.user_id !== eq.user_id) return false;
      return true;
    });
  }
  if (table === "day_secures") {
    return [{ user_id: CREATOR, date_key: "2026-10-17" }].filter(
      (r) => !Array.isArray(inn.user_id) || inn.user_id.includes(r.user_id),
    );
  }
  if (table === "streaks") {
    return profiles
      .filter((p) => !Array.isArray(inn.user_id) || inn.user_id.includes(p.user_id))
      .map((p) => ({ user_id: p.user_id, active_streak_count: 1 }));
  }
  return [];
}

function client() {
  return {
    from(table: string) {
      const eq: Eq = {};
      const inn: Inn = {};
      const pack = (single: boolean) => {
        const data = rowsFor(table, eq, inn);
        return { data: single ? (data[0] ?? null) : data, error: null };
      };
      const b: Record<string, unknown> = {
        select: () => b,
        eq: (col: string, val: unknown) => {
          eq[col] = val;
          return b;
        },
        neq: () => b,
        in: (col: string, val: unknown[]) => {
          inn[col] = val;
          return b;
        },
        gte: () => b,
        lte: () => b,
        gt: () => b,
        lt: () => b,
        order: () => b,
        limit: () => b,
        or: () => b,
        maybeSingle: () => Promise.resolve(pack(true)),
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
          Promise.resolve(pack(false)).then(onFulfilled, onRejected),
      };
      return b;
    },
  };
}

function caller(userId: string) {
  const c = createTestCaller({ userId, supabase: client(), req: {} as Request });
  if (!c) throw new Error("createCaller missing");
  return c as unknown as {
    leaderboard: {
      getChallengeBoard: (i: { challengeId: string; scope?: "friends" | "everyone" }) => Promise<{
        entries: { userId: string }[];
        viewerOptedIn?: boolean;
      }>;
    };
  };
}

describe("getChallengeBoard on an invite-only challenge (08)", () => {
  it("lists every opted-in member for the creator, including a friend with a private profile", async () => {
    const board = await caller(CREATOR).leaderboard.getChallengeBoard({ challengeId: CH });
    const ids = board.entries.map((e) => e.userId);
    expect(ids).toContain(CREATOR);
    expect(ids).toContain(FRIEND);
    expect(ids).toHaveLength(2);
  });
  it("lists both for the friend who joined through the link", async () => {
    const board = await caller(FRIEND).leaderboard.getChallengeBoard({ challengeId: CH });
    const ids = board.entries.map((e) => e.userId);
    expect(ids).toContain(CREATOR);
    expect(ids).toContain(FRIEND);
  });
  it("the friends scope still needs a mutual follow", async () => {
    const board = await caller(CREATOR).leaderboard.getChallengeBoard({ challengeId: CH, scope: "friends" });
    expect(board.entries.map((e) => e.userId)).toEqual([CREATOR]);
  });
});
