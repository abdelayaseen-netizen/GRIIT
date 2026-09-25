import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  countSecuredInRange,
  detailLine,
  finishedHeaderLine,
  pickLatestEndedEnrollment,
  rowsFromProfileRecord,
  statusLine,
} from "./profile-challenges";
import { buildProfileRecord } from "./profile-v2-record";

describe("statusLine", () => {
  it("uses the four spec lines", () => {
    expect(
      statusLine({
        id: "1",
        challengeId: "c",
        title: "A",
        status: "active",
        duration_days: 75,
        current_day: 12,
        secured_days: 10,
        started_at: "2026-09-01",
      }),
    ).toBe("Day 12 of 75");
    expect(
      statusLine({
        id: "1",
        challengeId: "c",
        title: "A",
        status: "completed",
        duration_days: 75,
        current_day: 75,
        secured_days: 68,
        started_at: "2026-09-01",
      }),
    ).toBe("68 of 75");
    expect(
      statusLine({
        id: "1",
        challengeId: "c",
        title: "A",
        status: "abandoned",
        duration_days: 75,
        current_day: 9,
        secured_days: 8,
        ended_on_day: 9,
        started_at: "2026-09-01",
      }),
    ).toBe("Left on day 9");
    expect(
      statusLine({
        id: "1",
        challengeId: "c",
        title: "A",
        status: "failed",
        duration_days: 75,
        current_day: 4,
        secured_days: 3,
        ended_on_day: 4,
        started_at: "2026-09-01",
      }),
    ).toBe("Failed on day 4");
  });
});

describe("finished catalog header", () => {
  it("completed uses statusLine plus days", () => {
    expect(
      finishedHeaderLine({
        status: "completed",
        secured_days: 12,
        duration_days: 30,
        current_day: 30,
      }),
    ).toBe("12 of 30 days");
  });

  it("picks the latest ended_at among completed and failed", () => {
    const latest = pickLatestEndedEnrollment([
      {
        id: "old",
        challenge_id: "c",
        status: "completed",
        ended_at: "2026-08-01T00:00:00.000Z",
        current_day: 7,
      },
      {
        id: "new",
        challenge_id: "c",
        status: "failed",
        ended_at: "2026-09-20T00:00:00.000Z",
        current_day: 4,
      },
      {
        id: "active",
        challenge_id: "c",
        status: "active",
        ended_at: "2026-09-21T00:00:00.000Z",
      },
    ]);
    expect(latest?.id).toBe("new");
    expect(countSecuredInRange(["2026-09-16", "2026-09-17", "2026-09-21"], "2026-09-16", "2026-09-20")).toBe(2);
  });
});

