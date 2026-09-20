import { describe, expect, it, vi } from "vitest";
import { createTRPCRouter } from "../create-context";
import { challengesRouter } from "./challenges";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const AC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

type AcRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  end_at: string;
  ended_at?: string | null;
  end_seen_at?: string | null;
  start_at?: string;
  current_day?: number;
  challenges?: { title: string; duration_days: number };
};

function createMock(rows: AcRow[]) {
  const ac = rows.map((r) => ({ ...r }));
  function chain() {
    const filters: { col: string; op: string; val: unknown }[] = [];
    const result = () => {
      const matched = ac.filter((row) =>
        filters.every((f) => {
          const cell = (row as Record<string, unknown>)[f.col];
          if (f.op === "eq") return cell === f.val;
          if (f.op === "in") return (f.val as string[]).includes(String(cell));
          if (f.op === "is") return cell == null;
          return true;
        }),
      );
      return { data: matched, error: null };
    };
    const q = {
      select: () => q,
      eq: (col: string, val: string) => {
        filters.push({ col, op: "eq", val });
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
      limit: () => Promise.resolve(result()),
      update: (p: Record<string, unknown>) => {
        const matched = ac.filter((row) =>
          filters.every((f) => (row as Record<string, unknown>)[f.col] === f.val),
        );
        for (const row of matched) Object.assign(row, p);
        return q;
      },
      then: (resolve: (v: { data: unknown; error: null }) => unknown) =>
        Promise.resolve(resolve(result())),
    };
    return q;
  }
  return {
    from: (table: string) => {
      if (table === "active_challenges") return chain();
      if (table === "activity_events") {
        const q = {
          select: () => q,
          eq: () => q,
          insert: () => Promise.resolve({ data: null, error: null }),
          then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
            Promise.resolve(resolve({ data: [], error: null })),
        };
        return q;
      }
      if (table === "challenges") {
        return {
          select: () => ({
            in: () =>
              Promise.resolve({
                data: [{ id: CH, title: "Quick Steps", duration_days: 1 }],
                error: null,
              }),
          }),
        };
      }
      throw new Error(table);
    },
  };
}

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

function createCaller(rows: AcRow[], svc: ReturnType<typeof createMock> | null = null) {
  if (svc) {
    vi.doMock("../../lib/supabase-server", () => ({
      getSupabaseServer: () => svc,
    }));
  }
  const router = createTRPCRouter({ challenges: challengesRouter });
  return router.createCaller({
    userId: USER,
    supabase: createMock(rows) as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("challenges.listUnseenEndings", () => {
  it("returns completed and failed with null end_seen_at, never abandoned", async () => {
    const caller = createCaller([
      {
        id: AC,
        user_id: USER,
        challenge_id: CH,
        status: "completed",
        end_at: "2026-09-19T23:59:59.999Z",
        ended_at: "2026-09-19T23:59:59.999Z",
        end_seen_at: null,
        challenges: { title: "Quick Steps", duration_days: 1 },
      },
      {
        id: "abandoned-1",
        user_id: USER,
        challenge_id: CH,
        status: "abandoned",
        end_at: "2026-09-19T23:59:59.999Z",
        ended_at: "2026-09-19T12:00:00.000Z",
        end_seen_at: null,
      },
    ]);
    const list = (await caller.challenges.listUnseenEndings()) as { id: string; status: string }[];
    expect(list.map((r) => r.id)).toEqual([AC]);
    expect(list[0]?.status).toBe("completed");
  });
});

describe("challenges.finalizeEnded", () => {
  it("requires service role", async () => {
    const caller = createCaller([]);
    await expect(caller.challenges.finalizeEnded()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});

describe("challenges.markEndSeen ownership", () => {
  it("rejects another user's enrollment via applyMarkEndSeen", async () => {
    const { applyMarkEndSeen } = await import("../../lib/finalize-ended");
    const svc = createMock([
      {
        id: AC,
        user_id: OTHER,
        challenge_id: CH,
        status: "completed",
        end_at: "2026-09-19T23:59:59.999Z",
      },
    ]);
    await expect(applyMarkEndSeen(svc as never, USER, [AC])).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
