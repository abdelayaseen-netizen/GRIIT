import { describe, expect, it } from "vitest";
import {
  afterAcceptActiveId,
  challengeInviteFromNotification,
  challengeInviteLine,
  detailFooterVariant,
  invitedFooterNetwork,
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

describe("detail footer by viewerInviteStatus", () => {
  it("is invited when pending", () => {
    expect(
      detailFooterVariant({
        viewerInviteStatus: "pending",
        participationType: "team",
        state: "default",
      }),
    ).toBe("invited");
  });

  it("is invite_only for team with no invite", () => {
    expect(
      detailFooterVariant({
        viewerInviteStatus: "none",
        participationType: "team",
        state: "default",
      }),
    ).toBe("invite_only");
  });

  it("keeps Join for solo", () => {
    expect(
      detailFooterVariant({
        viewerInviteStatus: null,
        participationType: "solo",
        state: "default",
      }),
    ).toBe("join");
  });
});

describe("Accept and Not now", () => {
  it("Accept navigates with result.id or the enrollment id", () => {
    expect(afterAcceptActiveId({ id: "ac-1" }, [], "ch-1")).toBe("ac-1");
    expect(
      afterAcceptActiveId({ status: "accepted" } as { id?: string }, [{ challenge_id: "ch-1", id: "ac-9" }], "ch-1"),
    ).toBe("ac-9");
  });

  it("Not now makes no network call", () => {
    expect(invitedFooterNetwork("not_now")).toBe("none");
    expect(invitedFooterNetwork("accept")).toBe("respond_accept");
    expect(invitedFooterNetwork("decline")).toBe("respond_decline");
  });
});
