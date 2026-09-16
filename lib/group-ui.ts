/** Group challenges copy and row state. Tables in 02_screens.md frames 34–38. */

export const GROUP_CAP = 10;

export const GROUP_INVITE_ONLY_CAPTION = "Invite only. Ask a member for an invite.";

export type MemberTrailing =
  | "invite"
  | "invited"
  | "in"
  | "secured"
  | "not_yet"
  | "cancel";

export type TrailingTone = "brand" | "secondary" | "muted";

export function ofTen(n: number): string {
  return `${n} of ${GROUP_CAP}`;
}

export function groupSocialLine(n: number): string {
  return `${n} of ${GROUP_CAP} in this group`;
}

export function membersInGroupLabel(n: number): string {
  return `In this group · ${ofTen(n)}`;
}

export function groupSecuredTodayLine(securedToday: number, memberCount: number): string {
  return `${securedToday} of ${memberCount} secured today`;
}

export function memberStreakCaption(streak: number): string {
  if (streak <= 0) return "No streak yet";
  return streak === 1 ? "1 day streak" : `${streak} day streak`;
}

export function groupStreakUnit(n: number): string {
  return n === 1 ? "day" : "days";
}

export function memberTrailing(state: MemberTrailing, full?: boolean): { label: string; tone: TrailingTone } {
  switch (state) {
    case "invite":
      return { label: "Invite", tone: full ? "muted" : "brand" };
    case "invited":
      return { label: "Invited", tone: "secondary" };
    case "in":
      return { label: "In", tone: "secondary" };
    case "secured":
      return { label: "Secured today", tone: "brand" };
    case "not_yet":
      return { label: "Not yet today", tone: "secondary" };
    case "cancel":
      return { label: "Cancel", tone: "secondary" };
  }
}

export function challengeInviteLine(inviter: string, challenge: string): string {
  return `${inviter} invited you to ${challenge}`;
}

export function challengeInviteFromNotification(n: {
  body?: string | null;
  actorDisplayName?: string | null;
  actorUsername?: string | null;
  metadata?: Record<string, unknown>;
}): string {
  const body = (n.body ?? "").trim();
  if (body.includes("invited you to")) return body;
  const inviter = (n.actorDisplayName ?? n.actorUsername ?? "Someone").trim() || "Someone";
  const challenge = String(
    n.metadata?.challengeTitle ?? n.metadata?.challenge_title ?? n.metadata?.challenge_name ?? "a group",
  );
  return challengeInviteLine(inviter, challenge);
}

export function isChallengeInviteNotification(n: {
  type?: string;
  metadata?: Record<string, unknown>;
}): boolean {
  if (n.type === "challenge_invite") return true;
  return n.metadata?.type === "challenge_invite";
}

export function challengeIdFromInviteNotification(n: {
  metadata?: Record<string, unknown>;
}): string | null {
  const raw = n.metadata?.challengeId ?? n.metadata?.challenge_id;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export function inviteIdFromNotification(n: { metadata?: Record<string, unknown> }): string | null {
  const raw = n.metadata?.inviteId ?? n.metadata?.invite_id;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export type DetailFooterVariant = "join" | "invited" | "invite_only" | "closed" | "blocked";

export function detailFooterVariant(input: {
  viewerInviteStatus?: string | null;
  participationType: string;
  state: "default" | "free_limit" | "ended" | "not_live";
}): DetailFooterVariant {
  if (input.state === "ended" || input.state === "not_live") return "closed";
  if (input.state === "free_limit") return "blocked";
  if (input.viewerInviteStatus === "pending") return "invited";
  if (input.participationType === "team") return "invite_only";
  return "join";
}

export function invitedCaption(inviterName: string): string {
  return `${inviterName} invited you. Day 1 is the day you accept.`;
}

export function afterAcceptActiveId(respond: { id?: string }, enrollmentId?: string | null): string | null {
  if (typeof respond.id === "string" && respond.id.length > 0) return respond.id;
  if (enrollmentId) return enrollmentId;
  return null;
}

export type RosterMember = {
  userId: string;
  displayName: string;
  role: string;
  currentStreak: number;
  securedToday: boolean;
  joinedAt: string;
};

export function sortRoster(members: RosterMember[]): RosterMember[] {
  return [...members].sort((a, b) => {
    if (a.role === "creator" && b.role !== "creator") return -1;
    if (b.role === "creator" && a.role !== "creator") return 1;
    return b.currentStreak - a.currentStreak;
  });
}

export function pendingTrailing(isCreator: boolean): MemberTrailing {
  return isCreator ? "cancel" : "invited";
}

export type PickerRowState = "invite" | "invited" | "in";

export function pickerRowState(input: { enrolled: boolean; invited: boolean }): PickerRowState {
  if (input.enrolled) return "in";
  if (input.invited) return "invited";
  return "invite";
}

export function pickerCaption(n: number): string {
  return `People you follow, and people who follow you. ${ofTen(n)} in the group.`;
}

export function groupInviteShareMessage(title: string, url: string): string {
  return `${title} on GRIIT. Join me: ${url}`;
}

export type OpenLinkRoute =
  | { kind: "challenge"; challengeId: string; inviteId?: string }
  | { kind: "full" }
  | { kind: "ended" };

export function openLinkRoute(
  challengeId: string,
  result: { state?: "full" | "ended"; invite?: { id?: string; status?: string } },
): OpenLinkRoute {
  if (result.state === "full") return { kind: "full" };
  if (result.state === "ended") return { kind: "ended" };
  const inviteId = result.invite?.id;
  return { kind: "challenge", challengeId, inviteId };
}
