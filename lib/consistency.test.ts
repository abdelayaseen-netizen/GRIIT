import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { securedElapsed as backendSecuredElapsed } from "@/backend/lib/secured-elapsed";
import {
  consistencyContext,
  consistencyDetailHero,
  consistencyFromDayArray,
  consistencyFromRecord,
  consistencyHeadline,
  consistencyLine,
  securedElapsed,
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
    expect(profile).toContain("consistencyFromDayArray");
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

  it("R1: unsecured today is never elapsed", () => {
    const today = "2026-09-23";
    const due = ["2026-09-21", "2026-09-22", today];
    const w = securedElapsed({
      dueDayKeys: due,
      securedDateKeys: ["2026-09-21", "2026-09-22"],
      todayKey: today,
    });
    expect(w.elapsed).toBe(2);
    expect(w.secured).toBe(2);
    expect(w.todaySecured).toBe(false);
    expect(w.elapsedKeys).not.toContain(today);
  });

  it("R1: today counts once secured", () => {
    const today = "2026-09-23";
    const due = ["2026-09-21", "2026-09-22", today];
    const w = securedElapsed({
      dueDayKeys: due,
      securedDateKeys: ["2026-09-21", "2026-09-22", today],
      todayKey: today,
    });
    expect(w.elapsed).toBe(3);
    expect(w.secured).toBe(3);
    expect(w.todaySecured).toBe(true);
    expect(w.elapsedKeys).toContain(today);
  });

  it("R1: joined today, unsecured → 0 elapsed; secured → 1 of 1", () => {
    const today = "2026-09-26";
    const open = securedElapsed({
      dueDayKeys: [today],
      securedDateKeys: [],
      todayKey: today,
    });
    expect(open.elapsed).toBe(0);
    expect(open.secured).toBe(0);
    expect(open.dueToday).toBe(true);
    const done = securedElapsed({
      dueDayKeys: [today],
      securedDateKeys: [today],
      todayKey: today,
    });
    expect(done.elapsed).toBe(1);
    expect(done.secured).toBe(1);
  });

  it("R1: visitor profile, Home, Profile, ConsistencyGrid, and record call the one reducer", () => {
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const profile = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const grid = readFileSync(resolve(__dirname, "../components/profile/ConsistencyGrid.tsx"), "utf8");
    const record = readFileSync(resolve(__dirname, "./profile-v2-record.ts"), "utf8");
    const dayState = readFileSync(resolve(__dirname, "./day-state.ts"), "utf8");
    const impl = readFileSync(resolve(__dirname, "../backend/lib/secured-elapsed.ts"), "utf8");
    const barrel = readFileSync(resolve(__dirname, "./consistency.ts"), "utf8");
    expect(impl).toContain("k < args.todayKey || (k === args.todayKey && todaySecured)");
    expect(impl).toContain("export function securedElapsed");
    expect(barrel).toContain('from "../backend/lib/secured-elapsed"');
    expect(securedElapsed).toBe(backendSecuredElapsed);
    expect(visitor).toContain("consistencyFromDayArray");
    expect(home).toContain("consistencyFromDayArray");
    expect(profile).toContain("consistencyFromDayArray");
    expect(grid).toContain("securedElapsed");
    expect(record).toContain("securedElapsed");
    expect(dayState).toContain("securedElapsed");
    expect(dayState).not.toMatch(/filter\(\(k\) => k < /);
  });
});
