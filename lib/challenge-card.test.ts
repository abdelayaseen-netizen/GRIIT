import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  challengeLine,
  dueForStrip,
  stripSegments,
  STRIP_MAX,
  todayChip,
  type Seg,
} from "@/lib/challenge-card";
import { compact } from "@/lib/profile-header";

describe("compact counts", () => {
  it("prints under 10,000 in full and 10,000+ as K", () => {
    expect(compact(0)).toBe("0");
    expect(compact(9999)).toBe("9,999");
    expect(compact(10000)).toBe("10K");
    expect(compact(12500)).toBe("12.5K");
    expect(compact(10100)).toBe("10.1K");
  });
});

describe("challengeLine and todayChip", () => {
  it("covers active, finished, left, failed, and tomorrow", () => {
    expect(
      challengeLine({ status: "active", dayN: 12, durationDays: 75, secured: 10, range: "Sep 1 to Nov 14" }),
    ).toBe("Day 12 of 75 · Sep 1 to Nov 14");
    expect(
      challengeLine({
        status: "completed",
        dayN: 75,
        durationDays: 75,
        secured: 68,
        range: "Jul 1 to Sep 13",
      }),
    ).toBe("Finished · 68 of 75 days · Jul 1 to Sep 13");
    expect(
      challengeLine({ status: "abandoned", dayN: 9, durationDays: 75, secured: 8, range: "Sep 1 to Sep 9" }),
    ).toBe("Left on day 9 · Sep 1 to Sep 9");
    expect(
      challengeLine({ status: "failed", dayN: 4, durationDays: 14, secured: 3, range: "Sep 1 to Sep 4" }),
    ).toBe("Ended on day 4 · Sep 1 to Sep 4");
    expect(
      challengeLine({
        status: "active",
        dayN: 1,
        durationDays: 14,
        secured: 0,
        range: "Oct 2 to Oct 15",
        startsTomorrow: true,
        startDate: "Oct 2",
      }),
    ).toBe("Day 1 is Oct 2 · Oct 2 to Oct 15");
    expect(todayChip({ status: "active", securedToday: true })).toBe("Secured today");
    expect(todayChip({ status: "active", tasksLeft: 1 })).toBe("1 task left");
    expect(todayChip({ status: "active", tasksLeft: 3 })).toBe("3 tasks left");
    expect(todayChip({ status: "active", startsTomorrow: true })).toBe("Starts tomorrow");
    expect(dueForStrip(5, false)).toBe(4);
    expect(dueForStrip(5, true)).toBe(5);
  });
});

describe("ProgressStrip cap", () => {
  it("never shows more than 14 segments and takes the last 14 up to today", () => {
    const long: Seg[] = [
      ...Array.from({ length: 20 }, () => "secured" as const),
      "today",
      ...Array.from({ length: 54 }, () => "future" as const),
    ];
    const shown = stripSegments(long);
    expect(STRIP_MAX).toBe(14);
    expect(shown).toHaveLength(14);
    expect(shown[shown.length - 1]).toBe("today");
    expect(stripSegments(["secured", "missed", "today"]).length).toBe(3);
    const card = readFileSync(resolve(__dirname, "../components/profile/ChallengeCard.tsx"), "utf8");
    expect(card).toContain("stripSegments");
    const header = readFileSync(resolve(__dirname, "../components/profile/ProfileHeader.tsx"), "utf8");
    expect(header).toContain("compact(");
    expect(header).toContain("Add a bio");
    const v3 = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    expect(v3).toContain("CalendarDays");
    expect(v3).toContain("ProfileHeader");
    const list = readFileSync(resolve(__dirname, "../components/profile/ProfileChallenges.tsx"), "utf8");
    expect(list).toContain("ChallengeCard");
    expect(list).not.toContain("FINISHED_PREDATE_CAPTION");
  });
});
