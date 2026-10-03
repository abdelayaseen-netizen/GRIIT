import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { securedElapsed } from "@/lib/consistency";
import {
  activeChallengesAreHard,
  freezeChipCaption,
  formatSinceDate,
  securedSinceLine,
  securedSurfaces,
  showHomeFreezeChip,
} from "@/lib/secured-since";

describe("one secured header", () => {
  it("formats Sep 16 and builds the Home line from proofsHeader", () => {
    expect(formatSinceDate("2026-09-16")).toBe("Sep 16");
    const window = securedElapsed({
      dueDayKeys: [
        "2026-09-16",
        "2026-09-17",
        "2026-09-18",
        "2026-09-19",
        "2026-09-20",
        "2026-09-21",
        "2026-09-22",
        "2026-09-23",
        "2026-09-24",
        "2026-09-25",
        "2026-09-26",
        "2026-09-27",
        "2026-09-28",
        "2026-09-29",
        "2026-09-30",
      ],
      securedDateKeys: [
        "2026-09-16",
        "2026-09-24",
        "2026-09-25",
        "2026-09-26",
        "2026-09-27",
        "2026-09-28",
      ],
      todayKey: "2026-09-30",
    });
    const header = {
      secured: window.secured,
      days: window.elapsed,
      firstDueDate: window.firstDueDate,
      dueToday: window.dueToday,
    };
    expect(header).toEqual({
      secured: 6,
      days: 14,
      firstDueDate: "2026-09-16",
      dueToday: true,
    });
    const surfaces = securedSurfaces(header);
    expect(surfaces.home).toBe("6 of 14 days secured since Sep 16");
    expect(surfaces.profileSecured).toBe(header.secured);
    expect(surfaces.calendarSecured).toBe(header.secured);
    expect(surfaces.profileHeadline).toBe("6 of 14 days");
    expect(surfaces.calendarLine).toBe("of 14 days secured");
    expect(securedSinceLine(header)).toBe(surfaces.home);
  });

  it("Home, Profile, and calendar all read getRecord.header", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const profile = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    const grid = readFileSync(resolve(__dirname, "../components/profile/ConsistencyGrid.tsx"), "utf8");
    const record = readFileSync(
      resolve(__dirname, "../backend/trpc/routes/profiles-record.ts"),
      "utf8",
    );
    expect(record).toContain("proofsHeader");
    expect(home).toContain("securedSinceLine");
    expect(home).toContain("header");
    expect(home).not.toContain("consistencyFromDayArray");
    expect(profile).toContain("header.secured");
    expect(visitor).toContain("header.secured");
    expect(grid).toContain("header.secured");
    expect(grid).toContain("calendarHeaderLine(header)");
  });

  it("Home owns the live feed; Activity is Notifications and Leaderboard", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const homeV3 = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    const activity = readFileSync(resolve(__dirname, "../app/(tabs)/activity.tsx"), "utf8");
    expect(home).toContain("LiveFeedSection");
    expect(home).toContain("showInvite");
    expect(homeV3).not.toContain("SEE_ALL_IN_ACTIVITY");
    expect(homeV3).toContain("NO_CHALLENGE_YET");
    expect(activity).not.toContain("LiveFeedSection");
    expect(activity).not.toContain('"feed"');
    expect(activity).toContain("Notifications");
    expect(activity).toContain("Leaderboard");
  });

  it("hides the freeze chip at 0 and on Hard / No Days Off", () => {
    expect(showHomeFreezeChip(0, false)).toBe(false);
    expect(showHomeFreezeChip(1, true)).toBe(false);
    expect(showHomeFreezeChip(1, false)).toBe(true);
    expect(freezeChipCaption(1)).toBe("1 freeze");
    expect(freezeChipCaption(4)).toBe("4 freezes");
    expect(
      activeChallengesAreHard([{ challenges: { is_hard_mode: true, title: "No Days Off" } }]),
    ).toBe(true);
    expect(activeChallengesAreHard([{ challenges: { is_hard_mode: false, title: "75 Hard" } }])).toBe(
      false,
    );
    const homeV3 = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(homeV3).toContain("showFreezeChip");
    expect(homeV3).not.toContain("freeze left");
  });
});
