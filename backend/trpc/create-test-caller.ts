import { appRouter } from "./app-router";

/** Minimal caller surface used in Vitest; avoids `unknown` when createCaller exists. */
export type TestAppCaller = {
  accountability: {
    invite: (input: { partnerId: string }) => Promise<{ success: boolean; status: string; inviteId: string }>;
    respond: (input: { inviteId: string; action: string }) => Promise<unknown>;
  };
  nudges: {
    send: (input: { toUserId: string }) => Promise<{ success: boolean; nudgeId: string; message: string }>;
  };
};

export function createTestCaller(ctx: {
  userId: string;
  supabase: unknown;
  req?: Request;
}): TestAppCaller | undefined {
  const create = (appRouter as { createCaller?: (c: unknown) => TestAppCaller }).createCaller;
  return create?.({
    userId: ctx.userId,
    supabase: ctx.supabase,
    req: ctx.req ?? ({} as Request),
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}
