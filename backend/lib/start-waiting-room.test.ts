/**
 * Build 90 chunk 08: a duo run starts when its last seat is taken, and both members get an
 * enrollment. Before this, the join route called the SQL start_team_challenge, which rejects
 * `duo`, and returned no enrollment.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { startWaitingRoom } from "./start-waiting-room";
import { ALREADY_IN_CHALLENGE_MESSAGE } from "./join-errors";

const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CREATOR = "11111111-1111-4111-8111-111111111111";
const JOINER = "22222222-2222-4222-8222-222222222222";

const joinDirect = vi.fn();
vi.mock("./join-challenge", () => ({
  joinChallengeDirect: (...args: unknown[]) => joinDirect(...args),
}));

function serviceStub(members: string[]) {
  const updates: { table: string; row: Record<string, unknown>; eqs: Record<string, unknown> }[] = [];
  const from = (table: string) => {
    const eqs: Record<string, unknown> = {};
    const chain: Record<string, unknown> = {
      select: () => chain,
      update: (row: Record<string, unknown>) => {
        updates.push({ table, row, eqs });
        return chain;
      },
      eq: (col: string, val: unknown) => {
        eqs[col] = val;
        return chain;
      },
      then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
        const data = table === "challenge_members" ? members.map((user_id) => ({ user_id })) : null;
        return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
      },
    };
    return chain;
  };
  return { service: { from } as never, updates };
}

describe("startWaitingRoom (08 duo)", () => {
  it("flips run_status to active and enrolls every member, returning the joiner's row", async () => {
    joinDirect.mockReset();
    joinDirect.mockImplementation(async (_svc: unknown, userId: string) => ({
      id: `ac-${userId}`,
      user_id: userId,
      challenge_id: CH,
      status: "active",
      start_at: "2026-10-17T00:00:00.000Z",
      end_at: "2026-10-24T00:00:00.000Z",
      first_task: { id: "task-1", title: "Walk", task_type: "check_off", config: null, require_photo: null, min_duration_minutes: null, duration_minutes: null },
    }));
    const { service, updates } = serviceStub([CREATOR, JOINER]);
    const result = await startWaitingRoom({ service, challengeId: CH, joinerId: JOINER });
    expect(updates[0]).toMatchObject({
      table: "challenges",
      row: { run_status: "active" },
      eqs: { id: CH, run_status: "waiting" },
    });
    expect(typeof updates[0]?.row.started_at).toBe("string");
    expect(joinDirect).toHaveBeenCalledTimes(2);
    expect(result.enrolled.sort()).toEqual([CREATOR, JOINER].sort());
    expect(result.joiner?.id).toBe(`ac-${JOINER}`);
    expect(result.joiner?.first_task?.id).toBe("task-1");
  });

  it("skips a member who is already enrolled and still returns the joiner", async () => {
    joinDirect.mockReset();
    joinDirect.mockImplementation(async (_svc: unknown, userId: string) => {
      if (userId === CREATOR) throw new TRPCError({ code: "BAD_REQUEST", message: ALREADY_IN_CHALLENGE_MESSAGE });
      return { id: `ac-${userId}`, user_id: userId, challenge_id: CH, status: "active", start_at: "", end_at: "" };
    });
    const { service } = serviceStub([CREATOR, JOINER]);
    const result = await startWaitingRoom({ service, challengeId: CH, joinerId: JOINER });
    expect(result.enrolled).toEqual([JOINER]);
    expect(result.joiner?.id).toBe(`ac-${JOINER}`);
  });

  it("enrolls the joiner even when the member list has not caught up", async () => {
    joinDirect.mockReset();
    joinDirect.mockImplementation(async (_svc: unknown, userId: string) => ({
      id: `ac-${userId}`, user_id: userId, challenge_id: CH, status: "active", start_at: "", end_at: "",
    }));
    const { service } = serviceStub([CREATOR]);
    const result = await startWaitingRoom({ service, challengeId: CH, joinerId: JOINER });
    expect(result.enrolled.sort()).toEqual([CREATOR, JOINER].sort());
  });

  it("a failed joiner enrollment is the caller's error (the other member's failure is only logged)", async () => {
    joinDirect.mockReset();
    joinDirect.mockImplementation(async (_svc: unknown, userId: string) => {
      if (userId === JOINER) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "boom" });
      return { id: `ac-${userId}`, user_id: userId, challenge_id: CH, status: "active", start_at: "", end_at: "" };
    });
    const { service } = serviceStub([CREATOR, JOINER]);
    await expect(startWaitingRoom({ service, challengeId: CH, joinerId: JOINER })).rejects.toMatchObject({ message: "boom" });
  });
});

describe("challenges.join waiting room wiring (08 duo, source)", () => {
  it("the join route no longer calls the SQL start_team_challenge for a full duo room", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/challenges-join.ts"), "utf8");
    expect(src).not.toMatch(/rpc\("start_team_challenge"/);
    expect(src).toMatch(/startWaitingRoom\(/);
  });
  it("the SQL start rejects duo (why the route cannot use it)", () => {
    const sql = readFileSync(
      resolve(__dirname, "../../supabase/migrations/20250312000001_team_challenge_rpcs.sql"),
      "utf8",
    );
    expect(sql).toMatch(/participation_type NOT IN \('team', 'shared_goal'\)/);
  });
});
