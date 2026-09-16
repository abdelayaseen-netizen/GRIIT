import { describe, expect, it } from "vitest";
import {
  challengeInviteFromNotification,
  challengeInviteLine,
  memberTrailing,
} from "./group-ui";

describe("MemberRow trailing states", () => {
  it("roster trailing captions", () => {
    expect(memberTrailing("secured")).toEqual({ label: "Secured today", tone: "brand" });
    expect(memberTrailing("not_yet")).toEqual({ label: "Not yet today", tone: "secondary" });
    expect(memberTrailing("cancel")).toEqual({ label: "Cancel", tone: "secondary" });
    expect(memberTrailing("invited")).toEqual({ label: "Invited", tone: "secondary" });
  });

  it("picker trailing is a caption, not a button", () => {
    expect(memberTrailing("invite")).toEqual({ label: "Invite", tone: "brand" });
    expect(memberTrailing("invite", true)).toEqual({ label: "Invite", tone: "muted" });
    expect(memberTrailing("in")).toEqual({ label: "In", tone: "secondary" });
  });
});

describe("challenge invite notification copy", () => {
  it("is {inviter} invited you to {challenge}", () => {
    expect(challengeInviteLine("Abdel", "Morning run")).toBe("Abdel invited you to Morning run");
  });

  it("prefers the stored body when it already matches the table", () => {
    expect(
      challengeInviteFromNotification({
        body: "Yaseen invited you to Read 30 min",
        actorDisplayName: "Other",
        metadata: { challengeTitle: "Other title" },
      }),
    ).toBe("Yaseen invited you to Read 30 min");
  });
});
