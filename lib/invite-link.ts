/**
 * Build 90 chunk 08 → Build 92 chunk 08: the invite sheet (P2-14).
 * Links read `{INVITE_BASE_URL}/i/{code}`; the code comes from `invites.create`.
 * Pure helpers shared by create-success, the waiting room, the challenge board and Invite.
 */
import { INVITE_BASE_URL } from "@/lib/config";
import { inviteDeepLink } from "@/lib/deep-links";

export const INVITE_LINK_LABEL = "Invite link";
export const COPY_LINK_LABEL = "Copy link";
export const COPIED_LABEL = "Copied";
export const LINK_COPIED_TOAST = "Link copied.";
export const SHARE_LINK_LABEL = "Share";
export const COPIED_RESET_MS = 2000;

export const INVITE_SHEET_TITLE = "Invite friends";
export const INVITE_SHARE_LINE = "Join me. Day 1 is today.";
export const INVITE_LINK_FAILED = "Couldn't make the link. Try again.";

export function inviteSheetBody(challengeName: string): string {
  return `${challengeName} is ready. Invite people to start with you.`;
}

/** Full link for the share sheet and the clipboard. */
export function inviteUrlFor(code: string): string {
  return `${INVITE_BASE_URL}/i/${encodeURIComponent(code.trim())}`;
}

/** The link as the sheet prints it: host and path, no scheme. */
export function inviteDisplayLink(code: string): string {
  return inviteUrlFor(code).replace(/^https:\/\//, "");
}

/** The share sheet message: "Join me on {name}. Day 1 is today. {link}". */
export function inviteShareMessage(challengeName: string, code: string): string {
  return `Join me on ${challengeName}. Day 1 is today. ${inviteUrlFor(code)}`;
}

/** Day secured, first secured day of a challenge: the friend ask sits under the stats. */
export const INVITE_AFTER_FIRST_DAY_HEADING = "Day 1 is yours. Bring a friend.";
export const INVITE_AFTER_FIRST_DAY_BODY = "Their days count on the board from the day they join.";

/** Duo or shared-goal run with one seat still open. */
export const WAITING_FOR_PARTNER_HEADING = "Waiting for a partner.";
export const WAITING_FOR_PARTNER_BODY =
  "You're in. Day 1 starts for both of you the moment someone opens this link and joins.";

/** @deprecated Build 92 08.1: use `inviteUrlFor(code)`. Kept for the Day-secured block until it moves. */
export function inviteLinkFor(code: string, refUserId?: string | null): string {
  return inviteDeepLink(code, refUserId);
}

/**
 * The invite block shows on Day secured only after the first secured day of that challenge.
 * `challengeDone` is the secure_day RPC's `challenge_done`, which means "this challenge's
 * tasks are done for today", not "the challenge is over"; it is true on every secured day.
 * The challenge is over only when that lands on its last day (see `enrollmentFinished`).
 */
export function showInviteAfterSecured(input: {
  challengeDay: number | null | undefined;
  challengeLength?: number | null;
  daySecured: boolean;
  challengeDone?: boolean;
}): boolean {
  if (!input.daySecured) return false;
  if (input.challengeDay !== 1) return false;
  const finished =
    input.challengeDone === true &&
    typeof input.challengeLength === "number" &&
    input.challengeLength > 0 &&
    input.challengeLength === input.challengeDay;
  return !finished;
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
