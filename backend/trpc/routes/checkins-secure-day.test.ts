import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { parseSecureDayRpcRow } from "../../lib/secure-day-rpc";

const harness = vi.hoisted(() => ({
  enabled: false,
  count: 0,
  updates: [] as unknown[],
}));

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => {
    if (!harness.enabled) return null;
    return {
      from: (table: string) => {
        if (table === "profiles") {
          return {
            update: (payload: unknown) => {
              harness.updates.push(payload);
              return { eq: () => Promise.resolve({ error: null }) };
            },
          };
        }
        const chain: Record<string, unknown> = {};
        chain.select = () => chain;
        chain.eq = () => chain;
        chain.then = (onFulfilled: (value: unknown) => unknown) =>
          Promise.resolve({ count: harness.count, error: null, data: null }).then(onFulfilled);
        return chain;
      },
    };
  },
}));

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "c0000000-0000-4000-8000-000000000003";
const CH = "d0000000-0000-4000-8000-000000000004";

const rpcRow = { streak: 4, secured: false, challenge_done: true, remaining_challenges: 2 };

function createMockSupabase(opts?: { rpc?: typeof rpcRow; daySecure?: { id: string } | null }) {
  const rpc = vi.fn().mockResolvedValue({ data: [opts?.rpc ?? rpcRow], error: null });
  return {
    rpc,
    from: (table: string) => {
      const data = (() => {
        if (table === "active_challenges") {
          return { id: AC, user_id: USER, challenge_id: CH, current_day: 2 };
        }
        if (table === "profiles") {
          return { timezone: "UTC", reminder_timezone: "UTC", total_days_secured: 3 };
        }
        if (table === "challenges") {
          return {
            duration_type: "multi_day",
            ends_at: null,
            live_date: null,
            participation_type: "solo",
            run_status: "active",
            duration_days: 14,
            title: "Write",
          };
        }
        if (table === "day_secures") return opts?.daySecure ?? null;
        if (table === "streaks") return { longest_streak_count: 4 };
        return null;
      })();
      const chain: Record<string, unknown> = {};
      const done = () => Promise.resolve({ data, error: null, count: 0 });
      chain.select = () => chain;
      chain.eq = () => chain;
      chain.in = () => chain;
      chain.or = () => chain;
      chain.maybeSingle = done;
      chain.single = done;
      chain.insert = () => Promise.resolve({ data: null, error: null });
      chain.upsert = () => Promise.resolve({ data: null, error: null });
      chain.then = (onFulfilled: (value: unknown) => unknown) =>
        Promise.resolve({ data: Array.isArray(data) ? data : data ? [data] : [], count: 0, error: null }).then(onFulfilled);
      return chain;
    },
  };
}

describe("parseSecureDayRpcRow", () => {
  it("passes through the four fields", () => {
    expect(parseSecureDayRpcRow(rpcRow)).toEqual(rpcRow);
  });
});

describe("checkins.secureDay", () => {
  beforeEach(() => {
    harness.enabled = false;
    harness.count = 0;
    harness.updates.length = 0;
  });

  it("returns rpc {secured:false, challenge_done:true, remaining_challenges:2} unchanged", async () => {
    const supabase = createMockSupabase();
    const caller = createTestCaller({ userId: USER, supabase });
    if (!caller) return;
    const result = await caller.checkins.secureDay({ activeChallengeId: AC });
    expect(result.secured).toBe(false);
    expect(result.challenge_done).toBe(true);
    expect(result.remaining_challenges).toBe(2);
    expect(result.streak).toBe(4);
    expect(supabase.rpc).toHaveBeenCalledWith("secure_day", { p_active_challenge_id: AC });
  });

  it("writes the day_secures count when the stored total is wrong", async () => {
    harness.enabled = true;
    harness.count = 12;
    const supabase = createMockSupabase({
      rpc: { streak: 5, secured: true, challenge_done: false, remaining_challenges: 0 },
    });
    const caller = createTestCaller({ userId: USER, supabase });
    if (!caller) return;
    await caller.checkins.secureDay({ activeChallengeId: AC });
    expect(harness.updates).toHaveLength(1);
    const written = harness.updates[0] as { total_days_secured: number; tier: string };
    expect(written.total_days_secured).toBe(12);
    expect(written.tier).toBe("Builder");
  });

  it("does not rewrite total_days_secured when today was already secured", async () => {
    harness.enabled = true;
    harness.count = 99;
    const supabase = createMockSupabase({
      rpc: { streak: 5, secured: true, challenge_done: false, remaining_challenges: 0 },
      daySecure: { id: "already" },
    });
    const caller = createTestCaller({ userId: USER, supabase });
    if (!caller) return;
    const result = await caller.checkins.secureDay({ activeChallengeId: AC });
    expect(result.alreadySecured).toBe(true);
    expect(harness.updates).toHaveLength(0);
  });
});
