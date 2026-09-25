import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  consistencyContext,
  consistencyDetailHero,
  consistencyFromDayArray,
  consistencyFromRecord,
  consistencyHeadline,
  consistencyLine,
} from "@/lib/consistency";
import { buildProfileRecord, type ChallengeRangeInput } from "@/lib/profile-v2-record";

describe("consistency builders", () => {
  it("uses one phrasing and no percentage", () => {
    const c = consistencyFromRecord({
      verifiedClosed: 10,
      closedDueDays: 13,
      dueToday: true,
      dueDayKeys: ["2026-09-01", "2026-09-19"],
    });
    expect(consistencyHeadline(c)).toBe("10 of 13 days");
    expect(consistencyLine(c)).toBe("10 of 13 days secured.");
    expect(consistencyContext(c, (k) => k)).toBe("Since 2026-09-01. 1 due today.");
    expect(consistencyContext(c, (k) => k, true)).toBe("Since 2026-09-01. Today secured.");
    expect(consistencyDetailHero(c)).toBe("10 of 13");
    expect(consistencyHeadline({ secured: 0, due: 0, dueToday: false, firstDueDate: null })).toBe(
      "No due days yet.",
    );
    expect(consistencyLine({ secured: 0, due: 0, dueToday: true, firstDueDate: null })).toBe(
      "Today is the first day due.",
    );
  });

  it("Home and Profile read verifiedClosed / closedDueDays", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const profile = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    expect(home).toContain("consistencyLine");
    expect(home).toContain("consistencyFromDayArray");
    expect(home).toContain("dueDayKeys");
    expect(home).toContain("verifiedClosed");
    expect(profile).toContain("consistencyHeadline");
    expect(profile).toContain("consistencyContext");
    expect(profile).toContain("consistencyContext(consistency, proofsDateLabel, todaySecured)");
    expect(profile).toContain("consistencyHeadlineFromDays");
    expect(profile).toContain("daysFromSource");
    expect(profile).not.toContain("profileConsistencyFromBootstrap");
    const mutations = readFileSync(resolve(__dirname, "../hooks/useAppChallengeMutations.ts"), "utf8");
    expect(mutations).toContain('invalidateQueries({ queryKey: ["profiles", "getRecord"] })');
    expect(mutations).toContain('refetchQueries({ queryKey: ["profiles", "getRecord"] })');
  });

  it("day array with 3 secured of 7 closed days, plus a new enrollment starting today → still \"3 of 7\"", () => {
    const today = "2026-09-23";
    const closed = [
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
    ];
    const secured = closed.slice(0, 3);
    const dueDayKeys = [...closed, today];
    const line = consistencyLine(
      consistencyFromDayArray({
        dueDayKeys,
        securedDateKeys: secured,
        todayKey: today,
      }),
    );
    expect(line).toBe("3 of 7 days secured.");

    const week: ChallengeRangeInput = {
      id: "week",
      challengeId: "c-week",
      name: "Week",
      status: "active",
      startDateKey: "2026-09-16",
      endDateKey: "2026-09-30",
      durationDays: 14,
      tasksPerDay: 1,
    };
    const oneDay: ChallengeRangeInput = {
      id: "today",
      challengeId: "c-1",
      name: "One day",
      status: "active",
      startDateKey: today,
      endDateKey: "2026-09-24",
      durationDays: 1,
      tasksPerDay: 1,
    };
    const rec = buildProfileRecord({
      todayKey: today,
      currentStreak: 3,
      bestStreak: 3,
      lastCompletedDateKey: "2026-09-22",
      ranges: [week, oneDay],
      securedDateKeys: secured,
    });
    expect(rec.consistency.closedDueDays).toBe(7);
    expect(rec.consistency.verifiedClosed).toBe(3);
    expect(
      consistencyLine(
        consistencyFromDayArray({
          dueDayKeys: rec.consistency.dueDayKeys,
          securedDateKeys: secured,
          todayKey: today,
        }),
      ),
    ).toBe("3 of 7 days secured.");
  });
});
