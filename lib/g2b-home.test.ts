import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  caughtUpLine,
  defaultHomeFeedScope,
  homeDateCaption,
  inviteCardCopy,
  pickHomeInviteChallenge,
  showHomeInviteCard,
} from "@/lib/g2b-home";

describe("g2b home feed", () => {
  it("defaults to Everyone until 3 follows, then Following", () => {
    expect(defaultHomeFeedScope(0)).toBe("everyone");
    expect(defaultHomeFeedScope(2)).toBe("everyone");
    expect(defaultHomeFeedScope(3)).toBe("following");
    expect(defaultHomeFeedScope(3, "everyone")).toBe("everyone");
  });

  it("caught-up line uses post count and weekday", () => {
    expect(caughtUpLine(1, "Friday")).toBe("You're caught up. 1 post since Friday.");
    expect(caughtUpLine(4, "Monday")).toBe("You're caught up. 4 posts since Monday.");
  });

  it("invite card is only for a sole member after the first day is secured", () => {
    expect(inviteCardCopy("Crew")).toEqual({
      heading: "Invite one person to Crew",
      body: "You are the only one in it. People you invite join at Day 1 of their own run.",
      cta: "Share invite link",
    });
    expect(showHomeInviteCard({ soleMember: true, firstDaySecured: false })).toBe(false);
    expect(showHomeInviteCard({ soleMember: true, firstDaySecured: true })).toBe(true);
    expect(showHomeInviteCard({ soleMember: false, firstDaySecured: true })).toBe(false);
  });

  it("date caption is Weekday d Month", () => {
    expect(homeDateCaption(new Date(2026, 9, 2))).toMatch(/Friday 2 October/);
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toMatch(/dateCaption:\s*\{\s*fontSize:\s*17/);
  });

  it("picks the first active challenge and treats missing count as sole", () => {
    expect(pickHomeInviteChallenge([])).toBeNull();
    expect(pickHomeInviteChallenge([{ challenge_id: "c1", challenges: { id: "c1", title: "Iron man" } }])).toEqual({
      id: "c1",
      name: "Iron man",
      soleMember: true,
    });
    expect(
      pickHomeInviteChallenge([{ challenges: { id: "c2", title: "Crew", participants_count: 3 } }])?.soleMember,
    ).toBe(false);
  });
});
