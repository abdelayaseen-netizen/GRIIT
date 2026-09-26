import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { GROUP_FULL_MESSAGE } from "../../lib/group-challenges";

const CREATOR = "11111111-1111-4111-8111-111111111111";
const INVITEE = "22222222-2222-4222-8222-222222222222";
const OTHER = "33333333-3333-4333-8333-333333333333";
const CH = "d0000000-0000-4000-8000-000000000004";
const INVITE = "e0000000-0000-4000-8000-000000000005";
const AC = "c0000000-0000-4000-8000-000000000003";
const TASK = "f0000000-0000-4000-8000-000000000006";

const serviceInserts: { table: string; row: unknown }[] = [];
const serviceChallenge = {
  id: CH,
  title: "Morning run club",
  creator_id: CREATOR,
  participation_type: "team",
  run_status: "active",
  visibility: "FRIENDS",
  status: "published",
  duration_type: "multi_day",
  duration_days: 30,
};
const pendingInviteRow = {
  id: INVITE,
  challenge_id: CH,
  invited_by: CREATOR,
  invited_user_id: INVITEE,
  status: "pending",
  created_at: "2026-09-16T00:00:00.000Z",
  responded_at: null,
};
const serviceClient = {
  from: (table: string) => {
    const eqs: Record<string, unknown> = {};
    const chain: Record<string, unknown> = {};
    chain.select = () => chain;
    chain.eq = (col: string, val: unknown) => {
      eqs[col] = val;
      return chain;
    };
    chain.limit = () => chain;
    chain.update = () => chain;
    chain.insert = (row: unknown) => {
      serviceInserts.push({ table, row });
      const inserted = {
        ...pendingInviteRow,
        ...(typeof row === "object" && row ? row : {}),
      };
      return {
        select: () => ({
          single: () => Promise.resolve({ data: inserted, error: null }),
        }),
      };
    };
    const resolve = () => {
      if (table === "challenges") {
        return { data: serviceChallenge, error: null };
      }
      if (table === "challenge_invites") {
        const uid = eqs.invited_user_id ?? eqs.user_id;
        const match =
          (!uid || uid === INVITEE) &&
          (!eqs.status || eqs.status === "pending") &&
          (!eqs.challenge_id || eqs.challenge_id === CH);
        return { data: match ? pendingInviteRow : null, error: null };
      }
      return { data: null, error: null };
    };
    chain.single = () => Promise.resolve(resolve());
    chain.maybeSingle = () => Promise.resolve(resolve());
    return chain;
  },
};

vi.mock("../../lib/sendPush", () => ({ sendPushToProfile: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => serviceClient,
}));

type MockOpts = {
  enrolledCount?: number;
  pendingCount?: number;
  viewerIsMember?: boolean;
  inviteeIsMember?: boolean;
  existingInvite?: {
    id: string;
    challenge_id: string;
    invited_by: string;
    invited_user_id: string;
    status: string;
    created_at?: string;
    responded_at?: string | null;
  } | null;
  challenge?: {
    id: string;
    title?: string;
    creator_id: string;
    participation_type: string;
    run_status: string;
    duration_type?: string;
    duration_days?: number;
  };
  notificationInsertError?: { message: string } | null;
  memberRows?: { user_id: string; role: string; status: string; joined_at: string }[];
  profileRows?: {
    user_id: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    timezone?: string | null;
    reminder_timezone?: string | null;
  }[];
  daySecureRows?: { user_id: string; date_key: string }[];
};

