import { describe, expect, it, vi } from "vitest";
import { createTRPCRouter } from "../create-context";
import { challengesJoinProcedures } from "./challenges-join";
import { challengesRouter } from "./challenges";
import { homeRouter } from "./home";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";
const CREATOR = "22222222-2222-4222-8222-222222222222";
const AC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = Date.now();
const day = 24 * 60 * 60 * 1000;

type AcRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  start_at: string;
  end_at: string;
  created_at: string;
  ended_at?: string | null;
  end_seen_at?: string | null;
  challenges?: { title: string; duration_days: number; challenge_tasks: [] };
};

function liveRow(over: Partial<AcRow> = {}): AcRow {
  return {
    id: AC,
    user_id: USER,
    challenge_id: CH,
    status: "active",
    start_at: new Date(NOW - day).toISOString(),
    end_at: new Date(NOW + 30 * day).toISOString(),
    created_at: new Date(NOW - day).toISOString(),
    ended_at: null,
    end_seen_at: null,
    challenges: { title: "Daily Gratitude", duration_days: 30, challenge_tasks: [] },
    ...over,
  };
}

function createLeaveMock(rows: AcRow[]) {
  const ac = rows.map((r) => ({ ...r }));
  const events: { table: string; op: string }[] = [];
  function acChain() {
    const filters: { col: string; op: string; val: unknown }[] = [];
    const matched = () =>
      ac.filter((row) =>
        filters.every((f) => {
          const cell = (row as Record<string, unknown>)[f.col];
          if (f.op === "eq") return cell === f.val;
          if (f.op === "lte") return String(cell) <= String(f.val);
          if (f.op === "gte") return String(cell) >= String(f.val);
          if (f.op === "in") return (f.val as string[]).includes(String(cell));
          if (f.op === "is") return cell == null;
          return true;
        }),
      );
    const q: Record<string, unknown> = {
      select: (_a?: string, _b?: object) => q,
      eq: (col: string, val: unknown) => {
        filters.push({ col, op: "eq", val });
        return q;
      },
      lte: (col: string, val: string) => {
        filters.push({ col, op: "lte", val });
        return q;
      },
      gte: (col: string, val: string) => {
        filters.push({ col, op: "gte", val });
        return q;
      },
      in: (col: string, val: string[]) => {
        filters.push({ col, op: "in", val });
        return q;
      },
      is: (col: string, val: null) => {
        filters.push({ col, op: "is", val });
        return q;
      },
      order: () => q,
      limit: () => q,
      maybeSingle: () => {
        const first = matched()[0] ?? null;
        return Promise.resolve({ data: first, error: null });
      },
      single: () => {
        const first = matched()[0] ?? null;
        return Promise.resolve({ data: first, error: first ? null : { code: "PGRST116" } });
      },
      update: (p: Record<string, unknown>) => {
        events.push({ table: "active_challenges", op: "update" });
        for (const row of matched()) Object.assign(row, p);
        return q;
      },
      delete: () => {
        events.push({ table: "active_challenges", op: "delete" });
        const keep = new Set(matched().map((r) => r.id));
        for (let i = ac.length - 1; i >= 0; i--) {
          if (keep.has(ac[i]!.id)) ac.splice(i, 1);
        }
        return q;
      },
      then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve({ data: matched(), error: null, count: matched().length }).then(
          onFulfilled,
          onRejected,
        ),
    };
    return q;
  }
  return {
    ac,
    events,
    from: (table: string) => {
      if (table === "active_challenges") return acChain();
      if (table === "challenges") {
        const challenge = { creator_id: CREATOR, participation_type: "team" };
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: challenge, error: null }),
              single: () => Promise.resolve({ data: challenge, error: null }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
          }),
        };
      }
      if (table === "profiles") {
        const row = { timezone: "UTC", reminder_timezone: "UTC", user_id: USER };
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: row, error: null }),
              single: () => Promise.resolve({ data: row, error: null }),
            }),
          }),
          update: () => ({
            eq: () => ({
              then: (fn: (v: unknown) => unknown) => Promise.resolve(fn({ data: null, error: null })),
            }),
          }),
        };
      }
      if (table === "activity_events") {
        return {
          insert: () => {
            events.push({ table: "activity_events", op: "insert" });
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      if (table === "check_ins") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            delete: () => {
              events.push({ table: "check_ins", op: "delete" });
              return Promise.resolve({ data: null, error: null });
            },
          }),
        };
      }
      const empty: Record<string, unknown> = {};
      empty.select = () => empty;
      empty.eq = () => empty;
      empty.neq = () => empty;
      empty.in = () => empty;
      empty.gte = () => empty;
      empty.lte = () => empty;
      empty.order = () => empty;
      empty.limit = () => empty;
      empty.single = () => Promise.resolve({ data: null, error: null });
      empty.maybeSingle = () => Promise.resolve({ data: null, error: null });
      empty.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled, onRejected);
      return empty;
    },
  };
}

function joinCaller(supabase: ReturnType<typeof createLeaveMock>) {
  const router = createTRPCRouter({
    challenges: createTRPCRouter(challengesJoinProcedures),
  });
  return router.createCaller({
    userId: USER,
    supabase: supabase as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

function listCaller(supabase: ReturnType<typeof createLeaveMock>) {
  const router = createTRPCRouter({ challenges: challengesRouter, home: homeRouter });
  return router.createCaller({
    userId: USER,
    supabase: supabase as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("participant leave", () => {
  it("keeps the row and writes abandoned with ended_at", async () => {
    const supabase = createLeaveMock([liveRow()]);
    const caller = joinCaller(supabase);
    const result = await caller.challenges.leave({ challengeId: CH });
    expect(result).toEqual({ left: true });
    expect(supabase.ac).toHaveLength(1);
    expect(supabase.ac[0]?.status).toBe("abandoned");
    expect(supabase.ac[0]?.ended_at).toBeTruthy();
    expect(supabase.ac[0]?.end_seen_at).toBe(supabase.ac[0]?.ended_at);
    expect(supabase.events.filter((e) => e.table === "active_challenges" && e.op === "delete")).toEqual([]);
    expect(supabase.events.filter((e) => e.table === "check_ins")).toEqual([]);
    expect(supabase.events.filter((e) => e.table === "activity_events")).toEqual([]);
  });

  it("abandoned enrollment is absent from listMyActive, listUnseenEndings, and home.bootstrap", async () => {
    const supabase = createLeaveMock([
      liveRow({
        status: "abandoned",
        ended_at: "2026-09-22T16:00:00.000Z",
        end_seen_at: null,
      }),
    ]);
    const caller = listCaller(supabase);
    const active = (await caller.challenges.listMyActive()) as { id: string }[];
    expect(active).toEqual([]);
    const unseen = (await caller.challenges.listUnseenEndings()) as { id: string }[];
    expect(unseen).toEqual([]);
    const bootstrap = await caller.home.bootstrap();
    expect(bootstrap.activeChallenges).toEqual([]);
  });
});
