/**
 * Build 92 chunk 08 (server side): short invite codes and the public landing page.
 */
import { describe, expect, it } from "vitest";
import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  generateInviteCode,
  inviteOutcome,
  isInviteCode,
  renderInviteLanding,
  renderInviteNotFound,
  resolveInviteRow,
} from "./invite-codes";

describe("08.1 short invite codes", () => {
  it("uses a 62-character alphabet and at least 6 characters", () => {
    expect(INVITE_CODE_ALPHABET).toHaveLength(62);
    expect(new Set(INVITE_CODE_ALPHABET.split("")).size).toBe(62);
    expect(INVITE_CODE_LENGTH).toBeGreaterThanOrEqual(6);
    const code = generateInviteCode();
    expect(code).toHaveLength(INVITE_CODE_LENGTH);
    for (const ch of code) expect(INVITE_CODE_ALPHABET.includes(ch)).toBe(true);
  });

  it("does not repeat across many draws and is not a UUID", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i += 1) seen.add(generateInviteCode());
    expect(seen.size).toBe(2000);
    expect(isInviteCode(generateInviteCode())).toBe(true);
    expect(isInviteCode("e44f0001-4000-4000-8000-000000000001")).toBe(false);
    expect(isInviteCode("abc")).toBe(false);
    expect(isInviteCode("k7Q2pX")).toBe(true);
  });

  it("uses the injected random source, so storage can retry on a clash", () => {
    const zeros = () => 0;
    expect(generateInviteCode(zeros)).toBe(
      INVITE_CODE_ALPHABET[0]!.repeat(INVITE_CODE_LENGTH),
    );
  });

  it("maps a stored row back to the challenge and inviter", () => {
    const row = {
      challenge_id: "e44f0001-4000-4000-8000-000000000001",
      referrer_user_id: "u-inviter",
      invite_code: "k7Q2pXaa",
      source: "invite_link",
    };
    expect(resolveInviteRow(row)).toEqual({
      code: "k7Q2pXaa",
      challengeId: "e44f0001-4000-4000-8000-000000000001",
      inviterId: "u-inviter",
    });
    expect(resolveInviteRow(null)).toBeNull();
    expect(resolveInviteRow({ ...row, challenge_id: null })).toBeNull();
  });

  it("self-invite, full room, member, ended and open outcomes", () => {
    const base = {
      viewerId: "u-b",
      inviterId: "u-a",
      memberIds: ["u-a"],
      seats: 1,
      cap: 10,
      runStatus: "active" as string | null,
      participationType: "team" as string | null,
    };
    expect(inviteOutcome({ ...base, viewerId: "u-a" })).toBe("self");
    expect(inviteOutcome({ ...base, memberIds: ["u-a", "u-b"] })).toBe(
      "member",
    );
    expect(inviteOutcome({ ...base, seats: 10 })).toBe("full");
    expect(inviteOutcome({ ...base, runStatus: "ended" })).toBe("ended");
    expect(inviteOutcome(base)).toBe("open");
    // A public challenge has no seat cap and no run status to check.
    expect(
      inviteOutcome({
        ...base,
        participationType: "solo",
        seats: 500,
        runStatus: null,
      }),
    ).toBe("open");
  });
});

describe("08.2 landing page", () => {
  const input = {
    code: "k7Q2pXaa",
    challengeName: "Show Up 7",
    category: "Fitness",
    days: 7,
    people: 3,
    task: "Get to the gym",
    proofLine: "Proven with the camera, 6am to 10pm",
    inviterName: "Yaseen",
  };

  it("names the challenge, days, inviter and the App Store button", () => {
    const html = renderInviteLanding(input);
    expect(html).toContain("Yaseen invited you");
    expect(html).toContain("Show Up 7");
    expect(html).toContain("7 days");
    expect(html).toContain("3 people");
    expect(html).toContain("Get to the gym");
    expect(html).toContain("Get GRIIT on the App Store");
    expect(html).toContain("Already have GRIIT? Open it");
    expect(html).toContain("griit://invite/k7Q2pXaa");
    expect(html).not.toContain("griit://i/");
  });

  it("escapes HTML in names and pluralises", () => {
    const html = renderInviteLanding({
      ...input,
      challengeName: "<b>x</b>",
      days: 1,
      people: 1,
    });
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("1 day");
    expect(html).toContain("1 person");
  });

  it("unknown code is a friendly page", () => {
    const html = renderInviteNotFound();
    expect(html).toContain("This invite link");
    expect(html).toContain("Get GRIIT on the App Store");
  });
});