function createMockSupabase(opts: MockOpts = {}) {
  const inserts: { table: string; row: unknown }[] = [];
  const updates: { table: string; row: unknown }[] = [];
  const challenge = opts.challenge ?? {
    id: CH,
    title: "Morning run club",
    creator_id: CREATOR,
    participation_type: "team",
    run_status: "active",
    duration_type: "multi_day",
    duration_days: 30,
  };
  const existingInvite = opts.existingInvite === undefined ? null : opts.existingInvite;

  const makeChain = (init?: { table?: string }) => {
    const state = {
      table: init?.table ?? "",
      head: false,
      eqs: {} as Record<string, unknown>,
    };

    const resolveCount = () => {
      if (state.table === "challenge_members") {
        return { data: null, error: null, count: opts.enrolledCount ?? 1 };
      }
      if (state.table === "challenge_invites") {
        return { data: null, error: null, count: opts.pendingCount ?? 0 };
      }
      if (state.table === "active_challenges") {
        return { data: null, error: null, count: 0 };
      }
      return { data: null, error: null, count: 0 };
    };

    const resolveSingle = () => {
      if (state.table === "profiles") {
        const uid = String(state.eqs.user_id ?? CREATOR);
        return {
          data: {
            user_id: uid,
            username: "user",
            display_name: "User",
            subscription_status: "premium",
            timezone: "UTC",
            reminder_timezone: "UTC",
            avatar_url: null,
          },
          error: null,
        };
      }
      if (state.table === "challenges") {
        return { data: challenge, error: null };
      }
      if (state.table === "challenge_members") {
        const uid = String(state.eqs.user_id ?? "");
        const member =
          (uid === CREATOR && (opts.viewerIsMember ?? true)) ||
          (uid === INVITEE && opts.inviteeIsMember);
        return { data: member ? { id: "mem-1", user_id: uid, status: "active" } : null, error: null };
      }
      if (state.table === "challenge_invites") {
        return { data: existingInvite, error: existingInvite ? null : null };
      }
      if (state.table === "active_challenges") {
        return { data: null, error: null };
      }
      if (state.table === "streaks") {
        return { data: { user_id: CREATOR, active_streak_count: 0 }, error: null };
      }
      return { data: null, error: null };
    };

    const resolveList = () => {
      if (state.head) return resolveCount();
      if (state.table === "challenge_tasks") {
        return { data: [{ id: TASK }], error: null };
      }
      if (state.table === "challenge_members") {
        return {
          data: opts.memberRows ?? [
            { user_id: CREATOR, role: "creator", status: "active", joined_at: "2026-09-13T00:00:00.000Z" },
          ],
          error: null,
        };
      }
      if (state.table === "challenge_invites") {
        return { data: existingInvite ? [existingInvite] : [], error: null };
      }
      if (state.table === "day_secures") {
        return { data: opts.daySecureRows ?? [], error: null };
      }
      if (state.table === "streaks") {
        return { data: [], error: null };
      }
      if (state.table === "profiles") {
        return { data: opts.profileRows ?? [], error: null };
      }
      return { data: [], error: null };
    };

    const chain: Record<string, unknown> = {
      from: (t: string) => makeChain({ table: t }),
      select: (_cols: string, extra?: { head?: boolean }) => {
        state.head = Boolean(extra?.head);
        return chain;
      },
      eq: (col: string, val: unknown) => {
        state.eqs[col] = val;
        return chain;
      },
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      neq: () => chain,
      gte: () => chain,
      lte: () => chain,
      maybeSingle: () => Promise.resolve(resolveSingle()),
      single: () => Promise.resolve(resolveSingle()),
      insert: (row: unknown) => {
        inserts.push({ table: state.table, row });
        const base =
          state.table === "challenges"
            ? {
                id: CH,
                title: "Morning run club",
                ...(typeof row === "object" && row ? row : {}),
              }
            : state.table === "challenge_invites"
              ? {
                  id: INVITE,
                  created_at: "2026-09-16T00:00:00.000Z",
                  responded_at: null,
                  ...(typeof row === "object" && row ? row : {}),
                }
              : state.table === "active_challenges"
                ? {
                    id: AC,
                    user_id: CREATOR,
                    challenge_id: CH,
                    status: "active",
                    start_at: "2026-09-16T00:00:00.000Z",
                    end_at: "2026-10-16T00:00:00.000Z",
                    current_day: 1,
                    progress_percent: 0,
                    created_at: "2026-09-16T00:00:00.000Z",
                    ...(typeof row === "object" && row ? row : {}),
                  }
                : state.table === "challenge_tasks"
                  ? [{ id: TASK, ...(typeof row === "object" && !Array.isArray(row) ? row : {}) }]
                  : row;
        const insertError =
          state.table === "in_app_notifications" ? opts.notificationInsertError ?? null : null;
        return {
          select: () => ({
            single: () =>
              Promise.resolve({
                data: insertError ? null : Array.isArray(base) ? base[0] : base,
                error: insertError,
              }),
            then: (resolve: (v: unknown) => unknown) =>
              Promise.resolve({
                data: insertError ? null : Array.isArray(base) ? base : [base],
                error: insertError,
              }).then(resolve),
          }),
          then: (resolve: (v: unknown) => unknown) =>
            Promise.resolve({ data: insertError ? null : base, error: insertError }).then(resolve),
        };
      },
      update: (row: unknown) => {
        updates.push({ table: state.table, row });
        const after: Record<string, unknown> = {
          eq: () => after,
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { id: INVITE, ...(existingInvite ?? {}), ...(typeof row === "object" && row ? row : {}) },
                error: null,
              }),
          }),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve),
        };
        return after;
      },
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(resolveList()).then(resolve, reject),
    };
    return chain;
  };

  return { supabase: makeChain(), inserts, updates };
}

