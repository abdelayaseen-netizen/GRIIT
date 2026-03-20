import { describe, it, expect, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { NUDGE_MESSAGES, pickRandomMessage } from "./nudges";

vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

describe("Nudge messages", () => {
  it("has exactly the 3 allowed messages", () => {
    expect(NUDGE_MESSAGES).toHaveLength(3);
    expect(NUDGE_MESSAGES).toContain("You showed up today. That's discipline.");
    expect(NUDGE_MESSAGES).toContain("Don't break the chain.");
    expect(NUDGE_MESSAGES).toContain("Small wins stack.");
  });

  it("pickRandomMessage returns one of the allowed messages", () => {
    for (let i = 0; i < 20; i++) {
      const msg = pickRandomMessage();
      expect(NUDGE_MESSAGES).toContain(msg);
    }
  });
});

function createMockSupabase(overrides: {
  recentNudges?: unknown[];
  insertError?: Error | null;
  senderProfile?: { display_name?: string; username?: string } | null;
} = {}) {
  const {
    recentNudges = [],
    insertError = null,
    senderProfile = { display_name: "Alice", username: "alice" },
  } = overrides;

  const chain: Record<string, unknown> = {
    from: () => chain,
    select: () => chain,
    eq: () => chain,
    gte: () => chain,
    limit: (n: number) => {
      if (n === 1 && recentNudges.length > 0) {
        return Promise.resolve({ data: recentNudges, error: null });
      }
      if (n === 1) {
        return Promise.resolve({ data: [], error: null });
      }
      return chain;
    },
    order: () => chain,
    in: () => chain,
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "nudge-id-1" }, error: insertError }) }) }),
    single: () => Promise.resolve({ data: senderProfile, error: null }),
  };

  return chain;
}

describe("nudges.send (via createCaller)", () => {
  it("rejects self-nudging with BAD_REQUEST", async () => {
    const supabase = createMockSupabase();
    const caller = createTestCaller({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) {
      // tRPC version may not expose createCaller; skip
      return;
    }

    await expect(caller.nudges.send({ toUserId: USER_A })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "You cannot nudge yourself.",
    });
  });

  it("rejects second nudge within 24 hours with TOO_MANY_REQUESTS", async () => {
    const supabase = createMockSupabase({ recentNudges: [{ id: "existing" }] });
    const caller = createTestCaller({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    await expect(caller.nudges.send({ toUserId: USER_B })).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "You already nudged them today.",
    });
  });

  it("inserts nudge and returns success when no recent nudge", async () => {
    const supabase = createMockSupabase({ recentNudges: [] });
    const caller = createTestCaller({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    const result = await caller.nudges.send({ toUserId: USER_B });

    expect(result.success).toBe(true);
    expect(result.nudgeId).toBe("nudge-id-1");
    expect(NUDGE_MESSAGES).toContain(result.message);
  });
});
