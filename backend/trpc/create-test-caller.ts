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
  checkins: {
    secureDay: (input: { activeChallengeId: string }) => Promise<{
      streak: number;
      secured: boolean;
      challenge_done: boolean;
      remaining_challenges: number;
      success: boolean;
      alreadySecured: boolean;
      newStreakCount: number;
    }>;
  };
  today: {
    get: () => Promise<{
      date_key: string;
      secured: boolean;
      streak: number;
      secured_date_keys: string[];
      enrollments: Array<{
        active_challenge_id: string;
        challenge_id: string;
        title: string;
        current_day: number;
        secured_today: boolean;
        tasks: Array<{
          id: string;
          title: string;
          done: boolean;
          require_photo: boolean;
          require_location: boolean;
          config: Record<string, unknown> | null;
        }>;
      }>;
      remaining_challenges: number;
    }>;
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
