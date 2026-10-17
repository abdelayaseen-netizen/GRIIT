/**
 * Build 90 05.3: notifications, comments and likes lists hide is_test accounts
 * from a real viewer. A test viewer still sees them.
 */
import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));

const VIEWER = "11111111-1111-4111-8111-111111111111";
const REAL = "22222222-2222-4222-8222-222222222222";
const TEST = "33333333-3333-4333-8333-333333333333";
const TEST_VIEWER = "44444444-4444-4444-8444-444444444444";
const EVENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const profiles = [
  { user_id: VIEWER, username: "viewer", display_name: "Viewer", avatar_url: null, is_test: false },
  { user_id: REAL, username: "real", display_name: "Real", avatar_url: null, is_test: false },
  { user_id: TEST, username: "b89likes15", display_name: "b89likes15", avatar_url: null, is_test: true },
  { user_id: TEST_VIEWER, username: "comp", display_name: "Comp", avatar_url: null, is_test: true },
];

type Eq = Record<string, unknown>;
type Inn = Record<string, unknown[]>;

function notif(id: string, userId: string, actor: string, type: string, read: boolean) {
  return {
    id,
    user_id: userId,
    type,
    title: null,
    body: null,
    data: { actor_id: actor, actor_username: profiles.find((p) => p.user_id === actor)?.username, event_id: EVENT },
    read,
    created_at: "2026-10-16T12:00:00.000Z",
  };
}

function rowsFor(table: string, eq: Eq, inn: Inn): unknown[] {
  if (table === "profiles") {
    return profiles.filter((p) => {
      if (eq.user_id != null && p.user_id !== eq.user_id) return false;
      if (Array.isArray(inn.user_id) && !inn.user_id.includes(p.user_id)) return false;
      if (eq.is_test === false && p.is_test !== false) return false;
      return true;
    });
  }
  if (table === "in_app_notifications") {
    const rows = [
      notif("n1", VIEWER, REAL, "respect", false),
      notif("n2", VIEWER, TEST, "respect", false),
      notif("n3", VIEWER, TEST, "follow", true),
      notif("n4", VIEWER, REAL, "comment", true),
      notif("n5", VIEWER, "", "general", false),
      notif("n6", TEST_VIEWER, TEST, "respect", false),
      notif("n7", TEST_VIEWER, REAL, "follow", true),
    ];
    return rows.filter((r) => {
      if (eq.user_id != null && r.user_id !== eq.user_id) return false;
      if (eq.read != null && r.read !== eq.read) return false;
      return true;
    });
  }
  if (table === "feed_comments") {
    const rows = [
      { id: "c1", event_id: EVENT, user_id: REAL, text: "nice", created_at: "2026-10-16T12:00:00.000Z", parent_id: null },
      { id: "c2", event_id: EVENT, user_id: TEST, text: "seeded", created_at: "2026-10-16T12:01:00.000Z", parent_id: null },
    ];
    return rows.filter((r) => eq.event_id == null || r.event_id === eq.event_id);
  }
  if (table === "feed_reactions") {
    const rows = [
      { event_id: EVENT, user_id: REAL, created_at: "2026-10-16T12:00:00.000Z" },
      { event_id: EVENT, user_id: TEST, created_at: "2026-10-16T12:01:00.000Z" },
    ];
    return rows.filter((r) => eq.event_id == null || r.event_id === eq.event_id);
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
    notifications: { getAll: () => Promise<{ unread: { id: string; actorId: string | null }[]; earlier: { id: string }[] }> };
    feed: {
      getComments: (i: { eventId: string; limit: number }) => Promise<{ user_id: string }[]>;
      getReactions: (i: { eventId: string }) => Promise<{ userId: string }[]>;
    };
  };
}

describe("05.3 test accounts stay out of a real viewer's lists", () => {
  it("notifications: a like or follow from a test account is dropped for a real viewer, kept for a test viewer", async () => {
    const real = await caller(VIEWER).notifications.getAll();
    expect(real.unread.map((n) => n.id)).toEqual(["n1", "n5"]);
    expect(real.earlier.map((n) => n.id)).toEqual(["n4"]);

    const testViewer = await caller(TEST_VIEWER).notifications.getAll();
    expect(testViewer.unread.map((n) => n.id)).toEqual(["n6"]);
    expect(testViewer.earlier.map((n) => n.id)).toEqual(["n7"]);
  });

  it("comments: a test account's comment is dropped for a real viewer, kept for a test viewer", async () => {
    const real = await caller(VIEWER).feed.getComments({ eventId: EVENT, limit: 50 });
    expect(real.map((c) => c.user_id)).toEqual([REAL]);

    const testViewer = await caller(TEST_VIEWER).feed.getComments({ eventId: EVENT, limit: 50 });
    expect(testViewer.map((c) => c.user_id)).toEqual([REAL, TEST]);
  });

  it("likes list: a test account's like is dropped for a real viewer, kept for a test viewer", async () => {
    const real = await caller(VIEWER).feed.getReactions({ eventId: EVENT });
    expect(real.map((r) => r.userId)).toEqual([REAL]);

    const testViewer = await caller(TEST_VIEWER).feed.getReactions({ eventId: EVENT });
    expect(testViewer.map((r) => r.userId)).toEqual([REAL, TEST]);
  });
});
