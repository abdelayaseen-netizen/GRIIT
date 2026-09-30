import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

type Follow = { follower_id: string; following_id: string; status: string };
type Member = { user_id: string; challenge_id: string; status: string };
type EventRow = {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  share_state?: string;
  shared?: boolean;
};

function feedClient(opts: {
  events: EventRow[];
  follows: Follow[];
  visibility: "PUBLIC" | "FRIENDS" | "PRIVATE";
  members?: Member[];
}) {
  const challenges = [{ id: CH, title: "Run", visibility: opts.visibility, duration_days: 14, creator_id: B }];
    const profiles = [
    { user_id: A, profile_visibility: "public", display_name: "A", username: "a" },
    { user_id: B, profile_visibility: "public", display_name: "B", username: "b" },
    { user_id: C, profile_visibility: "public", display_name: "C", username: "c" },
  ];
  return {
    from(table: string) {
      const filters: Record<string, string> = {};
      let limitN = 0;
      const exec = () => {
        if (table === "activity_events") {
          if (limitN === 500) return { data: [], error: null };
          let rows = opts.events;
          if (filters.user_id) rows = rows.filter((e) => e.user_id === filters.user_id);
          if (filters.id) rows = rows.filter((e) => e.id === filters.id);
          if (filters.share_state) rows = rows.filter((e) => (e.share_state ?? "shared") === filters.share_state);
          return { data: rows, error: null };
        }
        if (table === "challenge_members" || table === "active_challenges") {
          const rows = (opts.members ?? []).filter((m) => {
            if (filters.user_id && m.user_id !== filters.user_id) return false;
            if (filters.challenge_id && m.challenge_id !== filters.challenge_id) return false;
            return true;
          });
          return { data: rows, error: null };
        }
        if (table === "user_follows") {
          const rows = opts.follows.filter((f) => {
            if (filters.follower_id && f.follower_id !== filters.follower_id) return false;
            if (filters.following_id && f.following_id !== filters.following_id) return false;
            return true;
          });
          return { data: rows, error: null };
        }
        if (table === "challenges") return { data: challenges, error: null };
        if (table === "profiles") {
          const rows = filters.user_id ? profiles.filter((p) => p.user_id === filters.user_id) : profiles;
          return { data: rows, error: null };
        }
        return { data: [], error: null };
      };
      const result = () => Promise.resolve(exec());
      const b: Record<string, unknown> = {
        select: () => b,
        eq: (col: string, val: string) => {
          filters[col] = val;
          return b;
        },
        in: () => b,
        gte: () => b,
        lt: () => b,
        lte: () => b,
        order: () => b,
        or: () => b,
        neq: () => b,
        limit: (n: number) => {
          limitN = n;
          return b;
        },
        maybeSingle: () => result().then((r) => ({ data: (r.data as unknown[])[0] ?? null, error: null })),
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => result().then(onFulfilled, onRejected),
      };
      return b;
    },
  };
}

type FeedCaller = {
  feed: {
    getLiveFeed: (i: { scope: "following" | "everyone"; limit?: number }) => Promise<{ posts: { id: string; userId: string }[] }>;
    getPost: (i: { eventId: string }) => Promise<{ id: string; userId: string }>;
  };
};

function caller(userId: string, supabase: unknown): FeedCaller {
  const c = createTestCaller({ userId, supabase, req: {} as Request });
  if (!c) throw new Error("createCaller missing");
  return c as unknown as FeedCaller;
}

function event(authorId: string): EventRow {
  return {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    user_id: authorId,
    event_type: "task_completed",
    challenge_id: CH,
    metadata: {},
    created_at: new Date().toISOString(),
    share_state: "shared",
  };
}

const oneWay: Follow[] = [{ follower_id: A, following_id: B, status: "accepted" }];
const mutual: Follow[] = [
  { follower_id: A, following_id: B, status: "accepted" },
  { follower_id: B, following_id: A, status: "accepted" },
];

