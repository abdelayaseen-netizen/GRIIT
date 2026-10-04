import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { inviteDeepLink } from "@/lib/deep-links";

describe("group invite link", () => {
  it("uses the existing invite deep link and no web domain", () => {
    const invite = readFileSync(resolve(process.cwd(), "app/challenge/[id]/invite.tsx"), "utf8");
    const active = readFileSync(
      resolve(process.cwd(), "app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(invite).toContain("inviteToChallenge");
    expect(active).toContain("inviteToChallenge");
    expect(invite).not.toContain("griit.app");
    expect(active).not.toContain("griit.app");
    expect(inviteDeepLink("abc")).toBe("griit://i/abc");
    expect(inviteDeepLink("abc")).not.toContain("griit.app");
  });
});
