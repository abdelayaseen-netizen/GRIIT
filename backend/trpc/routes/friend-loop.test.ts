/**
 * Build 90 chunk 08 (Friend loop), server side:
 *  08.2 groups.openLink opens a non-team challenge instead of "ended"; getById / join accept
 *       the invite link as the key to an invite-only challenge (viaInvite).
 *  08.3 challenges.search: exact invite code → that challenge; words → public titles,
 *       test-account creators dropped.
 */
import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { PRIVATE_CHALLENGE_MESSAGE } from "../../lib/can-view-challenge";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: vi.fn(() => null) }));
vi.mock("../../lib/sendPush", () => ({
  sendPush: vi.fn().mockResolvedValue(undefined),
  sendPushToProfile: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));

const ME = "11111111-1111-4111-8111-111111111111";
const CREATOR = "22222222-2222-4222-8222-222222222222";
const TESTER = "33333333-3333-4333-8333-333333333333";
const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CH_PUBLIC = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CH_TEST = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

type Write = { table: string; op: string; row: unknown };

/** Chainable stub: reads return `reads[table]` (optionally filtered by eq("id")), writes recorded. */
function stubDb(reads: Record<string, unknown[]> = {}) {
  const writes: Write[] = [];
  const from = (table: string) => {
    let rows = reads[table] ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = {};
    const self = () => q;
    for (const m of ["select", "neq", "in", "or", "order", "limit", "gte", "lte", "gt", "lt", "not", "is", "ilike", "like", "range"]) {
      q[m] = self;
    }
    q.eq = (col: string, val: unknown) => {
      if (col === "id" || col === "user_id" || col === "is_test") {
        rows = rows.filter((r) => (r as Record<string, unknown>)[col] === val);
      }
      return q;
    };
    q.maybeSingle = async () => ({ data: rows[0] ?? null, error: null });
    q.single = async () => ({ data: rows[0] ?? null, error: rows[0] ? null : { code: "PGRST116", message: "no rows" } });
    q.then = (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
      Promise.resolve({ data: rows, error: null, count: rows.length }).then(res, rej);
    q.insert = (row: unknown) => {
      writes.push({ table, op: "insert", row });
      return q;
    };
    q.update = (row: unknown) => {
      writes.push({ table, op: "update", row });
      return q;
    };
    q.upsert = (row: unknown) => {
      writes.push({ table, op: "upsert", row });
      return q;
    };
    q.rpc = async () => ({ data: null, error: null });
    return q;
  };
  return { supabase: { from, rpc: async () => ({ data: null, error: null }) }, writes };
}

type Caller = {
  groups: { openLink: (input: { challengeId: string }) => Promise<{ state?: string; invite?: unknown }> };
  challenges: {
    getById: (input: { id: string; viaInvite?: boolean }) => Promise<{ id: string }>;
    search: (input: { q: string }) => Promise<{ code: string | null; exact: { id: string } | null; results: { id: string }[] }>;
  };
};

const soloPrivate = {
  id: CH,
  title: "Gym before work",
  creator_id: CREATOR,
  participation_type: "solo",
  run_status: null,
  visibility: "PRIVATE",
  status: "published",
  duration_days: 7,
  challenge_tasks: [],
};

describe("08.2 groups.openLink for a non-team challenge", () => {
  it("returns state 'open' (the page opens) instead of 'ended' / 'Not a group challenge.'", async () => {
    const db = stubDb({ challenges: [soloPrivate] });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.groups.openLink({ challengeId: CH });
    expect(out.state).toBe("open");
    expect(db.writes).toEqual([]);
  });
  it("still 404s a missing challenge", async () => {
    const db = stubDb({ challenges: [] });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    await expect(caller.groups.openLink({ challengeId: CH })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("08.2 the invite link is the key to an invite-only challenge", () => {
  it("getById without the link: private to a stranger", async () => {
    const db = stubDb({ challenges: [soloPrivate] });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    await expect(caller.challenges.getById({ id: CH })).rejects.toMatchObject({ message: PRIVATE_CHALLENGE_MESSAGE });
  });
  it("getById viaInvite: the row opens, signed in or not", async () => {
    const db = stubDb({ challenges: [soloPrivate] });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const row = await caller.challenges.getById({ id: CH, viaInvite: true });
    expect(row.id).toBe(CH);
    const guestDb = stubDb({ challenges: [soloPrivate] });
    const guest = createTestCaller({ userId: null as never, supabase: guestDb.supabase as never }) as unknown as Caller;
    const guestRow = await guest.challenges.getById({ id: CH, viaInvite: true });
    expect(guestRow.id).toBe(CH);
  });
  it("getById viaInvite does not open a draft", async () => {
    const db = stubDb({ challenges: [{ ...soloPrivate, status: "draft" }] });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    await expect(caller.challenges.getById({ id: CH, viaInvite: true })).rejects.toMatchObject({ message: PRIVATE_CHALLENGE_MESSAGE });
  });
});

describe("08.3 challenges.search", () => {
  const rows = [
    { ...soloPrivate },
    { id: CH_PUBLIC, title: "Morning run club", creator_id: null, participation_type: "solo", visibility: "PUBLIC", status: "published", duration_days: 30, participants_count: 12 },
    { id: CH_TEST, title: "Morning run (test)", creator_id: TESTER, participation_type: "solo", visibility: "PUBLIC", status: "published", duration_days: 7, participants_count: 1 },
  ];
  it("an exact code (bare uuid) returns that challenge, private or not", async () => {
    const db = stubDb({ challenges: rows });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.challenges.search({ q: CH });
    expect(out.code).toBe(CH);
    expect(out.exact?.id).toBe(CH);
    expect(out.results).toEqual([]);
  });
  it("a pasted griit://i/ link resolves the same way", async () => {
    const db = stubDb({ challenges: rows });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.challenges.search({ q: `griit://i/${CH}?ref=${CREATOR}` });
    expect(out.exact?.id).toBe(CH);
  });
  it("an unknown code gives no match (no title fallback)", async () => {
    const db = stubDb({ challenges: rows });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.challenges.search({ q: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" });
    expect(out.code).toBe("dddddddd-dddd-4ddd-8ddd-dddddddddddd");
    expect(out.exact).toBeNull();
    expect(out.results).toEqual([]);
  });
  it("words search titles and drop challenges from test accounts", async () => {
    const db = stubDb({
      challenges: rows.filter((r) => r.visibility === "PUBLIC"),
      profiles: [{ user_id: TESTER, is_test: true }],
    });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.challenges.search({ q: "morning" });
    expect(out.code).toBeNull();
    expect(out.results.map((r) => r.id)).toEqual([CH_PUBLIC]);
  });
  it("one letter is not a search", async () => {
    const db = stubDb({ challenges: rows });
    const caller = createTestCaller({ userId: ME, supabase: db.supabase as never }) as unknown as Caller;
    const out = await caller.challenges.search({ q: "m" });
    expect(out.results).toEqual([]);
  });
});
