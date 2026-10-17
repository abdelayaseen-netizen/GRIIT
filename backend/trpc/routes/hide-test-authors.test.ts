import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));

const VIEWER = "11111111-1111-4111-8111-111111111111";
const REAL = "22222222-2222-4222-8222-222222222222";
const TEST = "33333333-3333-4333-8333-333333333333";
const TEST_VIEWER = "44444444-4444-4444-8444-444444444444";
const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: null;
  is_test: boolean;
  profile_visibility: string;
  timezone: string;
  total_days_secured: number;
  created_at: string;
};

const profiles: Profile[] = [
  { user_id: VIEWER, username: "viewer", display_name: "Viewer", avatar_url: null, is_test: false, profile_visibility: "public", timezone: "UTC", total_days_secured: 1, created_at: "2026-01-01T00:00:00Z" },
  { user_id: REAL, username: "real", display_name: "Real", avatar_url: null, is_test: false, profile_visibility: "public", timezone: "UTC", total_days_secured: 2, created_at: "2026-01-02T00:00:00Z" },
  { user_id: TEST, username: "puresoul", display_name: "Pure Soul", avatar_url: null, is_test: true, profile_visibility: "public", timezone: "UTC", total_days_secured: 9, created_at: "2026-01-03T00:00:00Z" },
  { user_id: TEST_VIEWER, username: "comp", display_name: "Comp", avatar_url: null, is_test: true, profile_visibility: "public", timezone: "UTC", total_days_secured: 0, created_at: "2026-01-04T00:00:00Z" },
];

type Eq = Record<string, unknown>;
type Inn = Record<string, unknown[]>;

type Follow = { follower_id: string; following_id: string; status: string };

const mutualFollows: Follow[] = [
  { follower_id: VIEWER, following_id: REAL, status: "accepted" },
  { follower_id: REAL, following_id: VIEWER, status: "accepted" },
  { follower_id: VIEWER, following_id: TEST, status: "accepted" },
  { follower_id: TEST, following_id: VIEWER, status: "accepted" },
  { follower_id: TEST_VIEWER, following_id: TEST, status: "accepted" },
  { follower_id: TEST, following_id: TEST_VIEWER, status: "accepted" },
];

function rowsFor(table: string, eq: Eq, inn: Inn, neq: Eq, follows: Follow[]): unknown[] {
  if (table === "profiles") {
    return profiles.filter((p) => {
      if (eq.user_id != null && p.user_id !== eq.user_id) return false;
      if (Array.isArray(inn.user_id) && !inn.user_id.includes(p.user_id)) return false;
      if (eq.is_test === false && p.is_test !== false) return false;
      if (neq.user_id != null && p.user_id === neq.user_id) return false;
      if (Array.isArray(inn.profile_visibility) && !inn.profile_visibility.includes(p.profile_visibility)) return false;
      return true;
    });
  }
  if (table === "day_secures") {
    const rows = [
      { user_id: VIEWER, date_key: "2026-10-04" },
      { user_id: REAL, date_key: "2026-10-04" },
      { user_id: TEST, date_key: "2026-10-04" },
      { user_id: TEST, date_key: "2026-10-03" },
      { user_id: TEST, date_key: "2026-10-02" },
    ];
    return rows.filter((r) => !Array.isArray(inn.user_id) || inn.user_id.includes(r.user_id));
  }
  if (table === "user_follows") {
    return follows.filter((f) => {
      if (eq.follower_id != null && f.follower_id !== eq.follower_id) return false;
      if (eq.following_id != null && f.following_id !== eq.following_id) return false;
      return true;
    });
  }
  if (table === "challenges") {
    const rows = [{ id: CH, title: "Crew", visibility: "public" }];
    return rows.filter((c) => eq.id == null || c.id === eq.id);
  }
  if (table === "active_challenges") {
    const rows = [
      { user_id: VIEWER, challenge_id: CH, status: "active", board_opt_in: true, start_at: "2026-10-01T00:00:00Z" },
      { user_id: TEST, challenge_id: CH, status: "active", board_opt_in: true, start_at: "2026-10-01T00:00:00Z" },
      { user_id: TEST_VIEWER, challenge_id: CH, status: "active", board_opt_in: true, start_at: "2026-10-01T00:00:00Z" },
    ];
    return rows.filter((r) => {
      if (eq.challenge_id != null && r.challenge_id !== eq.challenge_id) return false;
      if (eq.status != null && r.status !== eq.status) return false;
      if (eq.user_id != null && r.user_id !== eq.user_id) return false;
      return true;
    });
  }
  if (table === "streaks") {
    return profiles
      .filter((p) => !Array.isArray(inn.user_id) || inn.user_id.includes(p.user_id))
      .map((p) => ({ user_id: p.user_id, active_streak_count: 1 }));
  }
  return [];
}

