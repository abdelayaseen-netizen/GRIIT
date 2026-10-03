import { describe, expect, it } from "vitest";
import {
  ANYONE_WITH_THE_LINK,
  JUST_YOU_SO_FAR,
  PRIVATE_ONLY_YOU,
  enrollmentWeekDateKeys,
  freezeDetailCopy,
  peopleCardCopy,
  soloBoardCopy,
  weekSecuredOfDue,
} from "@/lib/g2a-challenge";

describe("enrollment week from start_at", () => {
  it("aligns the 7-day window to start_at, not Monday", () => {
    expect(enrollmentWeekDateKeys("2026-10-01", "2026-10-02")).toEqual([
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
    ]);
    expect(enrollmentWeekDateKeys("2026-10-01", "2026-10-09")[0]).toBe("2026-10-08");
  });

  it("counts today once it is secured", () => {
    const week = enrollmentWeekDateKeys("2026-10-01", "2026-10-02");
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
    expect(freezeDetailCopy({ remaining: 2, hardMode: false, timeZone: "UTC" }).title).toBe(
      "2 freezes left",
    );
    const used = freezeDetailCopy({
      remaining: 0,
      lastFreezeUsedAt: "2026-09-02T12:00:00.000Z",
      hardMode: false,
      timeZone: "UTC",
    });
    expect(used.title).toBe("0 freezes left");
    expect(used.caption).toContain("Next one on");
    expect(used.caption).toMatch(/October/);
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
});
