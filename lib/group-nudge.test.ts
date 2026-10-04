import { describe, expect, it } from "vitest";
import {
  groupPushAllowed,
  groupPushSend,
  isNudgeRow,
  nudgeBlocked,
  nudgeMessage,
} from "@/lib/group-nudge";

describe("group nudge", () => {
  it("allows one of three lines and blocks self, outsiders, secured, and repeats", () => {
    expect(nudgeMessage(1)).toBe("Don't break the chain.");
    expect(nudgeMessage(3)).toBeNull();
    expect(
      nudgeBlocked({
        senderId: "a",
        recipientId: "a",
        sameChallenge: true,
        recipientSecured: false,
        alreadyNudged: false,
        messageKey: 1,
      }),
    ).toBe("You can't nudge yourself.");
    expect(
      nudgeBlocked({
        senderId: "a",
        recipientId: "b",
        sameChallenge: false,
        recipientSecured: false,
        alreadyNudged: false,
        messageKey: 1,
      }),
    ).toMatch(/this challenge/);
    expect(
      nudgeBlocked({
        senderId: "a",
        recipientId: "b",
        sameChallenge: true,
        recipientSecured: true,
        alreadyNudged: false,
        messageKey: 1,
      }),
    ).toMatch(/secured/);
    expect(
      nudgeBlocked({
        senderId: "a",
        recipientId: "b",
        sameChallenge: true,
        recipientSecured: false,
        alreadyNudged: true,
        messageKey: 1,
      }),
    ).toMatch(/already nudged/);
    expect(
      nudgeBlocked({
        senderId: "a",
        recipientId: "b",
        sameChallenge: true,
        recipientSecured: false,
        alreadyNudged: false,
        messageKey: 1,
      }),
    ).toBeNull();
  });

  it("caps group pushes at two and matches a stored nudge row", () => {
    expect(groupPushAllowed(0)).toBe(true);
    expect(groupPushAllowed(2)).toBe(false);
    expect(groupPushSend("joined", { nudges: 0, joined: 0 })).toBe(true);
    expect(groupPushSend("joined", { nudges: 0, joined: 1 })).toBe(false);
    expect(groupPushSend("nudge", { nudges: 0, joined: 1 })).toBe(true);
    expect(groupPushSend("joined", { nudges: 1, joined: 0 })).toBe(true);
    expect(groupPushSend("nudge", { nudges: 1, joined: 1 })).toBe(false);
    expect(
      isNudgeRow(
        {
          actor_id: "a",
          metadata: { kind: "nudge", challenge_id: "c", date_key: "2026-10-03" },
        },
        "a",
        "c",
        "2026-10-03",
      ),
    ).toBe(true);
  });
});
