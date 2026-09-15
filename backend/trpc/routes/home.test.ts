import { describe, expect, it, vi } from "vitest";
import { appRouter } from "../app-router";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "c0000000-0000-4000-8000-000000000003";
const CH = "d0000000-0000-4000-8000-000000000004";
const TASK = "e0000000-0000-4000-8000-000000000005";

const profileRow = {
  user_id: USER,
  username: "tester",
  display_name: "Tester",
  bio: "",
  avatar_url: null,
  tier: "bronze",
  subscription_status: "free",
  subscription_expiry: null,
  total_days_secured: 4,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  profile_visibility: "public",
  challenge_visibility: "public",
  activity_visibility: "public",
  timezone: "UTC",
  reminder_timezone: "UTC",
  distance_unit: "km",
  target_streak: 30,
  is_premium: false,
  streak_freezes_remaining: 1,
  last_freeze_used_at: null,
};

const streakRow = {
  user_id: USER,
  active_streak_count: 4,
  longest_streak_count: 7,
  last_completed_date_key: "2026-09-13",
  last_stands_available: 1,
};

const activeEnrollment = {
  id: AC,
  user_id: USER,
  challenge_id: CH,
  status: "active",
  created_at: "2026-09-01T00:00:00.000Z",
  challenges: {
    id: CH,
    title: "Write",
    challenge_tasks: [{ id: TASK, task_type: "journal", title: "500 words", config: { required: true } }],
  },
};

const slimCheckin = {
  id: "f0000000-0000-4000-8000-000000000006",
  active_challenge_id: AC,
  task_id: TASK,
  date_key: "2026-09-14",
  status: "completed",
};

const richCheckin = {
  ...slimCheckin,
  value: 1,
  note_text: "ok",
  proof_url: null,
  completion_image_url: null,
  proof_source: null,
  proof_payload_json: null,
  external_activity_id: null,
  verification_status: "verified",
  created_at: "2026-09-14T12:00:00.000Z",
};

function createMockSupabase(opts?: { failFollows?: boolean }) {
  const makeChain = (init?: { table?: string }) => {
    const state = {
      table: init?.table ?? "",
      lastStatus: null as string | null,
      followSide: "" as "" | "followers" | "following",
      lastSelect: "",
    };

    const resolve = () => {
      const { table, lastStatus, lastSelect } = state;
      if (table === "profiles") {
        return { data: profileRow, error: null, count: null };
      }
      if (table === "streaks") {
        return { data: streakRow, error: null, count: null };
      }
      if (table === "last_stand_uses") {
        return { data: [], error: null, count: null };
      }
      if (table === "day_secures") {
        return { data: [{ date_key: "2026-09-13" }, { date_key: "2026-09-12" }], error: null, count: null };
      }
      if (table === "user_follows") {
        if (opts?.failFollows) {
          throw new Error("follow counts down");
        }
        const n = state.followSide === "following" ? 3 : 5;
        return { data: [], error: null, count: n };
      }
      if (table === "challenge_tasks") {
        return { data: [{ config: { required: true } }], error: null, count: null };
      }
      if (table === "check_ins") {
        const rich = lastSelect.includes("note_text");
        return { data: [rich ? richCheckin : slimCheckin], error: null, count: null };
      }
      if (table === "active_challenges") {
        if (lastStatus === "completed") {
          return { data: [], error: null, count: null };
        }
        if (lastSelect.includes("challenge_tasks") || lastSelect.includes("*")) {
          return { data: [activeEnrollment], error: null, count: null };
        }
        if (lastSelect.includes("challenge_id") && !lastSelect.includes("user_id")) {
          return { data: { challenge_id: CH }, error: null, count: null };
        }
        if (lastSelect.includes("id, user_id, challenge_id")) {
          return { data: { id: AC, user_id: USER, challenge_id: CH }, error: null, count: null };
        }
        return { data: [{ id: AC }], error: null, count: null };
      }
      return { data: null, error: null, count: null };
    };

    const resolveSingle = () => {
      const r = resolve();
      if (state.table === "active_challenges" && state.lastSelect.includes("challenge_tasks")) {
        return Promise.resolve({ data: activeEnrollment, error: null });
      }
      if (state.table === "active_challenges" && state.lastSelect.includes("id, user_id, challenge_id")) {
        return Promise.resolve({ data: { id: AC, user_id: USER, challenge_id: CH }, error: null });
      }
      if (Array.isArray(r.data)) {
        return Promise.resolve({ data: r.data[0] ?? null, error: r.data[0] ? null : { code: "PGRST116" } });
      }
      return Promise.resolve({ data: r.data, error: r.error });
    };

    const chain: Record<string, unknown> = {
      from: (t: string) => makeChain({ table: t }),
      select: (cols: string) => {
        state.lastSelect = cols;
        return chain;
      },
      eq: (col: string, val: unknown) => {
        if (col === "status") state.lastStatus = String(val);
        if (col === "following_id") state.followSide = "followers";
        if (col === "follower_id") state.followSide = "following";
        return chain;
      },
      neq: () => chain,
      or: () => chain,
      gte: () => chain,
      lte: () => chain,
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => resolveSingle(),
      maybeSingle: () => resolveSingle().then((r) => ({ data: r.data, error: null })),
      then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve(resolve()).then(onFulfilled, onRejected),
    };
    return chain;
  };

  return makeChain();
}

