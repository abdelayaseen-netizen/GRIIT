import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { inviteDeepLink } from "@/lib/deep-links";
import { INVITE_BASE_URL } from "@/lib/config";

describe("group invite link", () => {
  // Build 92 08.1/08.3: the invite screen shares through the InviteSheet (which calls
  // inviteToChallenge) and the link is `{INVITE_BASE_URL}/i/{code}`, never a griit:// link.
  it("shares through inviteToChallenge with the INVITE_BASE_URL link and no griit.app", () => {
    const invite = readFileSync(resolve(process.cwd(), "app/challenge/[id]/invite.tsx"), "utf8");
    const sheet = readFileSync(resolve(process.cwd(), "components/InviteSheet.tsx"), "utf8");
    const active = readFileSync(
      resolve(process.cwd(), "app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(invite).toContain("InviteSheet");
    expect(sheet).toContain("inviteToChallenge");
    expect(active).toContain("inviteToChallenge");
    expect(invite).not.toContain("griit.app");
    expect(active).not.toContain("griit.app");
    expect(inviteDeepLink("abc")).toBe(`${INVITE_BASE_URL}/i/abc`);
    expect(inviteDeepLink("abc")).not.toContain("griit://");
    expect(inviteDeepLink("abc")).not.toContain("griit.app");
  });
});
