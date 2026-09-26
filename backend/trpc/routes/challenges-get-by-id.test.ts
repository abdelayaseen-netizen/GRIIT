import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "../create-context";
import { challengesRouter } from "./challenges";
import { challengesJoinProcedures } from "./challenges-join";
import { PRIVATE_CHALLENGE_MESSAGE } from "../../lib/can-view-challenge";

const CREATOR = "11111111-1111-4111-8111-111111111111";
const INVITEE = "22222222-2222-4222-8222-222222222222";
const STRANGER = "33333333-3333-4333-8333-333333333333";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

type Access = {
  enrolled?: boolean;
  member?: boolean;
  invite?: boolean;
};

let current: {
  challenge: Record<string, unknown>;
  access: Access;
};

function accessClient() {
  return {
    from: (table: string) => {
      const chain: Record<string, unknown> = {};
      chain.select = () => chain;
      chain.eq = () => chain;
      chain.lte = () => chain;
      chain.gte = () => chain;
      chain.in = () => chain;
      chain.order = () => chain;
      chain.limit = () => chain;
      chain.insert = () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { user_id: STRANGER, username: "guest" }, error: null }),
        }),
      });
      chain.update = () => chain;
      chain.maybeSingle = () => {
        if (table === "profiles") {
          return Promise.resolve({
            data: { id: "p", user_id: STRANGER, username: "guest", subscription_status: "premium" },
            error: null,
          });
        }
        if (table === "challenges") {
          return Promise.resolve({ data: current.challenge, error: null });
        }
        if (table === "active_challenges") {
          return Promise.resolve({
            data: current.access.enrolled ? { id: "ac" } : null,
            error: null,
          });
        }
        if (table === "challenge_members") {
          return Promise.resolve({
            data: current.access.member ? { id: "mem" } : null,
            error: null,
          });
        }
        if (table === "challenge_invites") {
          return Promise.resolve({
            data: current.access.invite ? { id: "inv", status: "pending" } : null,
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };
      chain.single = () => {
        if (table === "challenges") {
          return Promise.resolve({ data: current.challenge, error: null });
        }
        return Promise.resolve({ data: null, error: { code: "PGRST116" } });
      };
      chain.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled, onRejected);
      return chain;
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
  };
}

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => accessClient(),
}));

function caller(userId: string | null) {
  return challengesRouter.createCaller({
    userId,
    supabase: accessClient() as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

function joinCaller(userId: string) {
  const router = createTRPCRouter({
    challenges: createTRPCRouter(challengesJoinProcedures),
  });
  return router.createCaller({
    userId,
    supabase: accessClient() as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

const privateSolo = {
  id: CH,
  title: "My private run",
  visibility: "PRIVATE",
  status: "published",
  creator_id: CREATOR,
  participation_type: "solo",
  challenge_tasks: [{ id: "t1", title: "Run", task_type: "manual", order_index: 0, config: {} }],
};

const friendsTeam = {
  id: CH,
  title: "Morning run club",
  visibility: "FRIENDS",
  status: "published",
  creator_id: CREATOR,
  participation_type: "team",
  run_status: "active",
  team_size: 10,
  challenge_tasks: [{ id: "t1", title: "Run 3 km", task_type: "manual", order_index: 0, config: {} }],
};

const publicCatalog = {
  id: CH,
  title: "75 Hard",
  visibility: "PUBLIC",
  status: "published",
  creator_id: null,
  participation_type: "solo",
  challenge_tasks: [{ id: "t1", title: "Workout", task_type: "manual", order_index: 0, config: {} }],
};

describe("challenges.getById access", () => {
  it("logged-out service-role path returns PUBLIC and refuses PRIVATE", async () => {
    current = { challenge: publicCatalog, access: {} };
    const open = await caller(null).getById({ id: CH });
    expect(open.title).toBe("75 Hard");

    current = { challenge: privateSolo, access: {} };
    await expect(caller(null).getById({ id: CH })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: PRIVATE_CHALLENGE_MESSAGE,
    } satisfies Partial<TRPCError>);
  });

  it("logged-in stranger cannot read PRIVATE; creator can", async () => {
    current = { challenge: privateSolo, access: {} };
    await expect(caller(STRANGER).getById({ id: CH })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: PRIVATE_CHALLENGE_MESSAGE,
    });
    const own = await caller(CREATOR).getById({ id: CH });
    expect(own.title).toBe("My private run");
  });

  it("invitee preview returns a FRIENDS challenge and its tasks", async () => {
    current = { challenge: friendsTeam, access: { invite: true } };
    const preview = await caller(INVITEE).getById({ id: CH });
    expect(preview.title).toBe("Morning run club");
    expect(preview.visibility).toBe("FRIENDS");
    expect(Array.isArray(preview.tasks)).toBe(true);
    expect((preview.tasks as { title?: string }[])[0]?.title).toBe("Run 3 km");
  });
});

describe("challenges.join PRIVATE", () => {
  it("refuses a non-creator", async () => {
    current = { challenge: privateSolo, access: {} };
    await expect(joinCaller(STRANGER).challenges.join({ challengeId: CH })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: PRIVATE_CHALLENGE_MESSAGE,
    });
  });
});