function createCaller(opts?: { failFollows?: boolean }) {
  const create = (
    appRouter as unknown as {
      createCaller?: (c: unknown) => {
        home: { bootstrap: () => Promise<Record<string, unknown>> };
        profiles: {
          get: () => Promise<unknown>;
          getStats: () => Promise<unknown>;
          getSecuredDateKeys: () => Promise<unknown>;
          getFollowCounts: (i: { userId: string }) => Promise<unknown>;
        };
        challenges: {
          listMyActive: () => Promise<unknown>;
          getActive: () => Promise<unknown>;
        };
        checkins: {
          getTodayCheckinsForUser: () => Promise<unknown>;
          getTodayCheckins: (i: { activeChallengeId: string }) => Promise<unknown>;
        };
        streaks: { getFreezeStatus: () => Promise<unknown> };
      };
    }
  ).createCaller;
  return create?.({
    userId: USER,
    supabase: createMockSupabase(opts),
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("home.bootstrap", () => {
  it("equals the union of the individual procedures for the same user", async () => {
    const caller = createCaller();
    if (!caller) return;

    const [
      profile,
      stats,
      activeChallenges,
      activeChallenge,
      todayCheckinsForUser,
      securedDateKeys,
      freezeStatus,
      followCounts,
    ] = await Promise.all([
      caller.profiles.get(),
      caller.profiles.getStats(),
      caller.challenges.listMyActive(),
      caller.challenges.getActive(),
      caller.checkins.getTodayCheckinsForUser(),
      caller.profiles.getSecuredDateKeys(),
      caller.streaks.getFreezeStatus(),
      caller.profiles.getFollowCounts({ userId: USER }),
    ]);

    const todayCheckins = await caller.checkins.getTodayCheckins({ activeChallengeId: AC });
    const bootstrap = await caller.home.bootstrap();

    expect(bootstrap).toEqual({
      profile,
      stats,
      activeChallenges,
      activeChallenge,
      todayCheckinsForUser,
      todayCheckins,
      securedDateKeys,
      freezeStatus,
      followCounts,
      failed: [],
    });
  });

  it("one section rejects → others present, failed lists it, call still resolves", async () => {
    const caller = createCaller({ failFollows: true });
    if (!caller) return;

    const bootstrap = await caller.home.bootstrap();

    expect(bootstrap.failed).toEqual(["followCounts"]);
    expect(bootstrap.followCounts).toBeNull();
    expect(bootstrap.profile).toMatchObject({ user_id: USER, username: "tester" });
    expect(bootstrap.stats).toMatchObject({ activeStreak: 4 });
    expect(bootstrap.activeChallenges).toEqual(expect.any(Array));
    expect(bootstrap.activeChallenge).toMatchObject({ id: AC });
    expect(bootstrap.todayCheckinsForUser).toEqual(expect.any(Array));
    expect(bootstrap.todayCheckins).toEqual(expect.any(Array));
    expect(bootstrap.securedDateKeys).toEqual(expect.any(Array));
    expect(bootstrap.freezeStatus).toMatchObject({ isPro: false });
  });
});
