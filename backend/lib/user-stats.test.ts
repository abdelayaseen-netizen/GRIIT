/**
 * Build 92 chunk 06: every number has one server field.
 * Three seeded users with real-looking history (missed days, a freeze, a left challenge).
 * Each field is computed once; every reader returns the same values.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  computeUserStats,
  enrollmentProgress,
  freezesHeld,
  type UserStatsCheckIn,
} from "./user-stats";
import { buildMeStats } from "./me-stats";
import { enrollmentDayStats } from "./enrollment-day-stats";
import { securedElapsed } from "./secured-elapsed";
import { effectiveFreezesRemaining } from "../trpc/routes/streaks";

const read = (p: string) => readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const TODAY = "2026-10-18";

function ci(date_key: string, proof: "camera" | "strava" | "self", n = 1): UserStatsCheckIn[] {
  return Array.from({ length: n }, (_, i) => ({
    date_key,
    status: "completed",
    task_id: `t${i}`,
    proof_source: proof === "strava" ? "strava" : proof === "camera" ? "camera" : null,
    has_photo: proof === "camera",
  }));
}

/** Yaseen-like: 9 days, one freeze on the 4th, a miss before today, today secured with a photo. */
const yaseen = {
  securedKeys: ["2026-10-08", "2026-10-09", "2026-10-10", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-18"],
  heldKeys: ["2026-10-11"],
  checkIns: [
    ...ci("2026-10-08", "camera"),
    ...ci("2026-10-09", "camera"),
    ...ci("2026-10-10", "self"),
    ...ci("2026-10-12", "camera", 2),
    ...ci("2026-10-13", "strava"),
    ...ci("2026-10-14", "camera"),
    ...ci("2026-10-14", "self"),
    ...ci("2026-10-15", "camera"),
    ...ci("2026-10-18", "camera"),
  ],
};

/** Fresh: joined yesterday, secured yesterday with a photo, nothing today yet. */
const fresh = {
  securedKeys: ["2026-10-17"],
  heldKeys: [] as string[],
  checkIns: ci("2026-10-17", "camera"),
};

/** Lapsed: a 3-day chain in September, nothing since (streak 0, best 3). */
const lapsed = {
  securedKeys: ["2026-09-20", "2026-09-21", "2026-09-22"],
  heldKeys: [] as string[],
  checkIns: [...ci("2026-09-20", "self"), ...ci("2026-09-21", "camera"), ...ci("2026-09-22", "camera")],
};

describe("06.2 computeUserStats", () => {
  it("Yaseen-like history: the freeze holds the chain but is not a secured day", () => {
    const s = computeUserStats({ todayKey: TODAY, ...yaseen });
    // 10-16 and 10-17 missed → today's secured day starts a new chain of 1.
    expect(s.current_streak).toBe(1);
    // 10-08 … 10-15 with 10-11 held: 7 secured days, dates span the chain.
    expect(s.best_streak).toBe(7);
    expect(s.best_streak_start).toBe("2026-10-08");
    expect(s.best_streak_end).toBe("2026-10-15");
    expect(s.secured_days).toBe(8);
    expect(s.held_days).toBe(1);
    // Verified: every completed task that day had camera or Strava proof.
    // 10-08 ✓ 10-09 ✓ 10-10 ✗(self) 10-12 ✓ 10-13 ✓(strava) 10-14 ✗(one self) 10-15 ✓ 10-18 ✓ → 6
    expect(s.verified_days).toBe(6);
    // Proofs: completed check-ins with a photo or Strava: 1+1+2+1+1+1+1 = 8
    expect(s.proofs_count).toBe(8);
  });

  it("fresh user: yesterday secured, today open → streak 1, best 1", () => {
    const s = computeUserStats({ todayKey: TODAY, ...fresh });
    expect(s).toMatchObject({
      current_streak: 1,
      best_streak: 1,
      best_streak_start: "2026-10-17",
      best_streak_end: "2026-10-17",
      secured_days: 1,
      verified_days: 1,
      proofs_count: 1,
    });
  });

  it("lapsed user: streak 0 once yesterday was neither secured nor held; best keeps its dates", () => {
    const s = computeUserStats({ todayKey: TODAY, ...lapsed });
    expect(s.current_streak).toBe(0);
    expect(s.best_streak).toBe(3);
    expect(s.best_streak_start).toBe("2026-09-20");
    expect(s.best_streak_end).toBe("2026-09-22");
    expect(s.secured_days).toBe(3);
    expect(s.verified_days).toBe(2);
    expect(s.proofs_count).toBe(2);
  });

  it("a held yesterday keeps today's chain alive without adding to the count", () => {
    const s = computeUserStats({
      todayKey: TODAY,
      securedKeys: ["2026-10-14", "2026-10-15", "2026-10-16"],
      heldKeys: ["2026-10-17"],
      checkIns: [],
    });
    expect(s.current_streak).toBe(3);
    expect(s.best_streak).toBe(3);
    expect(s.best_streak_end).toBe("2026-10-17");
    expect(s.secured_days).toBe(3);
  });

  it("future-dated rows never count", () => {
    const s = computeUserStats({ todayKey: TODAY, securedKeys: ["2026-10-19", "2026-10-18"], heldKeys: [], checkIns: [] });
    expect(s.secured_days).toBe(1);
    expect(s.current_streak).toBe(1);
  });
});

describe("06.2 every reader returns the same values", () => {
  it("meStats carries the shared user_stats unchanged", () => {
    for (const u of [yaseen, fresh, lapsed]) {
      const shared = computeUserStats({ todayKey: TODAY, ...u });
      const me = buildMeStats({
        range: "all",
        todayKey: TODAY,
        timeZone: "UTC",
        userStats: shared,
        securedKeys: u.securedKeys,
        heldKeys: u.heldKeys,
        enrollments: [],
        proofs: [],
      });
      expect(me.user_stats.current_streak).toBe(shared.current_streak);
      expect(me.user_stats.best_streak).toBe(shared.best_streak);
      expect(me.user_stats.best_streak_start).toBe(shared.best_streak_start);
      expect(me.user_stats.best_streak_end).toBe(shared.best_streak_end);
      expect(me.user_stats.lifetime_secured_days).toBe(shared.secured_days);
      expect(me.user_stats.proof_count).toBe(shared.proofs_count);
      expect(me.user_stats.verified_days).toBe(shared.verified_days);
    }
  });

  it("the routes attach user_stats from one loader and set the legacy fields from it", () => {
    const stats = read("backend/trpc/routes/profiles-stats.ts");
    expect(stats).toContain("export async function loadUserStats(");
    expect(stats).toMatch(/activeStreak:\s*userStats\.current_streak/);
    expect(stats).toMatch(/longestStreak:\s*userStats\.best_streak/);
    expect(stats).toMatch(/totalDaysSecured:\s*userStats\.secured_days/);
    expect(stats).toMatch(/user_stats: userStats/);
    expect(stats).not.toMatch(/longest_streak_count \|\| 0/);
    const record = read("backend/trpc/routes/profiles-record.ts");
    expect(record).toContain("loadUserStats(");
    expect(record).toMatch(/currentStreak: userStats\.current_streak/);
    expect(record).toMatch(/bestStreak: userStats\.best_streak/);
    expect(record).toMatch(/user_stats: userStats/);
    expect(stats).toMatch(/userStats: await loadUserStats\(/); // meStats
    expect(stats).not.toContain("currentStreak: (streak.data");
  });

  it("the clients read the server fields and compute nothing", () => {
    const home = read("app/(tabs)/index.tsx");
    expect(home).not.toContain("streakFromDays(");
    const profile = read("app/(tabs)/profile.tsx");
    expect(profile).not.toContain("streakFromDays(");
    expect(profile).toMatch(/stats\?\.user_stats \?\? record\?\.user_stats/);
    expect(profile).toMatch(/userStats\?\.current_streak/);
    expect(profile).toMatch(/userStats\?\.best_streak/);
    expect(profile).toMatch(/userStats\?\.secured_days/);
    expect(profile).not.toContain("lifetime_secured_days");
    // The Proofs tab's "N proofs · newest first" reads the same field, not the tile count.
    expect(profile).toMatch(/const proofsCount = userStats\?\.proofs_count/);
    expect(profile).toMatch(/proofCount=\{proofsCount\}/);
    const proofsTab = read("components/profile/ProfileProofs.tsx");
    expect(proofsTab).toMatch(/proofsNewestLine\(proofCount/);
    const detail = read("app/challenge/active/[activeChallengeId].tsx");
    expect(detail).toContain("TRPC.challenges.progress");
    expect(detail).toMatch(/progress\.data\?\.days_secured/);
    expect(detail).toMatch(/progress\.data\?\.day_number/);
    expect(read("lib/trpc-paths.ts")).toContain("progress: 'challenges.progress'");
  });
});

describe("06.2 per-challenge progress from the same day records as the dots", () => {
  const start = "2026-10-12";
  it("Yaseen-like 7-day enrollment: day 7, 5 of 6 elapsed secured (one held), states per day", () => {
    const p = enrollmentProgress({
      startDateKey: start,
      durationDays: 7,
      todayKey: TODAY,
      securedKeys: yaseen.securedKeys,
      heldKeys: yaseen.heldKeys,
    });
    expect(p.day_number).toBe(7);
    expect(p.total_days).toBe(7);
    // 10-12 ✓ 10-13 ✓ 10-14 ✓ 10-15 ✓ 10-16 ✗ 10-17 ✗ 10-18 ✓(today, secured → counts)
    expect(p.days_secured).toBe(5);
    expect(p.elapsed_days).toBe(7);
    expect(p.days.map((d) => d.state)).toEqual(["secured", "secured", "secured", "secured", "missed", "missed", "secured"]);
    // Matches the two client formulas for the same keys.
    const stats = enrollmentDayStats({ startDateKey: start, timeZone: "UTC", todayKey: TODAY, durationDays: 7, securedDateKeys: yaseen.securedKeys });
    expect(stats.secured).toBe(p.days_secured);
    expect(stats.due).toBe(p.elapsed_days);
    const dueKeys = p.days.map((d) => d.date_key);
    const w = securedElapsed({ dueDayKeys: dueKeys, securedDateKeys: yaseen.securedKeys, todayKey: TODAY });
    expect(w.secured).toBe(p.days_secured);
    expect(w.elapsed).toBe(p.elapsed_days);
  });

  it("a held day shows as held, holds the streak and does not add to days_secured", () => {
    const p = enrollmentProgress({ startDateKey: "2026-10-10", durationDays: 7, todayKey: "2026-10-12", securedKeys: ["2026-10-10"], heldKeys: ["2026-10-11"] });
    expect(p.days.map((d) => d.state)).toEqual(["secured", "held", "today", "future", "future", "future", "future"]);
    expect(p.days_secured).toBe(1);
    expect(p.elapsed_days).toBe(2);
    expect(p.day_number).toBe(3);
  });

  it("a left enrollment stops at the day it ended", () => {
    const p = enrollmentProgress({ startDateKey: "2026-10-01", durationDays: 7, todayKey: TODAY, endedDateKey: "2026-10-05", securedKeys: ["2026-10-01", "2026-10-02"], heldKeys: [] });
    expect(p.day_number).toBe(5);
    expect(p.elapsed_days).toBe(5);
    expect(p.days_secured).toBe(2);
    expect(p.days).toHaveLength(5);
  });
});

describe("06.4 Your data bars read secured of elapsed and say when a challenge was left", () => {
  it("running: 'Workout every day' reads secured of elapsed, never the day number of the duration", () => {
    const me = buildMeStats({
      range: "all",
      todayKey: TODAY,
      timeZone: "UTC",
      userStats: computeUserStats({ todayKey: TODAY, ...yaseen }),
      securedKeys: yaseen.securedKeys,
      heldKeys: yaseen.heldKeys,
      enrollments: [{ id: "a", title: "Workout every day", startKey: "2026-10-14", durationDays: 7, status: "running", finishedAt: null }],
      proofs: [],
    });
    const row = me.enrollments[0]!;
    // 10-14 ✓ 10-15 ✓ 10-16 ✗ 10-17 ✗ 10-18 ✓ → 3 of 5
    expect(row.secured_days).toBe(3);
    expect(row.due_days).toBe(5);
    expect(row.line).toBe("3 of 5 days secured");
    expect(row.line).not.toContain("Today counts");
  });

  it("left: 'Wake up at 5' says Left on day 5 with the secured count of those days", () => {
    const me = buildMeStats({
      range: "all",
      todayKey: TODAY,
      timeZone: "UTC",
      userStats: computeUserStats({ todayKey: TODAY, ...yaseen }),
      securedKeys: yaseen.securedKeys,
      heldKeys: yaseen.heldKeys,
      enrollments: [{ id: "b", title: "Wake up at 5", startKey: "2026-10-08", durationDays: 7, status: "left", finishedAt: "2026-10-12" }],
      proofs: [],
    });
    const row = me.enrollments[0]!;
    expect(row.status).toBe("left");
    expect(row.line).toBe("Left on day 5 · 4 of 5 secured");
    expect(row.due_days).toBe(5);
    expect(row.secured_days).toBe(4);
  });

  it("finished: a completed enrollment reads secured of its duration", () => {
    const me = buildMeStats({
      range: "all",
      todayKey: TODAY,
      timeZone: "UTC",
      userStats: computeUserStats({ todayKey: TODAY, ...lapsed }),
      securedKeys: lapsed.securedKeys,
      heldKeys: [],
      enrollments: [{ id: "c", title: "Three days", startKey: "2026-09-20", durationDays: 3, status: "finished", finishedAt: "2026-09-22" }],
      proofs: [],
    });
    expect(me.enrollments[0]!.line).toBe("3 of 3 days secured");
  });
});

describe("06.3 freeze rule: earn at each 7-day streak, hold up to 2 (4 with Pro), no monthly refill", () => {
  it("remaining is what was earned, capped — never refilled by the calendar", () => {
    const old = new Date("2026-01-01T00:00:00Z").toISOString();
    expect(effectiveFreezesRemaining({ storedRemaining: 0, lastFreezeUsedAt: old, isPro: false })).toEqual({ remaining: 0, limit: 2 });
    expect(effectiveFreezesRemaining({ storedRemaining: 0, lastFreezeUsedAt: null, isPro: false })).toEqual({ remaining: 0, limit: 2 });
    expect(effectiveFreezesRemaining({ storedRemaining: 1, lastFreezeUsedAt: old, isPro: true })).toEqual({ remaining: 1, limit: 4 });
  });

  it("existing users keep what they have, capped at the new maximum", () => {
    expect(effectiveFreezesRemaining({ storedRemaining: 3, lastFreezeUsedAt: null, isPro: false }).remaining).toBe(2);
    expect(effectiveFreezesRemaining({ storedRemaining: 6, lastFreezeUsedAt: null, isPro: true }).remaining).toBe(4);
    expect(freezesHeld(3, false)).toBe(2);
    expect(freezesHeld(null, true)).toBe(0);
  });

  it("the monthly allotment and its copy are gone", () => {
    const streaks = read("backend/trpc/routes/streaks.ts");
    expect(streaks).not.toContain("STREAK_FREEZE_PER_MONTH");
    expect(streaks).not.toContain("monthlyFreezeLimit");
    expect(streaks).not.toContain("left this month");
    expect(read("app/settings/index.tsx")).not.toContain("1 streak freeze a month");
    expect(read("app/settings/index.tsx")).toContain("Earn a freeze at each 7-day streak. Hold up to 2.");
    expect(read("components/paywall/PaywallControl.tsx")).not.toContain("per month");
    expect(read("components/paywall/PaywallControl.tsx")).toContain("Hold up to 4 freezes (free: 2)");
  });
});