function client(follows: Follow[] = mutualFollows) {
  return {
    from(table: string) {
      const eq: Eq = {};
      const inn: Inn = {};
      const neq: Eq = {};
      const pack = (single: boolean) => {
        const data = rowsFor(table, eq, inn, neq, follows);
        return { data: single ? (data[0] ?? null) : data, error: null };
      };
      const b: Record<string, unknown> = {
        select: () => b,
        eq: (col: string, val: unknown) => {
          eq[col] = val;
          return b;
        },
        neq: (col: string, val: unknown) => {
          neq[col] = val;
          return b;
        },
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

function caller(userId: string, follows: Follow[] = mutualFollows) {
  const c = createTestCaller({ userId, supabase: client(follows), req: {} as Request });
  if (!c) throw new Error("createCaller missing");
  return c as unknown as {
    profiles: { suggested: (i?: { limit?: number }) => Promise<{ user_id: string }[]> };
    leaderboard: {
      getWeekly: (i?: { limit?: number }) => Promise<{ entries: { userId: string }[] }>;
      getFriendsBoard: () => Promise<{ entries: { userId: string }[] }>;
      getChallengeBoard: (i: { challengeId: string }) => Promise<{ entries: { userId: string }[] }>;
    };
  };
}

describe("test authors stay off real viewers' surfaces", () => {
  it("Discover People hides a test account from a real viewer and shows it to a test viewer", async () => {
    const real = await caller(VIEWER, []).profiles.suggested({ limit: 10 });
    expect(real.map((p) => p.user_id)).toContain(REAL);
    expect(real.map((p) => p.user_id)).not.toContain(TEST);
    expect(real.map((p) => p.user_id)).not.toContain(VIEWER);

    const testViewer = await caller(TEST_VIEWER, []).profiles.suggested({ limit: 10 });
    expect(testViewer.map((p) => p.user_id)).toContain(TEST);
  });

  it("the global leaderboard hides a test account from a real viewer", async () => {
    const real = await caller(VIEWER).leaderboard.getWeekly({ limit: 20 });
    const ids = real.entries.map((e) => e.userId);
    expect(ids).toContain(REAL);
    expect(ids).not.toContain(TEST);

    const testViewer = await caller(TEST_VIEWER).leaderboard.getWeekly({ limit: 20 });
    expect(testViewer.entries.map((e) => e.userId)).toContain(TEST);
  });

  it("the friends leaderboard hides a test friend from a real viewer", async () => {
    const real = await caller(VIEWER).leaderboard.getFriendsBoard();
    const ids = real.entries.map((e) => e.userId);
    expect(ids).toContain(VIEWER);
    expect(ids).toContain(REAL);
    expect(ids).not.toContain(TEST);

    const testViewer = await caller(TEST_VIEWER).leaderboard.getFriendsBoard();
    expect(testViewer.entries.map((e) => e.userId)).toContain(TEST);
  });

  it("the challenge leaderboard hides a test member from a real viewer", async () => {
    const real = await caller(VIEWER).leaderboard.getChallengeBoard({ challengeId: CH });
    const ids = real.entries.map((e) => e.userId);
    expect(ids).toContain(VIEWER);
    expect(ids).not.toContain(TEST);

    const testViewer = await caller(TEST_VIEWER).leaderboard.getChallengeBoard({ challengeId: CH });
    expect(testViewer.entries.map((e) => e.userId)).toContain(TEST);
  });
});

type FeedEvent = {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  share_state?: string;
};

function feedClient() {
  const events: FeedEvent[] = [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      user_id: REAL,
      event_type: "task_completed",
      challenge_id: CH,
      metadata: {},
      created_at: "2026-10-04T12:00:00.000Z",
      share_state: "shared",
    },
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      user_id: TEST,
      event_type: "task_completed",
      challenge_id: CH,
      metadata: {},
      created_at: "2026-10-04T11:00:00.000Z",
      share_state: "shared",
    },
  ];
  return {
    from(table: string) {
      const eq: Eq = {};
      const inn: Inn = {};
      let limitN = 0;
      const pack = () => {
        if (table === "activity_events") {
          if (limitN === 500) return { data: [], error: null };
          return { data: events, error: null };
        }
        if (table === "challenges") return { data: [{ id: CH, title: "Crew", visibility: "public", duration_days: 14 }], error: null };
        if (table === "profiles") return { data: rowsFor("profiles", eq, inn, {}, []), error: null };
        return { data: [], error: null };
      };
      const b: Record<string, unknown> = {
        select: () => b,
        eq: (col: string, val: unknown) => {
          eq[col] = val;
          return b;
        },
        in: (col: string, val: unknown[]) => {
          inn[col] = val;
          return b;
        },
        neq: () => b,
        gte: () => b,
        lte: () => b,
        gt: () => b,
        lt: () => b,
        order: () => b,
        or: () => b,
        limit: (n: number) => {
          limitN = n;
          return b;
        },
        maybeSingle: () => Promise.resolve({ data: (pack().data as unknown[])[0] ?? null, error: null }),
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
          Promise.resolve(pack()).then(onFulfilled, onRejected),
      };
      return b;
    },
  };
}

describe("the feed hides test authors from a real viewer", () => {
  it("keeps a real post and drops a test post, unless the viewer is a test account", async () => {
    const realCaller = createTestCaller({ userId: VIEWER, supabase: feedClient(), req: {} as Request }) as unknown as {
      feed: { getLiveFeed: (i: { scope: "everyone"; limit: number }) => Promise<{ posts: { userId: string }[] }> };
    };
    const real = await realCaller.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(real.posts.map((p) => p.userId)).toContain(REAL);
    expect(real.posts.map((p) => p.userId)).not.toContain(TEST);

    const testCaller = createTestCaller({
      userId: TEST_VIEWER,
      supabase: feedClient(),
      req: {} as Request,
    }) as unknown as {
      feed: { getLiveFeed: (i: { scope: "everyone"; limit: number }) => Promise<{ posts: { userId: string }[] }> };
    };
    const testView = await testCaller.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(testView.posts.map((p) => p.userId)).toContain(TEST);
    expect(testView.posts.map((p) => p.userId)).toContain(REAL);
  });
});
