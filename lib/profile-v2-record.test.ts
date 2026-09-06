import { describe, expect, it } from "vitest";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { PROFILE_V2_BADGES } from "@/lib/profile-v2-badges";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import {
  DAY_STATE,
  badgeRows,
  buildProfileRecord,
  cellWidth,
  runStates,
  unionDueDateKeys,
  verdictFor,
  weeklyAverage,
  type ChallengeRangeInput,
  type ProfileRecordInput,
} from "@/lib/profile-v2-record";

const TODAY = "2026-09-05";
const V = DAY_STATE.VERIFIED;
const M = DAY_STATE.MISSED;
const T = DAY_STATE.TODAY;

function securedExcept(due: string[], misses: string[]): string[] {
  return due.filter((k) => !misses.includes(k));
}

function readSomething(start: string, durationDays: number): ChallengeRangeInput {
  const last = (() => {
    const [y, m, d] = start.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d! + durationDays));
    return dt.toISOString().slice(0, 10);
  })();
  return {
    id: "read",
    challengeId: "c-read",
    name: "Read Something",
    status: "active",
    startDateKey: start,
    endDateKey: last,
    durationDays,
    tasksPerDay: 2,
  };
}

/** A — 12 due days. Read Something from 25 Aug (day 4 missed); Cold Plunge from 3 Sep. */
function fixtureTwelve(): ProfileRecordInput {
  const read = readSomething("2026-08-25", 30);
  const cold: ChallengeRangeInput = {
    id: "cold",
    challengeId: "c-cold",
    name: "Cold Plunge Ladder",
    status: "active",
    startDateKey: "2026-09-03",
    endDateKey: "2026-09-17",
    durationDays: 14,
    tasksPerDay: 2,
  };
  const due = unionDueDateKeys([read, cold], TODAY);
  return {
    todayKey: TODAY,
    currentStreak: 7,
    bestStreak: 7,
    lastCompletedDateKey: "2026-09-04",
    ranges: [read, cold],
    securedDateKeys: securedExcept(due, ["2026-08-28", TODAY]),
    badgeUnlocks: { "3day": "2026-08-31", "7day": "2026-09-04" },
  };
}

/** B — 3 due days (2 closed). */
function fixtureThree(): ProfileRecordInput {
  const read = readSomething("2026-09-03", 30);
  const due = unionDueDateKeys([read], TODAY);
  return {
    todayKey: TODAY,
    currentStreak: 2,
    bestStreak: 2,
    lastCompletedDateKey: "2026-09-04",
    ranges: [read],
    securedDateKeys: securedExcept(due, [TODAY]),
  };
}

/** D — 30 due days, misses on day 4 and day 12. */
function fixtureThirty(): ProfileRecordInput {
  const read = readSomething("2026-08-07", 30);
  const due = unionDueDateKeys([read], TODAY);
  return {
    todayKey: TODAY,
    currentStreak: 17,
    bestStreak: 17,
    lastCompletedDateKey: "2026-09-04",
    ranges: [read],
    securedDateKeys: securedExcept(due, ["2026-08-10", "2026-08-18", TODAY]),
    badgeUnlocks: { "3day": "2026-08-21", "7day": "2026-08-25", "14day": "2026-09-01" },
  };
}

function fixtureNone(): ProfileRecordInput {
  return {
    todayKey: TODAY,
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDateKey: null,
    ranges: [],
    securedDateKeys: [],
  };
}

describe("cellWidth (390pt inner 298)", () => {
  it("is 24px at 3 due days, 21px at 12, 6px at 30", () => {
    expect(cellWidth(3)).toBe(24);
    expect(cellWidth(12)).toBe(21);
    expect(cellWidth(30)).toBe(6);
  });
});

describe("verdictFor — display only", () => {
  it("matches the spec table", () => {
    expect(verdictFor(0.91, 11)).toBe("Locked in");
    expect(verdictFor(0.75, 8)).toBe("Solid");
    expect(verdictFor(0.5, 8)).toBe("Slipping");
    expect(verdictFor(0.49, 8)).toBe("Rebuilding");
    expect(verdictFor(1, 6)).toBe("");
  });
});

