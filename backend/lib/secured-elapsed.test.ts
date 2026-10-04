import { describe, expect, it } from "vitest";
import { dueKeysForRange } from "./due-keys";
import { challengeBoardWeekCount } from "./secured-elapsed";
import { weekSecuredOfDue } from "../../lib/g2a-challenge";
import { rangeSecuredElapsed } from "../../lib/profile-v2-record";

describe("challenge secured window", () => {
  it("a user who joined Saturday with secures on Tuesday shows 0 this week, not 2", () => {
    const weekStartKey = "2026-09-28";
    const tuesday = "2026-09-29";
    const wednesday = "2026-09-30";
    const saturday = "2026-10-03";
    const todayKey = "2026-10-04";
    const securedDateKeys = [tuesday, wednesday];
    const inOpenWeek = securedDateKeys.filter((k) => k >= weekStartKey && k <= todayKey);
    expect(inOpenWeek).toHaveLength(2);

    const dueDateKeys = dueKeysForRange(
      { status: "active", startDateKey: saturday, endDateKey: "2026-11-02" },
      todayKey,
    );
    expect(
      challengeBoardWeekCount({
        securedDateKeys,
        dueDateKeys,
        weekStartKey,
        todayKey,
      }),
    ).toBe(0);

    expect(
      weekSecuredOfDue({
        weekKeys: [
          "2026-09-28",
          "2026-09-29",
          "2026-09-30",
          "2026-10-01",
          "2026-10-02",
          "2026-10-03",
          "2026-10-04",
        ],
        securedDateKeys,
        todayKey,
        startDateKey: saturday,
        durationDays: 30,
        todaySecured: false,
      }).secured,
    ).toBe(0);

    expect(
      rangeSecuredElapsed(
        { status: "active", startDateKey: saturday, endDateKey: "2026-11-02" },
        securedDateKeys,
        todayKey,
      ).secured,
    ).toBe(0);
  });
});
