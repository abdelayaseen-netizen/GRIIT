import { describe, expect, it } from "vitest";
import {
  afterAcceptActiveId,
  challengeInviteFromNotification,
  challengeInviteLine,
  detailFooterVariant,
  invitedFooterNetwork,
  memberStreakCaption,
  memberTrailing,
  groupInviteShareMessage,
  openLinkRoute,
  pendingTrailing,
  pickerRowState,
  showInvitedSection,
  sortRoster,
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

describe("roster", () => {
  const a = {
    userId: "a",
    displayName: "A",
    role: "member",
    currentStreak: 4,
    securedToday: true,
    joinedAt: "2026-01-02",
  };
  const creator = {
    userId: "c",
    displayName: "Creator",
    role: "creator",
    currentStreak: 1,
    securedToday: false,
    joinedAt: "2026-01-01",
  };
  const b = {
    userId: "b",
    displayName: "B",
    role: "member",
    currentStreak: 9,
    securedToday: false,
    joinedAt: "2026-01-03",
  };

  it("orders creator first, then streak descending", () => {
    expect(sortRoster([a, b, creator]).map((m) => m.userId)).toEqual(["c", "b", "a"]);
  });

  it("selects streak captions", () => {
    expect(memberStreakCaption(0)).toBe("No streak yet");
    expect(memberStreakCaption(3)).toBe("3 day streak");
  });

  it("hides Invited section when none", () => {
    expect(showInvitedSection(0)).toBe(false);
    expect(showInvitedSection(2)).toBe(true);
  });

  it("creator vs member trailing on pending rows", () => {
    expect(pendingTrailing(true)).toBe("cancel");
    expect(pendingTrailing(false)).toBe("invited");
    expect(memberTrailing(pendingTrailing(true))).toEqual({ label: "Cancel", tone: "secondary" });
    expect(memberTrailing(pendingTrailing(false))).toEqual({ label: "Invited", tone: "secondary" });
  });
});

describe("invite picker", () => {
  it("row state machine is invite → invited / in", () => {
    expect(pickerRowState({ enrolled: false, invited: false })).toBe("invite");
    expect(pickerRowState({ enrolled: false, invited: true })).toBe("invited");
    expect(pickerRowState({ enrolled: true, invited: true })).toBe("in");
    expect(pickerRowState({ enrolled: true, invited: false })).toBe("in");
  });

  it("share message is {title} on GRIIT. Join me: {url}", () => {
    expect(groupInviteShareMessage("Morning run", "https://griit.fit/invite/abc")).toBe(
      "Morning run on GRIIT. Join me: https://griit.fit/invite/abc",
    );
  });

  it("openLink routes by state", () => {
    expect(openLinkRoute("ch-1", { state: "full" })).toEqual({ kind: "full" });
    expect(openLinkRoute("ch-1", { state: "ended" })).toEqual({ kind: "ended" });
    expect(openLinkRoute("ch-1", { invite: { id: "inv-1", status: "pending" } })).toEqual({
      kind: "challenge",
      challengeId: "ch-1",
      inviteId: "inv-1",
    });
  });
});