describe("challenge catalog screen branches", () => {
  const catalog = readFileSync(resolve(__dirname, "../app/challenge/[id].tsx"), "utf8");
  const detail = readFileSync(resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"), "utf8");

  it("renders the screen skeleton while the challenges row loads, never null", () => {
    expect(catalog).not.toMatch(/if\s*\(\s*!enrollmentsReady\s*\|\|\s*activeChallengeId\s*\)\s*\{\s*return null/);
    expect(catalog).toContain("catalogLoading");
    expect(catalog).toContain("loading={catalogLoading}");
    expect(catalog).toContain("catalogFromChallengeRow");
    expect(catalog).not.toContain("!enrollmentsReady || !!activeChallengeId || endedPending");
  });

  it("finished enrollment shows statusLine header and Start again, never Join", () => {
    expect(catalog).toContain("finishedHeaderLine");
    expect(catalog).toContain('onJoin={finished ? undefined : () => void onJoin()}');
    expect(catalog).toContain("onStartAgain={finished ? () => void onJoin() : undefined}");
    expect(detail).toContain('accessibilityLabel="Start again"');
    expect(detail).toContain(">Start again<");
    expect(detail).toMatch(/\{p\.finishedLine \? \(/);
    const joinAfterFinished = detail.slice(detail.indexOf("{p.finishedLine ? ("));
    expect(joinAfterFinished).toContain('accessibilityLabel="Join"');
    expect(joinAfterFinished.indexOf("Start again")).toBeLessThan(joinAfterFinished.indexOf('accessibilityLabel="Join"'));
  });
});

describe("detailLine", () => {
  it("active not yet / secured today", () => {
    const base = {
      id: "1",
      challengeId: "c",
      title: "A",
      status: "active" as const,
      duration_days: 1,
      current_day: 1,
      secured_days: 0,
      started_at: "2026-09-01",
      tasks_today: 3,
    };
    expect(detailLine(base, (s) => s)).toBe("Not yet today");
    expect(detailLine({ ...base, secured_today: true }, (s) => s)).toBe(
      "3 of 3 secured today",
    );
  });
});

describe("rowsFromProfileRecord", () => {
  it("maps a completed range into Finished", () => {
    const rec = buildProfileRecord({
      todayKey: "2026-09-22",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys: ["2026-09-20"],
      ranges: [
        {
          id: "ac-done",
          challengeId: "ch",
          name: "Quick Steps",
          status: "completed",
          startDateKey: "2026-09-20",
          endDateKey: "2026-09-21",
          durationDays: 1,
          tasksPerDay: 1,
        },
      ],
    });
    const rows = rowsFromProfileRecord(rec);
    expect(rows).toHaveLength(1);
    expect(statusLine(rows[0]!)).toBe("1 of 1");
    expect(rows[0]?.status).toBe("completed");
  });

  it("completed 1-day enrollment with 1 secured day → \"1 of 1\"", () => {
    const rec = buildProfileRecord({
      todayKey: "2026-09-25",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys: ["2026-09-23"],
      ranges: [
        {
          id: "ac-water",
          challengeId: "ch-water",
          name: "Drink Water Today",
          status: "completed",
          startDateKey: "2026-09-23",
          endDateKey: "2026-09-23",
          durationDays: 1,
          tasksPerDay: 1,
        },
      ],
    });
    const rows = rowsFromProfileRecord(rec);
    expect(statusLine(rows[0]!)).toBe("1 of 1");
    expect(rows[0]?.secured_days).toBe(1);
  });

  it("abandoned enrollment ended day 8 → listed, \"Left on day 8\"", () => {
    const rec = buildProfileRecord({
      todayKey: "2026-09-25",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys: ["2026-09-16", "2026-09-18", "2026-09-19"],
      ranges: [
        {
          id: "ac-iron",
          challengeId: "ch-iron",
          name: "Iron man",
          status: "abandoned",
          startDateKey: "2026-09-16",
          endDateKey: "2026-09-24",
          durationDays: 14,
          tasksPerDay: 1,
        },
      ],
    });
    const rows = rowsFromProfileRecord(rec);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("abandoned");
    expect(statusLine(rows[0]!)).toBe("Left on day 8");
  });

  it("maps failed into Finished", () => {
    const rec = buildProfileRecord({
      todayKey: "2026-09-22",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys: [],
      ranges: [
        {
          id: "ac-fail",
          challengeId: "ch",
          name: "Team",
          status: "failed",
          startDateKey: "2026-09-18",
          endDateKey: "2026-09-21",
          durationDays: 3,
          tasksPerDay: 1,
        },
      ],
    });
    const rows = rowsFromProfileRecord(rec);
    expect(rows[0]?.status).toBe("failed");
    expect(statusLine(rows[0]!)).toMatch(/^Failed on day /);
  });
});

describe("Finished predate caption", () => {
  it("is the spec line", () => {
    const src = readFileSync(
      resolve(__dirname, "../components/profile/ProfileChallenges.tsx"),
      "utf8",
    );
    expect(src).toContain(
      "Runs that ended before this version shipped are here too, without an end screen.",
    );
  });
});
