import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { finishedRunFromEnrollment, finishedRunScore } from "./finished-run";
import { buildProfileRecord } from "../../lib/profile-v2-record";
import { endedChallengeFromUnseen } from "../../lib/challenge-end";
import { leftRecordLine } from "../../lib/profile-challenges";

describe("finishedRunScore — one reduction", () => {
  it("completed 7-day: Y equals duration; all four surfaces agree", () => {
    const securedDateKeys = [
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
    ];
    const score = finishedRunScore({
      startDateKey: "2026-09-16",
      exclusiveEndDateKey: "2026-09-23",
      status: "completed",
      todayKey: "2026-09-26",
      securedDateKeys,
      durationDays: 7,
    });
    expect(score.elapsed).toBe(7);
    expect(score.secured).toBe(7);

    const feed = finishedRunFromEnrollment({
      startAt: "2026-09-16T12:00:00.000Z",
      endAt: "2026-09-22T23:59:59.999Z",
      status: "completed",
      timeZone: "UTC",
      todayKey: "2026-09-26",
      securedDateKeys,
      durationDays: 7,
    })!;
    expect(feed).toEqual(score);

    const rec = buildProfileRecord({
      todayKey: "2026-09-26",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys,
      ranges: [
        {
          id: "ac",
          challengeId: "ch",
          name: "Iron man",
          status: "completed",
          startDateKey: "2026-09-16",
          endDateKey: "2026-09-23",
          durationDays: 7,
          tasksPerDay: 1,
        },
      ],
    });
    expect(rec.completed[0]?.value).toBe("7 of 7");
    expect(rec.completed[0]?.verified).toBe(7);

    const end = endedChallengeFromUnseen(
      {
        id: "ac",
        challenge_id: "ch",
        status: "completed",
        start_at: "2026-09-16T12:00:00.000Z",
        end_at: "2026-09-22T23:59:59.999Z",
        challenges: { title: "Iron man", duration_days: 7 },
      },
      { timeZone: "UTC", todayKey: "2026-09-26", securedDateKeys },
    );
    expect(end.secured).toBe(7);
    expect(end.elapsed).toBe(7);
    expect(leftRecordLine(7, score.secured, score.elapsed)).toBe(
      "Left on day 7 · 7 of 7 secured",
    );
  });

  it("abandoned mid-run: all four agree on window Y, not catalog duration", () => {
    const securedDateKeys = ["2026-09-16", "2026-09-17"];
    const score = finishedRunScore({
      startDateKey: "2026-09-16",
      exclusiveEndDateKey: "2026-09-20",
      status: "abandoned",
      todayKey: "2026-09-26",
      securedDateKeys,
      durationDays: 14,
    });
    expect(score.elapsed).toBe(4);
    expect(score.secured).toBe(2);

    const feed = finishedRunFromEnrollment({
      startAt: "2026-09-16T12:00:00.000Z",
      endAt: "2026-09-30T23:59:59.999Z",
      endedAt: "2026-09-19T18:00:00.000Z",
      status: "abandoned",
      timeZone: "UTC",
      todayKey: "2026-09-26",
      securedDateKeys,
      durationDays: 14,
    })!;
    expect(feed.secured).toBe(score.secured);
    expect(feed.elapsed).toBe(score.elapsed);

    const rec = buildProfileRecord({
      todayKey: "2026-09-26",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys,
      ranges: [
        {
          id: "ac",
          challengeId: "ch",
          name: "Iron man",
          status: "abandoned",
          startDateKey: "2026-09-16",
          endDateKey: "2026-09-20",
          durationDays: 14,
          tasksPerDay: 1,
        },
      ],
    });
    expect(rec.completed[0]?.value).toBe("2 of 4");
    expect(rec.completed[0]?.verified).toBe(2);

    const end = endedChallengeFromUnseen(
      {
        id: "ac",
        challenge_id: "ch",
        status: "abandoned",
        start_at: "2026-09-16T12:00:00.000Z",
        end_at: "2026-09-30T23:59:59.999Z",
        ended_at: "2026-09-19T18:00:00.000Z",
        challenges: { title: "Iron man", duration_days: 14 },
      },
      { timeZone: "UTC", todayKey: "2026-09-26", securedDateKeys },
    );
    expect(end.secured).toBe(2);
    expect(end.elapsed).toBe(4);
    expect(leftRecordLine(4, score.secured, score.elapsed)).toBe(
      "Left on day 4 · 2 of 4 secured",
    );
  });

  it("1-day completed: all four agree 1 of 1", () => {
    const score = finishedRunScore({
      startDateKey: "2026-09-26",
      exclusiveEndDateKey: "2026-09-27",
      status: "completed",
      todayKey: "2026-09-27",
      securedDateKeys: ["2026-09-26"],
      durationDays: 1,
    });
    expect(score).toMatchObject({ secured: 1, elapsed: 1 });

    const feed = finishedRunFromEnrollment({
      startAt: "2026-09-26T12:00:00.000Z",
      endAt: "2026-09-26T23:59:59.999Z",
      status: "completed",
      timeZone: "UTC",
      todayKey: "2026-09-27",
      securedDateKeys: ["2026-09-26"],
      durationDays: 1,
    })!;
    expect(feed.secured).toBe(1);
    expect(feed.elapsed).toBe(1);

    const rec = buildProfileRecord({
      todayKey: "2026-09-27",
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
      securedDateKeys: ["2026-09-26"],
      ranges: [
        {
          id: "ac",
          challengeId: "ch",
          name: "Don't spend",
          status: "completed",
          startDateKey: "2026-09-26",
          endDateKey: "2026-09-27",
          durationDays: 1,
          tasksPerDay: 1,
        },
      ],
    });
    expect(rec.completed[0]?.value).toBe("1 of 1");

    const end = endedChallengeFromUnseen(
      {
        id: "ac",
        challenge_id: "ch",
        status: "completed",
        start_at: "2026-09-26T12:00:00.000Z",
        end_at: "2026-09-26T23:59:59.999Z",
        challenges: { title: "Don't spend", duration_days: 1 },
      },
      { timeZone: "UTC", todayKey: "2026-09-27", securedDateKeys: ["2026-09-26"] },
    );
    expect(end.secured).toBe(1);
    expect(end.elapsed).toBe(1);
  });

  it("the four call sites import finishedRunScore or finishedRunFromEnrollment", () => {
    const profile = readFileSync(resolve(__dirname, "../../lib/profile-v2-record.ts"), "utf8");
    const hydrate = readFileSync(resolve(__dirname, "./feed-activity-hydrate.ts"), "utf8");
    const end = readFileSync(resolve(__dirname, "../../lib/challenge-end.ts"), "utf8");
    const detail = readFileSync(resolve(__dirname, "../../app/challenge/[id].tsx"), "utf8");
    expect(profile).toContain("finishedRunScore");
    expect(hydrate).toContain("finishedRunFromEnrollment");
    expect(end).toContain("finishedRunFromEnrollment");
    expect(detail).toContain("finishedRunScore");
  });
});
