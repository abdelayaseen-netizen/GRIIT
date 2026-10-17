/**
 * Build 90 chunk 08: start a duo / shared-goal run when its last seat is taken.
 *
 * `start_team_challenge` (SQL) raises NOT_TEAM_CHALLENGE for `duo` and creates no
 * active_challenges even for `shared_goal`, so the join route used to swallow the error and
 * return `{ joined: true, runStatus: "active" }` with no enrollment: nobody ever got a Day 1.
 * This does the start in code: flip run_status, then enroll every active member through
 * `joinChallengeDirect` (same rows as a solo join: active_challenges, check_ins, streaks).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { ALREADY_IN_CHALLENGE_MESSAGE } from "./join-errors";
import { joinChallengeDirect, type JoinChallengeResult } from "./join-challenge";

export type StartWaitingRoomInput = {
  /** Service-role client: run_status is creator-only under RLS and the other member is not the caller. */
  service: SupabaseClient;
  challengeId: string;
  /** The person whose join filled the room; their enrollment is returned. */
  joinerId: string;
  log?: { warn: (obj: Record<string, unknown>, msg?: string) => void };
};

export type StartWaitingRoomResult = {
  started: boolean;
  joiner: JoinChallengeResult | null;
  enrolled: string[];
};

function isAlreadyIn(e: unknown): boolean {
  return e instanceof TRPCError && e.message === ALREADY_IN_CHALLENGE_MESSAGE;
}

export async function startWaitingRoom(input: StartWaitingRoomInput): Promise<StartWaitingRoomResult> {
  const { service, challengeId, joinerId } = input;
  const nowIso = new Date().toISOString();

  // Only the first caller flips the run; a second concurrent join sees zero rows and still enrolls.
  const { error: flipErr } = await service
    .from("challenges")
    .update({ run_status: "active", started_at: nowIso })
    .eq("id", challengeId)
    .eq("run_status", "waiting");
  if (flipErr) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not start the challenge." });
  }

  const { data: members, error: memErr } = await service
    .from("challenge_members")
    .select("user_id")
    .eq("challenge_id", challengeId)
    .eq("status", "active");
  if (memErr) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not start the challenge." });
  }
  const ids = [...new Set(((members ?? []) as { user_id: string }[]).map((m) => m.user_id))];
  if (!ids.includes(joinerId)) ids.push(joinerId);

  let joiner: JoinChallengeResult | null = null;
  const enrolled: string[] = [];
  for (const userId of ids) {
    try {
      const row = await joinChallengeDirect(service, userId, challengeId);
      enrolled.push(userId);
      if (userId === joinerId) joiner = row;
    } catch (e) {
      if (isAlreadyIn(e)) continue;
      if (userId === joinerId) throw e;
      input.log?.warn({ err: e, userId, challengeId }, "[start-waiting-room] member enrollment failed");
    }
  }
  return { started: true, joiner, enrolled };
}
