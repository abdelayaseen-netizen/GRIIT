import { describe, expect, it } from "vitest";
import { DEEP_LINK_BASE_URL } from "@/lib/config";
import {
  challengeDeepLink,
  inviteDeepLink,
  joinMeOnGriitCode,
  profileDeepLink,
} from "@/lib/deep-links";
import { groupInviteShareMessage } from "@/lib/group-ui";
import {
  challengeCompleteShareText,
  challengeShareText,
  defaultInviteShareText,
  profileShareText,
} from "@/lib/share-copy";

function renderedShareInviteOutputs(): string[] {
  return [
    defaultInviteShareText(),
    defaultInviteShareText("GRIT42"),
    joinMeOnGriitCode("GRIT42"),
    groupInviteShareMessage("Morning run", "GRIT42"),
    challengeShareText({ name: "Dawn miles", duration: 30, tasksPerDay: 1 }),
    profileShareText({
      username: "yaseen",
      streak: 12,
      totalDaysSecured: 40,
      tier: "Iron",
    }),
    profileShareText({
      username: "yaseen",
      streak: 0,
      totalDaysSecured: 3,
      tier: "Spark",
    }),
    challengeCompleteShareText({
      name: "Dawn miles",
      duration: 30,
      daysCompleted: 30,
      isHardMode: true,
    }),
    inviteDeepLink("GRIT42"),
    inviteDeepLink("GRIT42", "user-1"),
    challengeDeepLink("ch-1"),
    profileDeepLink("yaseen"),
  ];
}

describe("share/invite copy", () => {
  it("does not default the web origin to griit.app", () => {
    expect(DEEP_LINK_BASE_URL).not.toBe("https://griit.app");
    expect(DEEP_LINK_BASE_URL ?? "").not.toContain("griit.app");
  });

  it("uses the app scheme when EXPO_PUBLIC_DEEP_LINK_BASE_URL is unset", () => {
    if (process.env.EXPO_PUBLIC_DEEP_LINK_BASE_URL) return;
    expect(inviteDeepLink("GRIT42")).toBe("griit://invite/GRIT42");
    expect(inviteDeepLink("GRIT42", "user-1")).toBe("griit://invite/GRIT42?ref=user-1");
    expect(challengeDeepLink("ch-1")).toBe("griit://challenge/ch-1");
    expect(profileDeepLink("yaseen")).toBe("griit://profile/yaseen");
  });

  it("invite copy is Join me on GRIIT · code {code}", () => {
    expect(defaultInviteShareText("GRIT42")).toBe("Join me on GRIIT · code GRIT42");
    expect(groupInviteShareMessage("Morning run", "GRIT42")).toBe("Join me on GRIIT · code GRIT42");
  });

  it("no string griit.app appears in any rendered share/invite output", () => {
    for (const output of renderedShareInviteOutputs()) {
      expect(output).not.toContain("griit.app");
    }
  });
});
