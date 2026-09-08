/** Leave / end-challenge rules. Creator cannot leave a team others depend on. */

export const CREATOR_LEAVE_BLOCKED_MESSAGE = "You cannot leave a challenge you created.";

/** Enrollment status written on solo-creator leave. Not a delete. */
export const SOLO_LEAVE_ACTIVE_STATUS = "abandoned" as const;

export type LeaveChallengeAction = "reject_creator" | "end_solo" | "leave_participant";

export function decideLeaveChallenge(input: {
  userId: string;
  creatorId?: string | null;
  participationType?: string | null;
}): { action: LeaveChallengeAction } {
  const isCreator = !!input.creatorId && input.creatorId === input.userId;
  const isSolo = (input.participationType ?? "solo") === "solo";
  if (isCreator && !isSolo) return { action: "reject_creator" };
  if (isCreator && isSolo) return { action: "end_solo" };
  return { action: "leave_participant" };
}