describe("runStates / weeklyAverage", () => {
  it("marks misses, today, and future", () => {
    expect(runStates(5, 2, [1])).toEqual([V, M, T, DAY_STATE.FUTURE, DAY_STATE.FUTURE]);
  });

  it("averages live weeks only (fixture A 6-month bars)", () => {
    const weeks = Array.from({ length: 26 }, (_, i) => (i === 24 ? 0.86 : i === 25 ? 1 : null));
    expect(weeklyAverage(weeks)).toBeCloseTo(0.93, 2);
    expect(weeklyAverage(Array.from({ length: 26 }, () => null))).toBe(0);
  });
});

describe("Q7 due days — status active, from join date, paused excluded", () => {
  it("unions overlapping active ranges and ignores non-active", () => {
    const paused: ChallengeRangeInput = {
      ...readSomething("2026-08-01", 30),
      id: "paused",
      status: "paused",
    };
    const completed: ChallengeRangeInput = {
      ...readSomething("2026-07-01", 14),
      id: "done",
      status: "completed",
    };
    const keys = unionDueDateKeys([fixtureTwelve().ranges[0]!, paused, completed], TODAY);
    expect(keys[0]).toBe("2026-08-25");
    expect(keys[keys.length - 1]).toBe(TODAY);
    expect(keys).not.toContain("2026-08-01");
    expect(keys).not.toContain("2026-07-01");
  });
});

describe("fixture A — 12 due days", () => {
  const rec = buildProfileRecord(fixtureTwelve());

  it("derives the consistency card from the same rows", () => {
    expect(rec.consistency.dueDayKeys).toHaveLength(12);
    expect(rec.consistency.closedDueDays).toBe(11);
    expect(rec.consistency.verifiedClosed).toBe(10);
    expect(rec.consistency.rate).toBe("91%");
    expect(rec.consistency.verdict).toBe("Locked in");
    expect(rec.consistency.line).toBe("10 of 11 due days verified. 1 due today.");
    expect(rec.consistency.strip).toEqual([V, V, V, M, V, V, V, V, V, V, V, T]);
    expect(rec.consistency.showWindowControl).toBe(true);
  });

  it("reads streak columns without recomputing them", () => {
    expect(rec.streak.current).toBe(7);
    expect(rec.streak.best).toBe(7);
    expect(rec.streak.since).toBe("29 Aug");
    expect(rec.streak.note).toBe("Unbroken since 29 Aug.");
  });

  it("builds both challenge rows and proof tiles from the union", () => {
    expect(rec.runs.map((r) => r.dayLabel)).toEqual(["Day 12 of 30", "Day 3 of 14"]);
    expect(rec.runs[0]?.meta).toBe("10 verified · 1 missed · 2 tasks daily");
    expect(rec.runs[1]?.meta).toBe("2 verified · 0 missed · 2 tasks daily");
    expect(rec.proofs.map((p) => p.day)).toEqual([11, 10, 9, 8, 7, 6, 5, 3, 2, 1]);
    expect(rec.detail.completion).toBe("10 of 11 due days");
    expect(rec.detail.firstProof).toBe("25 Aug 2026");
    expect(rec.detail.months).toEqual([
      { label: "Sep 2026", value: "4 of 4", pct: 1 },
      { label: "Aug 2026", value: "6 of 7", pct: 6 / 7 },
    ]);
    expect(rec.detail.byChallenge).toEqual([
      { label: "Read Something", value: "10 of 11" },
      { label: "Cold Plunge Ladder", value: "2 of 2" },
    ]);
  });

  it("maps the five marks; 3 and 7 earned with dates", () => {
    expect(rec.badges.map((b) => b.name)).toEqual([
      "3 days",
      "7 days",
      "14 days",
      "30 days",
      "100 verified",
    ]);
    expect(rec.badges[0]?.state).toBe("Earned 31 Aug 2026");
    expect(rec.badges[1]?.state).toBe("Earned 4 Sep 2026");
    expect(rec.badges[2]?.state).toBe("7 / 14");
    expect(rec.badges[4]?.state).toBe("10 / 100");
  });
});

