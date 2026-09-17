import { describe, expect, it } from "vitest";
import {
  GROUP_MAX_MEMBERS,
  computeGroupStreak,
  groupStreakBrokeBy,
  memberYesterdayState,
  shouldEvaluateTeamDay,
} from "./group-challenges";

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function keys(...days: string[]): Set<string> {
  return new Set(days);
}

describe("GROUP_MAX_MEMBERS", () => {
  it("is the constant 10", () => {
    expect(GROUP_MAX_MEMBERS).toBe(10);
  });
});

describe("shouldEvaluateTeamDay", () => {
  it("is false for participation_type team", () => {
    expect(shouldEvaluateTeamDay("team")).toBe(false);
  });
  it("is true for other types", () => {
    expect(shouldEvaluateTeamDay("solo")).toBe(true);
    expect(shouldEvaluateTeamDay("duo")).toBe(true);
    expect(shouldEvaluateTeamDay("shared_goal")).toBe(true);
  });
});

describe("computeGroupStreak", () => {
  const today = "2026-09-16";
  const d1 = "2026-09-13";
  const d2 = "2026-09-14";
  const d3 = "2026-09-15";
  const d4 = "2026-09-16";

  it("3 members all secured 4 days → 4", () => {
    const members = [
      { userId: A, joinedDateKey: d1 },
      { userId: B, joinedDateKey: d1 },
      { userId: C, joinedDateKey: d1 },
    ];
    const securedKeysByUser = new Map([
      [A, keys(d1, d2, d3, d4)],
      [B, keys(d1, d2, d3, d4)],
      [C, keys(d1, d2, d3, d4)],
    ]);
    expect(computeGroupStreak({ todayKey: today, members, securedKeysByUser })).toBe(4);
  });

  it("one misses day 3 → 1", () => {
    const members = [
      { userId: A, joinedDateKey: d1 },
      { userId: B, joinedDateKey: d1 },
      { userId: C, joinedDateKey: d1 },
    ];
    const securedKeysByUser = new Map([
      [A, keys(d1, d2, d3, d4)],
      [B, keys(d1, d2, d4)],
      [C, keys(d1, d2, d3, d4)],
    ]);
    expect(computeGroupStreak({ todayKey: today, members, securedKeysByUser })).toBe(1);
  });

  it("member joined day 3 counted from day 3", () => {
    const members = [
      { userId: A, joinedDateKey: d1 },
      { userId: B, joinedDateKey: d1 },
      { userId: C, joinedDateKey: d3 },
    ];
    const securedKeysByUser = new Map([
      [A, keys(d1, d2, d3, d4)],
      [B, keys(d1, d2, d3, d4)],
      [C, keys(d3, d4)],
    ]);
    expect(computeGroupStreak({ todayKey: today, members, securedKeysByUser })).toBe(4);
  });
});

describe("groupStreakBrokeBy", () => {
  it("names the member who missed yesterday after a qualifying day-before", () => {
    expect(
      groupStreakBrokeBy({
        todayKey: "2026-09-16",
        members: [
          { userId: A, joinedDateKey: "2026-09-13", displayName: "Ada" },
          { userId: B, joinedDateKey: "2026-09-13", displayName: "Bea" },
        ],
        securedKeysByUser: new Map([
          [A, keys("2026-09-13", "2026-09-14")],
          [B, keys("2026-09-13", "2026-09-14", "2026-09-15")],
        ]),
      }),
    ).toBe("Ada");
  });

  it("is null while the group streak is still live", () => {
    expect(
      groupStreakBrokeBy({
        todayKey: "2026-09-16",
        members: [
          { userId: A, joinedDateKey: "2026-09-13", displayName: "Ada" },
          { userId: B, joinedDateKey: "2026-09-13", displayName: "Bea" },
        ],
        securedKeysByUser: new Map([
          [A, keys("2026-09-15")],
          [B, keys("2026-09-15")],
        ]),
      }),
    ).toBeNull();
  });
});

describe("memberYesterdayState", () => {
  it("is secured or missed from day_secures at the yesterday key", () => {
    expect(memberYesterdayState(keys("2026-09-15"), "2026-09-15")).toBe("secured");
    expect(memberYesterdayState(keys("2026-09-14"), "2026-09-15")).toBe("missed");
  });
});