describe("friends-only posts require a mutual follow", () => {
  it("A follows B only → A cannot see B's friends-only post", async () => {
    const c = caller(A, feedClient({ events: [event(B)], follows: oneWay, visibility: "FRIENDS" }));
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.id)).toEqual([]);
    await expect(c.feed.getPost({ eventId: event(B).id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("A and B follow each other → A can see B's friends-only post", async () => {
    const c = caller(A, feedClient({ events: [event(B)], follows: mutual, visibility: "FRIENDS" }));
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.userId)).toEqual([B]);
    const post = await c.feed.getPost({ eventId: event(B).id });
    expect(post.userId).toBe(B);
  });

  it("the owner always sees their friends-only post", async () => {
    const c = caller(B, feedClient({ events: [event(B)], follows: [], visibility: "FRIENDS" }));
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.userId)).toEqual([B]);
    const post = await c.feed.getPost({ eventId: event(B).id });
    expect(post.userId).toBe(B);
  });

  it("leaves a public post visible when the follow is one-way", async () => {
    const c = caller(A, feedClient({ events: [event(B)], follows: oneWay, visibility: "PUBLIC" }));
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.userId)).toEqual([B]);
    const post = await c.feed.getPost({ eventId: event(B).id });
    expect(post.userId).toBe(B);
  });

  it("keeps a private post owner-only even when the follow is mutual", async () => {
    const c = caller(A, feedClient({ events: [event(B)], follows: mutual, visibility: "PRIVATE" }));
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts).toEqual([]);
    await expect(c.feed.getPost({ eventId: event(B).id })).rejects.toMatchObject({ code: "FORBIDDEN" });

    const owner = caller(B, feedClient({ events: [event(B)], follows: mutual, visibility: "PRIVATE" }));
    const own = await owner.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(own.posts.map((p) => p.userId)).toEqual([B]);
  });
});

const groupMembers = [
  { user_id: A, challenge_id: CH, status: "active" },
  { user_id: B, challenge_id: CH, status: "active" },
];

describe("group co-members see shared challenge posts", () => {
  it("A and B in the same group, no follows → A sees B's shared post, not an unshared one", async () => {
    const shared = event(B);
    const unshared: EventRow = {
      ...shared,
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      share_state: "kept",
      shared: false,
    };
    const c = caller(
      A,
      feedClient({ events: [shared, unshared], follows: [], visibility: "FRIENDS", members: groupMembers }),
    );
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.id)).toEqual([shared.id]);
    expect((await c.feed.getPost({ eventId: shared.id })).userId).toBe(B);
    await expect(c.feed.getPost({ eventId: unshared.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("a co-member still sees a PRIVATE group post", async () => {
    const c = caller(
      A,
      feedClient({ events: [event(B)], follows: [], visibility: "PRIVATE", members: groupMembers }),
    );
    const live = await c.feed.getLiveFeed({ scope: "everyone", limit: 20 });
    expect(live.posts.map((p) => p.userId)).toEqual([B]);
  });

  it("C not in the group, no follows → cannot see FRIENDS or PRIVATE", async () => {
    for (const visibility of ["FRIENDS", "PRIVATE"] as const) {
      const c = caller(
        C,
        feedClient({ events: [event(B)], follows: [], visibility, members: groupMembers }),
      );
      expect((await c.feed.getLiveFeed({ scope: "everyone", limit: 20 })).posts).toEqual([]);
      await expect(c.feed.getPost({ eventId: event(B).id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });

  it("mutual friends still see a FRIENDS post they did not join", async () => {
    const c = caller(A, feedClient({ events: [event(B)], follows: mutual, visibility: "FRIENDS", members: [] }));
    expect((await c.feed.getLiveFeed({ scope: "everyone", limit: 20 })).posts.map((p) => p.userId)).toEqual([B]);
  });

  it("PRIVATE solo challenge with no membership stays owner-only", async () => {
    const stranger = caller(A, feedClient({ events: [event(B)], follows: mutual, visibility: "PRIVATE", members: [] }));
    expect((await stranger.feed.getLiveFeed({ scope: "everyone", limit: 20 })).posts).toEqual([]);
    const owner = caller(B, feedClient({ events: [event(B)], follows: [], visibility: "PRIVATE", members: [] }));
    expect((await owner.feed.getLiveFeed({ scope: "everyone", limit: 20 })).posts.map((p) => p.userId)).toEqual([B]);
  });
});
