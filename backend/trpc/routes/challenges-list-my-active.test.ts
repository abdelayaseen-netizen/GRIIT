import { describe, expect, it, vi } from "vitest";
import { createTRPCRouter } from "../create-context";
import { challengesRouter } from "./challenges";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";
const NOW = Date.now();
const day = 24 * 60 * 60 * 1000;

type Enrollment = {
  id: string;
  user_id: string;
  status: string;
  start_at: string;
  end_at: string;
  created_at: string;
  challenges: { title: string; duration_days: number; challenge_tasks: [] };
};

const ENDED: Enrollment = {
  id: "ac-ended",
  user_id: USER,
  status: "active",
  start_at: new Date(NOW - 2 * day).toISOString(),
  end_at: new Date(NOW - day).toISOString(),
  created_at: new Date(NOW - 2 * day).toISOString(),
  challenges: { title: "Quick Steps", duration_days: 1, challenge_tasks: [] },
};

const IN_WINDOW: Enrollment = {
  id: "ac-live",
  user_id: USER,
  status: "active",
  start_at: new Date(NOW - day).toISOString(),
  end_at: new Date(NOW + 30 * day).toISOString(),
  created_at: new Date(NOW - day).toISOString(),
  challenges: { title: "75 Hard", duration_days: 75, challenge_tasks: [] },
};

function applyStoredFilters(rows: Enrollment[], filters: { col: string; op: string; val: string }[]) {
  return rows.filter((row) =>
    filters.every((f) => {
      const cell = String((row as Record<string, unknown>)[f.col] ?? "");
      if (f.op === "eq") return cell === f.val;
      if (f.op === "lte") return cell <= f.val;
      if (f.op === "gte") return cell >= f.val;
      return true;
    }),
  );
}

type QueryResult = { data: unknown; error: null; count: number };

function createMockSupabase(rows: Enrollment[]) {
  return {
    from: (table: string) => {
      const filters: { col: string; op: string; val: string }[] = [];
      const result = (): QueryResult => {
        if (table === "profiles") {
          return {
            data: { timezone: "UTC", reminder_timezone: "UTC" },
            error: null,
            count: 1,
          };
        }
        const matched = applyStoredFilters(rows, filters);
        return { data: matched, error: null, count: matched.length };
      };
      const chain = {
        select: (_a?: string, _b?: object) => chain,
        eq: (col: string, val: string) => {
          filters.push({ col, op: "eq", val });
          return chain;
        },
        lte: (col: string, val: string) => {
          filters.push({ col, op: "lte", val });
          return chain;
        },
        gte: (col: string, val: string) => {
          filters.push({ col, op: "gte", val });
          return chain;
        },
        order: () => chain,
        limit: () => chain,
        maybeSingle: () => {
          const resolved = result();
          const first = Array.isArray(resolved.data) ? resolved.data[0] ?? null : resolved.data;
          return Promise.resolve({ data: first, error: null, count: resolved.count });
        },
        then: (onFulfilled: (v: QueryResult) => unknown, onRejected?: (e: unknown) => unknown) =>
          Promise.resolve(result()).then(onFulfilled, onRejected),
      };
      return chain;
    },
  };
}

function createCaller(rows: Enrollment[]) {
  const router = createTRPCRouter({ challenges: challengesRouter });
  return router.createCaller({
    userId: USER,
    supabase: createMockSupabase(rows) as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("challenges.listMyActive window", () => {
  it("omits an active enrollment past end_at and keeps an in-window one", async () => {
    const caller = createCaller([ENDED, IN_WINDOW]);
    const list = (await caller.challenges.listMyActive()) as { id: string }[];
    expect(list.map((r) => r.id)).toEqual(["ac-live"]);
  });

  it("does not count a past-end_at enrollment toward the free-tier limit", async () => {
    const supabase = createMockSupabase([ENDED, IN_WINDOW, IN_WINDOW]);
    const { applyEnrollmentWindow } = await import("../../lib/enrollment-window");
    const counted = (await applyEnrollmentWindow(
      supabase.from("active_challenges").select("id", { count: "exact", head: true }).eq("user_id", USER),
    )) as { count: number };
    expect(counted.count).toBe(2);
  });
});