const createInput = {
  title: "Morning run club",
  description: "",
  type: "standard" as const,
  durationDays: 30,
  participationType: "team" as const,
  visibility: "FRIENDS" as const,
  tasks: [{ title: "Run 3 km", type: "simple", required: true }],
};

describe("challenges.create group", () => {
  it("enrolls the creator as an active member of a PRIVATE group", async () => {
    const { supabase, inserts } = createMockSupabase({ viewerIsMember: true });
    const caller = createTestCaller({ userId: CREATOR, supabase });
    if (!caller) return;

    const result = await caller.challenges.create(createInput);

    expect(result.visibility).toBe("PRIVATE");
    expect(result.run_status).toBe("active");
    expect(result.participation_type).toBe("team");
    expect(result.activeChallenge?.id).toBe(AC);

    const challengeInsert = inserts.find((i) => i.table === "challenges")?.row as {
      visibility?: string;
      run_status?: string;
    };
    expect(challengeInsert.visibility).toBe("PRIVATE");
    expect(challengeInsert.run_status).toBe("active");

    const memberInsert = inserts.find((i) => i.table === "challenge_members")?.row as {
      role?: string;
      user_id?: string;
      status?: string;
    };
    expect(memberInsert).toMatchObject({ role: "creator", user_id: CREATOR, status: "active" });

    const enrollment = inserts.find((i) => i.table === "active_challenges")?.row as {
      user_id?: string;
      challenge_id?: string;
    };
    expect(enrollment).toMatchObject({ user_id: CREATOR, challenge_id: CH });
  });
});

describe("groups.invite", () => {
  it("refuses when enrolled + pending is 10", async () => {
    const { supabase } = createMockSupabase({
      viewerIsMember: true,
      enrolledCount: 8,
      pendingCount: 2,
    });
    const caller = createTestCaller({ userId: CREATOR, supabase });
    if (!caller) return;

    await expect(caller.groups.invite({ challengeId: CH, userId: INVITEE })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: GROUP_FULL_MESSAGE,
    });
  });

  it("inserts an in_app_notifications row of type challenge_invite", async () => {
    const { supabase, inserts } = createMockSupabase({
      viewerIsMember: true,
      enrolledCount: 1,
      pendingCount: 0,
    });
    const caller = createTestCaller({ userId: CREATOR, supabase });
    if (!caller) return;

    await caller.groups.invite({ challengeId: CH, userId: INVITEE });
    const notification = inserts.find((i) => i.table === "in_app_notifications")?.row as {
      type?: string;
      user_id?: string;
    };
    expect(notification).toMatchObject({ type: "challenge_invite", user_id: INVITEE });
    expect(inserts.filter((i) => i.table === "in_app_notifications")).toHaveLength(1);
  });

  it("throws when the challenge_invite notification insert fails", async () => {
    const { supabase, inserts } = createMockSupabase({
      viewerIsMember: true,
      enrolledCount: 1,
      pendingCount: 0,
      notificationInsertError: { message: "in_app_notifications_type_check" },
    });
    const caller = createTestCaller({ userId: CREATOR, supabase });
    if (!caller) return;

    await expect(caller.groups.invite({ challengeId: CH, userId: INVITEE })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send invite notification.",
    });
    const notificationTypes = inserts
      .filter((i) => i.table === "in_app_notifications")
      .map((i) => (i.row as { type?: string }).type);
    expect(notificationTypes).toEqual(["challenge_invite"]);
  });
});

