/**
 * Build 92 chunk 08.1: pure helpers for `app/invite/[code].tsx`.
 */
export type ResolvedInviteLink =
  | { found: false }
  | {
      found: true;
      code: string;
      challengeId: string;
      inviterId: string;
      inviterName: string;
      challengeName: string;
      participationType: string | null;
      outcome: "self" | "member" | "full" | "ended" | "open" | null;
    };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 6–16 alphanumerics that are not a challenge UUID (older links carried the UUID). */
export function isShortInviteCode(value: string): boolean {
  return /^[A-Za-z0-9]{6,16}$/.test(value) && !UUID.test(value);
}

/** `invite=1` plus whatever the link knew (inviter name, code, pending invite id, ref). */
export function inviteQueryFor(extra: Record<string, string | null | undefined>): string {
  const q = new URLSearchParams({ invite: "1" });
  for (const [k, v] of Object.entries(extra)) {
    if (typeof v === "string" && v.length > 0) q.set(k, v);
  }
  return q.toString();
}
