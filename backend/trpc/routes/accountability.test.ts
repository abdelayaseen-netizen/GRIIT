import { describe, it, expect, vi } from "vitest";
import { appRouter } from "../app-router";

vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));

const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";

function createMockSupabase(overrides: {
  acceptedCount?: number;
  invitesToday?: number;
  existingPair?: { id: string; user_id: string; partner_id: string; status: string } | null;
  partnerExists?: boolean;
  insertResult?: { id: string } | null;
  insertError?: Error | null;
} = {}) {
  const {
    acceptedCount = 0,
    invitesToday = 0,
    existingPair = null,
    partnerExists = true,
    insertResult = { id: "pair-1" },
    insertError = null,
  } = overrides;

  const selectChain: any = {
    from: () => selectChain,
    select: () => selectChain,
    eq: () => selectChain,
    neq: () => selectChain,
    or: () => selectChain,
    gte: () => selectChain,
    limit: () => selectChain,
    order: () => selectChain,
    in: () => selectChain,
    single: () =>
      Promise.resolve({
        data: existingPair,
        error: existingPair ? null : { code: "PGRST116", message: "No rows" },
      }),
    maybeSingle: () =>
      Promise.resolve({
        data: existingPair,
        error: null,
      }),
    then: (resolve: (v: any) => void) => {
      if (existingPair) resolve({ data: [existingPair], error: null });
      else resolve({ data: [], error: null });
    },
  };

  let selectReturnData: any[] = [];
  if (overrides.acceptedCount !== undefined) {
    selectReturnData = Array(acceptedCount).fill({ id: "x" });
  }
  if (overrides.invitesToday !== undefined) {
    selectReturnData = Array(invitesToday).fill({ id: "y" });
  }

  const chain: any = {
    from: () => chain,
    select: () => chain,
    eq: () => chain,
    or: () => chain,
    gte: () => chain,
    limit: (_n: number) => {
      return {
        maybeSingle: () =>
          Promise.resolve({
            data: existingPair,
            error: null,
          }),
      };
    },
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: insertResult, error: insertError }),
      }),
    }),
    upsert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: insertResult, error: insertError }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
    single: () =>
      Promise.resolve({
        data: partnerExists ? { user_id: USER_B } : null,
        error: partnerExists ? null : { code: "PGRST116" },
      }),
    then: (resolve: (v: any) => void) => {
      resolve({ data: selectReturnData, error: null });
    },
  };
  chain.limit = (n: number) => {
    if (n === 1)
      return {
        maybeSingle: () =>
          Promise.resolve({
            data: existingPair,
            error: null,
          }),
      };
    return Promise.resolve({ data: selectReturnData, error: null });
  };

  return chain;
}

describe("accountability.invite", () => {
  it("rejects self-invite with BAD_REQUEST", async () => {
    const supabase = createMockSupabase();
    const caller = (appRouter as any).createCaller?.({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    await expect(caller.accountability.invite({ partnerId: USER_A })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "You cannot add yourself as a partner.",
    });
  });

  it("rejects when inviter already has 3 accepted partners", async () => {
    const supabase = createMockSupabase({ acceptedCount: 3 });
    const caller = (appRouter as any).createCaller?.({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    await expect(caller.accountability.invite({ partnerId: USER_B })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: /at most 3 accountability partners/,
    });
  });

  it("rejects when partner profile does not exist (user not found)", async () => {
    const supabase = createMockSupabase({ partnerExists: false });
    const caller = (appRouter as any).createCaller?.({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    await expect(caller.accountability.invite({ partnerId: USER_B })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "User not found.",
    });
  });

  it("creates pending invite when no existing relationship", async () => {
    const supabase = createMockSupabase({ existingPair: null, partnerExists: true });
    const caller = (appRouter as any).createCaller?.({
      userId: USER_A,
      supabase,
      req: {} as Request,
    });
    if (!caller) return;

    const result = await caller.accountability.invite({ partnerId: USER_B });

    expect(result.success).toBe(true);
    expect(result.status).toBe("pending");
    expect(result.inviteId).toBe("pair-1");
  });
});

describe("accountability.respond", () => {
  it("rejects when invite not found", async () => {
    const chain: any = {
      from: () => chain,
      select: () => chain,
      eq: () => chain,
      single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
    };
    const caller = (appRouter as any).createCaller?.({
      userId: USER_B,
      supabase: chain,
      req: {} as Request,
    });
    if (!caller) return;

    await expect(
      caller.accountability.respond({ inviteId: "00000000-0000-0000-0000-000000000000", action: "accept" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