describe("groups.respond", () => {
  it("accept enrolls the invitee", async () => {
    const { supabase, inserts, updates } = createMockSupabase({
      viewerIsMember: false,
      enrolledCount: 1,
      pendingCount: 1,
      existingInvite: {
        id: INVITE,
        challenge_id: CH,
        invited_by: CREATOR,
        invited_user_id: INVITEE,
        status: "pending",
      },
    });
    const caller = createTestCaller({ userId: INVITEE, supabase });
    if (!caller) return;

    const result = await caller.groups.respond({ inviteId: INVITE, action: "accept" });
    expect(result.status).toBe("accepted");

    const memberInsert = inserts.find((i) => i.table === "challenge_members")?.row as {
      user_id?: string;
      role?: string;
    };
    expect(memberInsert).toMatchObject({ user_id: INVITEE, role: "member" });

    const enrollment = inserts.find((i) => i.table === "active_challenges")?.row as {
      user_id?: string;
    };
    expect(enrollment?.user_id).toBe(INVITEE);

    expect(updates.some((u) => u.table === "challenge_invites")).toBe(true);
  });

  it("refuses a non-invitee with FORBIDDEN", async () => {
    const { supabase } = createMockSupabase({
      existingInvite: {
        id: INVITE,
        challenge_id: CH,
        invited_by: CREATOR,
        invited_user_id: INVITEE,
        status: "pending",
      },
    });
    const caller = createTestCaller({ userId: OTHER, supabase });
    if (!caller) return;

    await expect(caller.groups.respond({ inviteId: INVITE, action: "accept" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("groups.members", () => {
  it("adds yesterdayState and names who broke the group streak", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T15:00:00.000Z"));
    const { supabase } = createMockSupabase({
      viewerIsMember: true,
      memberRows: [
        { user_id: CREATOR, role: "creator", status: "active", joined_at: "2026-09-13T00:00:00.000Z" },
        { user_id: INVITEE, role: "member", status: "active", joined_at: "2026-09-13T00:00:00.000Z" },
      ],
      profileRows: [
        {
          user_id: CREATOR,
          display_name: "Ada",
          username: "ada",
          timezone: "UTC",
          reminder_timezone: "UTC",
          avatar_url: null,
        },
        {
          user_id: INVITEE,
          display_name: "Bea",
          username: "bea",
          timezone: "UTC",
          reminder_timezone: "UTC",
          avatar_url: null,
        },
      ],
      daySecureRows: [
        { user_id: CREATOR, date_key: "2026-09-13" },
        { user_id: CREATOR, date_key: "2026-09-14" },
        { user_id: INVITEE, date_key: "2026-09-13" },
        { user_id: INVITEE, date_key: "2026-09-14" },
        { user_id: INVITEE, date_key: "2026-09-15" },
      ],
    });
    const caller = createTestCaller({ userId: CREATOR, supabase });
    if (!caller) return;
    const result = await caller.groups.members({ challengeId: CH });
    expect(result.groupStreakBrokeBy).toBe("Ada");
    expect(result.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: CREATOR, yesterdayState: "missed" }),
        expect.objectContaining({ userId: INVITEE, yesterdayState: "secured" }),
      ]),
    );
    vi.useRealTimers();
  });
});

describe("groups.openLink", () => {
  it("inserts the self-invite with the service-role client", async () => {
    serviceInserts.length = 0;
    const { supabase, inserts } = createMockSupabase({
      viewerIsMember: false,
      enrolledCount: 1,
      pendingCount: 0,
      existingInvite: null,
    });
    const caller = createTestCaller({ userId: INVITEE, supabase });
    if (!caller) return;

    const result = await caller.groups.openLink({ challengeId: CH });
    expect("invite" in result && result.invite.status).toBe("pending");
    expect(serviceInserts.some((i) => i.table === "challenge_invites")).toBe(true);
    const row = serviceInserts.find((i) => i.table === "challenge_invites")?.row as {
      invited_by?: string;
      invited_user_id?: string;
      status?: string;
    };
    expect(row).toMatchObject({
      invited_by: CREATOR,
      invited_user_id: INVITEE,
      status: "pending",
    });
    expect(inserts.some((i) => i.table === "challenge_invites")).toBe(false);
  });
});
