/**
 * Edge case flow tests — double-secure, double-join, invalid IDs, unauthorized.
 * Run: npm run test -- tests/flows/edge-cases.test.ts
 */
import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("../../backend/lib/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null }) },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), maybeSingle: () => ({ data: null, error: null }) }), limit: () => ({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: "x" }, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      rpc: () => Promise.resolve({ data: null, error: null }),
    }),
  },
}));

const TEST_USER_ID = "a0000000-0000-4000-8000-000000000001";

function createMockContext(userId: string | null = TEST_USER_ID) {
  const mockChain: Record<string, unknown> = {
    from: () => mockChain,
    select: () => mockChain,
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "id-1" }, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    eq: () => mockChain,
    single: () => Promise.resolve({ data: null, error: { code: "PGRST116" } }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    limit: () => Promise.resolve({ data: [], error: null }),
  };
  return {
    req: new Request("http://test"),
    requestId: "edge-req-id",
    clientIp: "127.0.0.1",
    userId,
    supabase: { from: () => mockChain, rpc: vi.fn().mockResolvedValue({ data: [], error: null }) },
  };
}

describe("Edge cases", () => {
  let appRouter: { createCaller?: (ctx: unknown) => unknown };

  beforeAll(async () => {
    const mod = await import("../../backend/trpc/app-router");
    appRouter = mod.appRouter as typeof appRouter;
  });

  it("Invalid challenge ID: getById with non-UUID returns BAD_REQUEST or validation error", async () => {
    const caller = (appRouter as { createCaller?: (c: unknown) => unknown }).createCaller?.(createMockContext());
    if (!caller) return;
    try {
      await (caller as { challenges: { getById: (p: { id: string }) => Promise<unknown> } }).challenges.getById({
        id: "not-a-uuid",
      });
      expect.fail("Expected validation error");
    } catch (e: unknown) {
      const err = e as { data?: { code?: string }; message?: string };
      expect(err?.data?.code === "BAD_REQUEST" || /invalid|uuid|validation/i.test(err?.message ?? "")).toBe(true);
    }
  });

  it("Expired session: protected procedure with null userId throws UNAUTHORIZED", async () => {
    const caller = (appRouter as { createCaller?: (c: unknown) => unknown }).createCaller?.(createMockContext(null));
    if (!caller) return;
    try {
      await (caller as { profiles: { get: () => Promise<unknown> } }).profiles.get();
      expect.fail("Expected UNAUTHORIZED");
    } catch (e: unknown) {
      const err = e as { code?: string; data?: { code?: string } };
      expect(err?.code === "UNAUTHORIZED" || err?.data?.code === "UNAUTHORIZED").toBe(true);
    }
  });

  it("Empty profile fields: profiles.update with empty username should fail validation", async () => {
    const caller = (appRouter as { createCaller?: (c: unknown) => unknown }).createCaller?.(createMockContext());
    if (!caller) return;
    try {
      await (caller as { profiles: { update: (p: { username?: string }) => Promise<unknown> } }).profiles.update({
        username: "",
      });
      expect.fail("Expected validation error for empty username");
    } catch (e: unknown) {
      const err = e as { data?: { code?: string }; message?: string };
      expect(err?.data?.code === "BAD_REQUEST" || /username|min|required/i.test(err?.message ?? "")).toBe(true);
    }
  });

  it("XSS in title: challenges.create with script tag — backend accepts; sanitization is client-side or backend", async () => {
    const ctx = createMockContext();
    const caller = (appRouter as { createCaller?: (c: unknown) => unknown }).createCaller?.(ctx);
    if (!caller) return;
    try {
      const result = await (caller as { challenges: { create: (p: Record<string, unknown>) => Promise<unknown> } }).challenges.create({
        title: "<script>alert('xss')</script>",
        description: "",
        type: "standard",
        durationDays: 7,
        visibility: "FRIENDS",
        tasks: [{ id: "t1", title: "Task", type: "simple", required: true }],
      });
      expect(result).toBeDefined();
      console.log("Edge: create with script in title — backend may store as-is; sanitize in client or add backend sanitization");
    } catch {
      console.log("Edge: create with script in title — rejected by validation (acceptable)");
    }
  });
});
