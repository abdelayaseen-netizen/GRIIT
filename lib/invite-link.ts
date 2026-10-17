/**
 * Build 90 chunk 08: the invite link as visible text, with Copy and Share.
 * Pure helpers shared by create-success, Day secured, the challenge board and Discover search.
 */
import { inviteDeepLink } from "@/lib/deep-links";

export const INVITE_LINK_LABEL = "Invite link";
export const COPY_LINK_LABEL = "Copy";
export const COPIED_LABEL = "Copied";
export const SHARE_LINK_LABEL = "Share";
export const COPIED_RESET_MS = 2000;

/** Day secured, first secured day of a challenge: the friend ask sits under the stats. */
export const INVITE_AFTER_FIRST_DAY_HEADING = "Day 1 is yours. Bring a friend.";
export const INVITE_AFTER_FIRST_DAY_BODY = "Their days count on the board from the day they join.";

/** Duo or shared-goal run with one seat still open. */
export const WAITING_FOR_PARTNER_HEADING = "Waiting for a partner.";
export const WAITING_FOR_PARTNER_BODY =
  "You're in. Day 1 starts for both of you the moment someone opens this link and joins.";

/** The invite code is the challenge id; the link is griit://i/<id> (or the web base when set). */
export function inviteLinkFor(challengeId: string, refUserId?: string | null): string {
  return inviteDeepLink(challengeId, refUserId);
}

/** The invite block shows on Day secured only after the first secured day of that challenge. */
export function showInviteAfterSecured(input: {
  challengeDay: number | null | undefined;
  daySecured: boolean;
  challengeDone?: boolean;
}): boolean {
  if (!input.daySecured) return false;
  if (input.challengeDone) return false;
  return input.challengeDay === 1;
}

/** Still-waiting join result: `{ joined: true, runStatus: "waiting" }` with no enrollment id. */
export function joinLeftWaitingRoom(
  result: { id?: string | null; joined?: boolean; runStatus?: string | null } | null | undefined,
): boolean {
  if (!result) return false;
  if (typeof result.id === "string" && result.id.length > 0) return false;
  return result.joined === true && result.runStatus === "waiting";
}

/** A member of a duo / shared-goal run that has not started yet sees the waiting room, not Join. */
export function viewerInWaitingRoom(input: {
  participationType: string | null | undefined;
  runStatus: string | null | undefined;
  viewerId: string | null | undefined;
  memberIds: readonly string[];
}): boolean {
  if (!input.viewerId) return false;
  if (input.participationType !== "duo" && input.participationType !== "shared_goal") return false;
  if (input.runStatus !== "waiting") return false;
  return input.memberIds.includes(input.viewerId);
}
