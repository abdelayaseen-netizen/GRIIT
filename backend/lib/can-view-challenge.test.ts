import { describe, expect, it } from "vitest";
import {
  canJoinPrivateChallenge,
  canViewChallenge,
  PRIVATE_CHALLENGE_MESSAGE,
} from "./can-view-challenge";

const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CREATOR = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

function accessClient(opts: {
  enrolled?: boolean;
  member?: boolean;
  invite?: boolean;
}) {
  return {
    from: (table: string) => {
      const chain: Record<string, unknown> = {};
      chain.select = () => chain;
      chain.eq = () => chain;
      chain.limit = () => chain;
      const hit =
        (table === "active_challenges" && opts.enrolled) ||
        (table === "challenge_members" && opts.member) ||
        (table === "challenge_invites" && opts.invite);
      chain.maybeSingle = () => Promise.resolve({ data: hit ? { id: "row" } : null, error: null });
      return chain;
    },
  };
}

describe("canViewChallenge", () => {
  it("allows anyone to read PUBLIC published", async () => {
    expect(
      await canViewChallenge(accessClient({}) as never, null, {
        id: CH,
        visibility: "PUBLIC",
        status: "published",
      }),
    ).toBe(true);
  });

  it("hides PRIVATE from logged-out and strangers", async () => {
    const row = { id: CH, visibility: "PRIVATE", status: "published", creator_id: CREATOR };
    expect(await canViewChallenge(accessClient({}) as never, null, row)).toBe(false);
    expect(await canViewChallenge(accessClient({}) as never, OTHER, row)).toBe(false);
  });

  it("allows the creator, a member, or a pending invitee", async () => {
    const row = { id: CH, visibility: "FRIENDS", status: "published", creator_id: CREATOR };
    expect(await canViewChallenge(accessClient({}) as never, CREATOR, row)).toBe(true);
    expect(await canViewChallenge(accessClient({ enrolled: true }) as never, OTHER, row)).toBe(true);
    expect(await canViewChallenge(accessClient({ member: true }) as never, OTHER, row)).toBe(true);
    expect(await canViewChallenge(accessClient({ invite: true }) as never, OTHER, row)).toBe(true);
  });
});

describe("canJoinPrivateChallenge", () => {
  it("is creator-only for PRIVATE", () => {
    const row = { id: CH, visibility: "PRIVATE", creator_id: CREATOR };
    expect(canJoinPrivateChallenge(CREATOR, row)).toBe(true);
    expect(canJoinPrivateChallenge(OTHER, row)).toBe(false);
    expect(PRIVATE_CHALLENGE_MESSAGE).toBe("This challenge is private.");
  });
});
