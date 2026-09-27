import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { joinChallengeDirect } from "./join-challenge";
import { ALREADY_IN_CHALLENGE_MESSAGE } from "./join-errors";

const USER = "11111111-1111-4111-8111-111111111111";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OLD = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NEW = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

vi.mock("./supabase-server", () => ({
  getSupabaseServer: () => null,
}));

type AcRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  end_at: string;
};

function mockJoinDb(opts: {
  existing?: AcRow | null;
  insertError?: { code: string; message: string; details?: string } | null;
}) {
  const updates: { table: string; row: Record<string, unknown> }[] = [];
  const inserts: { table: string; row: Record<string, unknown> }[] = [];
  const from = (table: string) => {
    const eqs: Record<string, unknown> = {};
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: (col: string, val: unknown) => {
        eqs[col] = val;
        return chain;
      },
      maybeSingle: () => {
        if (table === "active_challenges") {
          return Promise.resolve({ data: opts.existing ?? null, error: null });
        }
        if (table === "profiles") {
          return Promise.resolve({
            data: { user_id: USER, timezone: "America/New_York" },
            error: null,
          });
        }
        if (table === "streaks") {
          return Promise.resolve({ data: { user_id: USER }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      single: () => {
        if (table === "challenges") {
          return Promise.resolve({
            data: { id: CH, duration_type: "multi_day", duration_days: 1 },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: { code: "PGRST116" } });
      },
      update: (row: Record<string, unknown>) => {
        updates.push({ table, row });
        return chain;
      },
      then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected),
      insert: (row: Record<string, unknown>) => {
        inserts.push({ table, row: Array.isArray(row) ? row[0] : row });
        const after: Record<string, unknown> = {
          select: () => after,
          single: () =>
            Promise.resolve({
              data: opts.insertError
                ? null
                : {
                    id: NEW,
                    user_id: USER,
                    challenge_id: CH,
                    status: "active",
                    start_at: new Date().toISOString(),
                    end_at: new Date(Date.now() + 86400000).toISOString(),
                    current_day: 1,
                    progress_percent: 0,
                    created_at: new Date().toISOString(),
                  },
              error: opts.insertError ?? null,
            }),
        };
        return after;
      },
    };
    return chain;
  };
  return { supabase: { from }, updates, inserts };
}

describe("joinChallengeDirect start-again", () => {
  it("inserts a new row when the only enrollment is completed", async () => {
    const { supabase, inserts, updates } = mockJoinDb({ existing: null });
    const result = await joinChallengeDirect(supabase as never, USER, CH);
    expect(result.id).toBe(NEW);
    expect(result.status).toBe("active");
    expect(inserts.some((i) => i.table === "active_challenges")).toBe(true);
    expect(updates).toEqual([]);
  });

  it("inserts a new row when the only enrollment is abandoned (left)", async () => {
    const { supabase, inserts } = mockJoinDb({ existing: null });
    const result = await joinChallengeDirect(supabase as never, USER, CH);
    expect(result.id).toBe(NEW);
    expect(inserts[0]?.row).toMatchObject({ user_id: USER, challenge_id: CH, status: "active" });
  });

  it("refuses while an in-window active run exists", async () => {
    const { supabase, inserts } = mockJoinDb({
      existing: {
        id: OLD,
        user_id: USER,
        challenge_id: CH,
        status: "active",
        end_at: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    await expect(joinChallengeDirect(supabase as never, USER, CH)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: ALREADY_IN_CHALLENGE_MESSAGE,
    } satisfies Partial<TRPCError>);
    expect(inserts).toEqual([]);
  });

  it("closes a past-end zombie active row then inserts a new run", async () => {
    const { supabase, inserts, updates } = mockJoinDb({
      existing: {
        id: OLD,
        user_id: USER,
        challenge_id: CH,
        status: "active",
        end_at: new Date(Date.now() - 86400000).toISOString(),
      },
    });
    const result = await joinChallengeDirect(supabase as never, USER, CH);
    expect(result.id).toBe(NEW);
    expect(updates[0]?.row).toMatchObject({ status: "completed" });
    expect(inserts.some((i) => i.table === "active_challenges")).toBe(true);
  });

  it("maps unique violation to already-in instead of Failed to join", async () => {
    const { supabase } = mockJoinDb({
      existing: null,
      insertError: {
        code: "23505",
        message: "duplicate key",
        details: "Key (user_id, challenge_id) already exists",
      },
    });
    await expect(joinChallengeDirect(supabase as never, USER, CH)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: ALREADY_IN_CHALLENGE_MESSAGE,
    });
  });
});
