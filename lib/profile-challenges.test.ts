import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { detailLine, rowsFromProfileRecord, statusLine } from "./profile-challenges";
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