describe("fixture B — 3 due days", () => {
  const rec = buildProfileRecord(fixtureThree());

  it("hides the percentage and verdict under 7 due days", () => {
    expect(rec.consistency.dueDayKeys).toHaveLength(3);
    expect(rec.consistency.rate).toBe("2 of 2");
    expect(rec.consistency.verdict).toBe("");
    expect(rec.consistency.line).toBe("Day 3 of 30. Today's proof is due.");
    expect(rec.consistency.strip).toEqual([V, V, T]);
    expect(rec.consistency.showWindowControl).toBe(false);
    expect(rec.proofs.map((p) => p.day)).toEqual([2, 1]);
    expect(rec.badges[0]?.state).toBe("2 / 3");
  });
});

describe("fixture D — 30 due days", () => {
  const rec = buildProfileRecord(fixtureThirty());

  it("caps the strip at 30 cells and reports 93% Locked in", () => {
    expect(rec.consistency.dueDayKeys).toHaveLength(30);
    expect(rec.consistency.closedDueDays).toBe(29);
    expect(rec.consistency.verifiedClosed).toBe(27);
    expect(rec.consistency.rate).toBe("93%");
    expect(rec.consistency.verdict).toBe("Locked in");
    expect(rec.consistency.line).toBe("27 of 29 due days verified. 1 due today.");
    expect(rec.consistency.strip).toHaveLength(30);
    expect(rec.consistency.strip[3]).toBe(M);
    expect(rec.consistency.strip[11]).toBe(M);
    expect(rec.consistency.strip[29]).toBe(T);
    expect(cellWidth(rec.consistency.strip.length)).toBe(6);
    expect(rec.runs[0]?.dayLabel).toBe("Day 30 of 30");
    expect(rec.detail.months[0]).toEqual({ label: "Sep 2026", value: "4 of 4", pct: 1 });
    expect(rec.detail.months[1]).toEqual({ label: "Aug 2026", value: "23 of 25", pct: 23 / 25 });
  });
});

describe("fixture C — no challenge", () => {
  const rec = buildProfileRecord(fixtureNone());

  it("is an empty record, not invented zeros on the strip", () => {
    expect(rec.consistency.rate).toBe("No due days");
    expect(rec.consistency.verdict).toBe("");
    expect(rec.consistency.line).toBe("Join a challenge and the strip starts filling.");
    expect(rec.consistency.strip).toEqual([]);
    expect(rec.consistency.weeks.every((w) => w === null)).toBe(true);
    expect(rec.streak.note).toBe("Post today to start.");
    expect(rec.runs).toEqual([]);
    expect(rec.proofs).toEqual([]);
    expect(rec.detail.completion).toBe("—");
    expect(rec.detail.firstProof).toBe("—");
    expect(rec.badges.every((b) => b.state.startsWith("0 /"))).toBe(true);
  });
});

describe("badgeRows helper matches fixture A", () => {
  it("uses bestStreak and verifiedDays, not stored tier names", () => {
    const rows = badgeRows({
      bestStreak: 7,
      verifiedDays: 10,
      badgeDates: { 3: "2026-08-31", 7: "2026-09-04" },
    });
    expect(rows[0]?.state).toBe("Earned 31 Aug 2026");
    expect(rows[2]?.state).toBe("7 / 14");
    expect(PROFILE_V2_BADGES).toHaveLength(5);
  });
});

describe("token map — brand.primary is not retargeted", () => {
  it("orange is the locked #DC5401 token", () => {
    expect(DS_COLORS_V2.brand.primary).toBe("#DC5401");
    expect(PROFILE_V2_COLOR.orange).toBe(DS_COLORS_V2.brand.primary);
  });
});
