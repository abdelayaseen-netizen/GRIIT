import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { parseSecureDayRpcRow } from "../../lib/secure-day-rpc";

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "c0000000-0000-4000-8000-000000000003";
const CH = "d0000000-0000-4000-8000-000000000004";

const rpcRow = { streak: 4, secured: false, challenge_done: true, remaining_challenges: 2 };

function createMockSupabase() {
  const rpc = vi.fn().mockResolvedValue({ data: [rpcRow], error: null });
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
        if (table === "day_secures") return null;
        if (table === "streaks") return { longest_streak_count: 4 };
        return null;
      })();
      const chain: Record<string, unknown> = {};
      const done = () => Promise.resolve({ data, error: null });
      chain.select = () => chain;
      chain.eq = () => chain;
      chain.in = () => chain;
      chain.maybeSingle = done;
      chain.single = done;
      chain.insert = () => Promise.resolve({ data: null, error: null });
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
});
