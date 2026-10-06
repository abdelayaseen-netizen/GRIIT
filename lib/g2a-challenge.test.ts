import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ANYONE_WITH_THE_LINK,
  JUST_YOU_SO_FAR,
  PRIVATE_ONLY_YOU,
  enrollmentWeekDateKeys,
  freezeDetailCopy,
  peopleCardCopy,
  soloBoardCopy,
  weekDayBeforeEnrollment,
  weekdayLetterForDateKey,
  weekSecuredOfDue,
} from "@/lib/g2a-challenge";

describe("enrollment week is Monday in the profile timezone", () => {
  it("uses the Monday–Sunday week that contains today", () => {
    expect(enrollmentWeekDateKeys("2026-10-02")).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    expect(enrollmentWeekDateKeys("2026-10-09")[0]).toBe("2026-10-05");
    expect(weekDayBeforeEnrollment("2026-09-29", "2026-10-03")).toBe(true);
    expect(weekDayBeforeEnrollment("2026-10-03", "2026-10-03")).toBe(false);
    expect(weekdayLetterForDateKey("2026-10-04", "America/New_York")).toBe("S");
    expect(weekdayLetterForDateKey("2026-09-28", "America/New_York")).toBe("M");
  });

  it("counts today once it is secured", () => {
    const week = enrollmentWeekDateKeys("2026-10-02");
    const open = weekSecuredOfDue({
      weekKeys: week,
      securedDateKeys: ["2026-10-01"],
      todayKey: "2026-10-02",
      startDateKey: "2026-10-01",
      durationDays: 30,
      todaySecured: false,
    });
    expect(open).toMatchObject({ secured: 1, due: 2, line: "1 of 2 days" });
    const closed = weekSecuredOfDue({ ...open, weekKeys: week, securedDateKeys: ["2026-10-01"], todayKey: "2026-10-02", startDateKey: "2026-10-01", durationDays: 30, todaySecured: true });
    expect(closed.line).toBe("2 of 2 days");
  });
});

describe("freeze and people copy", () => {
  it("hard mode has no freezes; remaining uses the 30-day refill", () => {
    expect(freezeDetailCopy({ remaining: 1, hardMode: true, timeZone: "UTC" })).toMatchObject({
      title: "No freezes",
      icon: "shield-off",
    });
    expect(freezeDetailCopy({ remaining: 2, hardMode: false, timeZone: "UTC" })).toMatchObject({
      title: "Use a freeze",
      caption: "A freeze can hold it until midnight. 2 left.",
    });
    const used = freezeDetailCopy({
      remaining: 0,
      lastFreezeUsedAt: "2026-09-02T12:00:00.000Z",
      hardMode: false,
      timeZone: "UTC",
    });
    expect(used.title).toBe("No freezes left. Your streak resets to 0 at midnight.");
    expect(used.caption).toBe(used.title);
  });

  it("private/solo has no invite; one member is Just you so far", () => {
    expect(peopleCardCopy({ memberCount: 1, privateOrSolo: true, challengeTitle: "Crew" })).toEqual({
      heading: PRIVATE_ONLY_YOU,
      body: "",
      showInvite: false,
      inviteLabel: "",
    });
    const solo = peopleCardCopy({ memberCount: 1, privateOrSolo: false, challengeTitle: "Crew" });
    expect(solo.heading).toBe(JUST_YOU_SO_FAR);
    expect(solo.body).toBe(ANYONE_WITH_THE_LINK);
    expect(solo.inviteLabel).toBe("Invite to Crew");
    expect(soloBoardCopy("Crew")).toMatchObject({
      heading: "A board needs two.",
      picker: "Just you",
      cta: "Invite to Crew",
    });
  });

  it("a solo challenge board is only the invite empty state", () => {
    const tab = readFileSync(
      resolve(__dirname, "../components/activity/LeaderboardTab.tsx"),
      "utf8",
    );
    expect(tab).toContain("soloChallenge");
    expect(tab).toContain("showRows");
    expect(tab).not.toContain('label="Just you"');
    expect(tab).toContain("boardEmptyState");
  });
});
