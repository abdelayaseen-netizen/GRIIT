/**
 * Build 92 chunk 08 (app side): invite links and sheet copy, accept copy, leaderboard ties and
 * the connections rows in Settings. Code generation and the landing page: backend/lib/invite-codes.test.ts.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  COPY_LINK_LABEL,
  INVITE_SHARE_LINE,
  INVITE_SHEET_TITLE,
  LINK_COPIED_TOAST,
  inviteDisplayLink,
  inviteSheetBody,
  inviteShareMessage,
  inviteUrlFor,
} from "./invite-link";
import { INVITE_BASE_URL } from "./config";
import { acceptCtaLabel, invitedCaption, ACCEPT_NOT_NOW } from "./group-ui";
import {
  boardRowLine,
  rankBoard,
  boardEmptyState,
  BOARD_YOU,
} from "./challenge-board";
import {
  APPLE_HEALTH_ROW,
  PRO_PERKS,
  PRO_PERK_SUBS,
  PRO_PERKS_TAG,
  stravaSettingsRow,
  stravaConnectedSub,
} from "./settings-rows";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("08.1 invite links read {INVITE_BASE_URL}/i/{code}", () => {
  it("builds the link and the shorter display form", () => {
    expect(INVITE_BASE_URL.startsWith("https://")).toBe(true);
    expect(inviteUrlFor("k7Q2pXaa")).toBe(`${INVITE_BASE_URL}/i/k7Q2pXaa`);
    expect(inviteDisplayLink("k7Q2pXaa")).toBe(
      `${INVITE_BASE_URL.replace(/^https:\/\//, "")}/i/k7Q2pXaa`,
    );
    expect(inviteUrlFor("k7Q2pXaa")).not.toContain("griit://");
  });

  it("share message is the handoff line plus the link", () => {
    expect(INVITE_SHARE_LINE).toBe("Join me. Day 1 is today.");
    expect(inviteShareMessage("Show Up 7", "k7Q2pXaa")).toBe(
      `Join me on Show Up 7. Day 1 is today. ${INVITE_BASE_URL}/i/k7Q2pXaa`,
    );
  });

  it("invite sheet copy (P2-14)", () => {
    expect(INVITE_SHEET_TITLE).toBe("Invite friends");
    expect(inviteSheetBody("Show Up 7")).toBe(
      "Show Up 7 is ready. Invite people to start with you.",
    );
    expect(COPY_LINK_LABEL).toBe("Copy link");
    expect(LINK_COPIED_TOAST).toBe("Link copied.");
  });

  it("no griit://i/ string is rendered or shared by the UI", () => {
    const roots = ["app", "components", "lib"];
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          walk(p);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(name) || /\.test\.tsx?$/.test(name)) continue;
        const text = readFileSync(p, "utf8");
        if (text.includes("://i/")) hits.push(p);
      }
    };
    for (const r of roots) walk(resolve(__dirname, "..", r));
    expect(hits).toEqual([]);
  });
});

describe("08.4 accept copy (P2-19)", () => {
  it("group room accepts, public joins, both offer Not now", () => {
    expect(acceptCtaLabel("team")).toBe("Accept · Day 1 is today");
    expect(acceptCtaLabel("duo")).toBe("Accept · Day 1 is today");
    expect(acceptCtaLabel("solo")).toBe("Join · Day 1 is today");
    expect(ACCEPT_NOT_NOW).toBe("Not now");
    expect(invitedCaption("Yaseen")).toBe("Yaseen invited you");
  });

  it("the challenge page never shows Ask to join", () => {
    const text =
      read("components/challenge/ChallengeDetailV3.tsx") +
      read("app/challenge/[id].tsx");
    expect(text).not.toContain("Ask to join");
    expect(text).toContain("acceptCtaLabel(");
  });
});

describe("08.5 leaderboard", () => {
  const m = (
    userId: string,
    secured: number,
    verified: number,
    last: string,
    name = userId,
  ) => ({
    userId,
    displayName: name,
    username: name,
    avatarUrl: null,
    secured,
    verified,
    lastSecuredAt: last,
  });

  it("ties go to more verified days, then whoever secured earlier", () => {
    const ranked = rankBoard(
      [
        m("late", 3, 1, "2026-10-17T20:00:00Z"),
        m("early", 3, 1, "2026-10-17T07:00:00Z"),
        m("verified", 3, 2, "2026-10-17T21:00:00Z"),
        m("top", 5, 0, "2026-10-17T22:00:00Z"),
      ],
      "early",
    );
    expect(ranked.map((r) => r.userId)).toEqual([
      "top",
      "verified",
      "early",
      "late",
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
    expect(ranked.find((r) => r.userId === "early")?.you).toBe(true);
  });

  it("row line reads secured of 7 and the verified count; own row says You", () => {
    expect(boardRowLine(3, 2)).toBe("3 of 7 · 2 verified");
    expect(boardRowLine(1, 1)).toBe("1 of 7 · 1 verified");
    expect(boardRowLine(0, 0)).toBe("0 of 7");
    expect(BOARD_YOU).toBe("You");
  });

  it("the empty board invites", () => {
    const e = boardEmptyState(1, "Show Up 7");
    expect(e?.heading).toBe("A board needs two.");
    expect(e?.cta).toBe("Invite");
    expect(e?.body).toBe("Invite someone to see how you compare this week.");
    expect(boardEmptyState(2, "Show Up 7")).toBeNull();
  });
});

describe("08.6 settings connections (P2-20, P2-21)", () => {
  it("Strava row reads Connected as {name} with Disconnect, or Connect", () => {
    expect(stravaConnectedSub("yaseen")).toBe("Connected as yaseen");
    const on = stravaSettingsRow({
      flagOn: true,
      connected: true,
      name: "yaseen",
    });
    expect(on?.subtitle).toBe("Connected as yaseen");
    expect(on?.action).toBe("disconnect");
    expect(on?.actionLabel).toBe("Disconnect");
    const off = stravaSettingsRow({ flagOn: true, connected: false });
    expect(off?.action).toBe("connect");
    expect(off?.actionLabel).toBe("Connect");
    expect(
      stravaSettingsRow({ flagOn: false, connected: true, name: "x" }),
    ).toBeNull();
  });

  it("Apple Health is Coming soon and disabled; Pro perks carry the Pro tag", () => {
    expect(APPLE_HEALTH_ROW).toEqual({
      label: "Apple Health",
      sub: "Steps and workouts",
      badge: "Coming soon",
      enabled: false,
    });
    expect(PRO_PERKS).toEqual([
      "Auto-verify runs",
      "Extra freezes",
      "Stats",
      "Premium stickers",
    ]);
    // Copy table, word for word: only Extra freezes has a second line.
    expect(PRO_PERK_SUBS).toEqual({ "Extra freezes": "Hold up to 4 instead of 2" });
    expect(PRO_PERKS_TAG).toBe("Pro");
  });

  it("settings screen renders Apple Health and the perks", () => {
    const text = read("app/settings/index.tsx");
    expect(text).toContain("APPLE_HEALTH_ROW");
    expect(text).toContain("PRO_PERKS");
  });
});
