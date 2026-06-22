import { describe, it, expect, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

// Keep feed queries in-memory: force server-role client to fall back to ctx.supabase.
vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const USER_C = "33333333-3333-4333-8333-333333333333";

type BlockingCaller = {
  profiles: {
    blockUser: (i: { userId: string }) => Promise<{ success: boolean }>;
    unblockUser: (i: { userId: string }) => Promise<{ success: boolean }>;
  };
  feed: {
    getLiveFeed: (i: { scope: "following" | "everyone"; limit?: number }) => Promise<{
      movingCount: number;
      posts: { id: string; userId: string }[];
    }>;
  };
};

function caller(userId: string, supabase: unknown): BlockingCaller | undefined {
  const c = createTestCaller({ userId, supabase, req: {} as Request });
  return c as unknown as BlockingCaller | undefined;
}

/** Two-eq delete chain: resolves after the second .eq, recording the pair. */
function twoEqDelete(onComplete: (rec: Record<string, string>) => void) {
  const rec: Record<string, string> = {};
  const chain = {
    eq: (col: string, val: string) => {
      rec[col] = val;
      if (Object.keys(rec).length >= 2) {
        onComplete(rec);
        return Promise.resolve({ error: null });
      }
      return chain;
    },
  };
  return chain;
}

function createBlockMock(opts: { insertError?: unknown } = {}) {
  const { insertError = null } = opts;
  const calls = {
    blockedInsert: 0,
    blockedDelete: 0,
    followDeletes: [] as { follower: string; following: string }[],
  };
  const client = {
    from: (table: string) => {
      if (table === "blocked_users") {
        return {
          insert: (_row: Record<string, unknown>) => {
            calls.blockedInsert += 1;
            return Promise.resolve({ error: insertError });
          },
          delete: () =>
            twoEqDelete(() => {
              calls.blockedDelete += 1;
            }),
        };
      }
      if (table === "user_follows") {
        return {
          delete: () =>
            twoEqDelete((rec) => {
              calls.followDeletes.push({
                follower: rec.follower_id ?? "",
                following: rec.following_id ?? "",
              });
            }),
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) };
    },
  };
  return { client, calls };
}

/** Minimal chainable mock for feed.getLiveFeed: every query terminates in .limit(). */
function createFeedMock(opts: {
  events: { id: string; user_id: string; event_type: string; challenge_id: string | null; metadata: Record<string, unknown>; created_at: string }[];
  blockRows: { blocker_id: string; blocked_id: string }[];
}) {
  const dataFor = (table: string, n: number) => {
    if (table === "activity_events") {
      if (n === 500) return { data: [], error: null }; // recentMovers
      return { data: opts.events, error: null }; // rawEvents
    }
    if (table === "blocked_users") return { data: opts.blockRows, error: null };
    return { data: [], error: null }; // user_follows, profiles, challenges
  };
  const makeBuilder = (table: string) => {
    const b: Record<string, unknown> = {
      select: () => b,
      gte: () => b,
      in: () => b,
      order: () => b,
      eq: () => b,
      or: () => b,
      limit: (n: number) => Promise.resolve(dataFor(table, n)),
    };
    return b;
  };
  return { from: (table: string) => makeBuilder(table) };
}

describe("profiles.blockUser", () => {
  it("inserts the block row and removes follows in both directions", async () => {
    const mock = createBlockMock();
    const c = caller(USER_A, mock.client);
    if (!c) return;

    const result = await c.profiles.blockUser({ userId: USER_B });

    expect(result.success).toBe(true);
    expect(mock.calls.blockedInsert).toBe(1);
    expect(mock.calls.followDeletes).toContainEqual({ follower: USER_A, following: USER_B });
    expect(mock.calls.followDeletes).toContainEqual({ follower: USER_B, following: USER_A });
  });

  it("is idempotent — a duplicate block (unique violation) does not throw", async () => {
    const mock = createBlockMock({ insertError: { code: "23505", message: "duplicate key" } });
    const c = caller(USER_A, mock.client);
    if (!c) return;

    const result = await c.profiles.blockUser({ userId: USER_B });
    expect(result.success).toBe(true);
  });

  it("rejects self-block with BAD_REQUEST", async () => {
    const mock = createBlockMock();
    const c = caller(USER_A, mock.client);
    if (!c) return;

    await expect(c.profiles.blockUser({ userId: USER_A })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "You cannot block yourself.",
    });
    expect(mock.calls.blockedInsert).toBe(0);
  });
});

describe("profiles.unblockUser", () => {
  it("deletes the block row", async () => {
    const mock = createBlockMock();
    const c = caller(USER_A, mock.client);
    if (!c) return;

    const result = await c.profiles.unblockUser({ userId: USER_B });
    expect(result.success).toBe(true);
    expect(mock.calls.blockedDelete).toBe(1);
  });
});

describe("feed.getLiveFeed block filtering", () => {
  it("excludes posts from a blocked author and from a user who blocked the viewer", async () => {
    // USER_A blocked USER_B; USER_C blocked USER_A. Both must be hidden from A.
    const now = new Date().toISOString();
    const supabase = createFeedMock({
      events: [
        { id: "ev-b", user_id: USER_B, event_type: "task_completed", challenge_id: null, metadata: {}, created_at: now },
        { id: "ev-c", user_id: USER_C, event_type: "task_completed", challenge_id: null, metadata: {}, created_at: now },
      ],
      blockRows: [
        { blocker_id: USER_A, blocked_id: USER_B },
        { blocker_id: USER_C, blocked_id: USER_A },
      ],
    });
    const c = caller(USER_A, supabase);
    if (!c) return;

    const result = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(result.posts).toEqual([]);
  });
});

describe("blocking auth", () => {
  it("rejects unauthenticated blockUser with UNAUTHORIZED", async () => {
    const mock = createBlockMock();
    const c = caller("", mock.client);
    if (!c) return;

    await expect(c.profiles.blockUser({ userId: USER_B })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
