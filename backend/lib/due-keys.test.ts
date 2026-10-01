import { describe, expect, it } from "vitest";
import { dueKeysForRange, yesterdayWasDueDay } from "./due-keys";

const TODAY = "2026-09-14";
const YESTERDAY = "2026-09-13";

function range(startDateKey: string, endDateKey: string, status = "active") {
  return { status, startDateKey, endDateKey };
}

describe("yesterdayWasDueDay", () => {
  it("new account joined today → yesterday was not due", () => {
    expect(
      yesterdayWasDueDay({
        yesterdayKey: YESTERDAY,
        todayKey: TODAY,
        ranges: [range(TODAY, "2026-09-21")],
        requiredDueCount: 2,
      }),
    ).toBe(false);
    expect(dueKeysForRange(range(TODAY, "2026-09-21"), TODAY)).toEqual([TODAY]);
  });

  it("joined 3 days ago and missed yesterday → due", () => {
    expect(
      yesterdayWasDueDay({
        yesterdayKey: YESTERDAY,
        todayKey: TODAY,
        ranges: [range("2026-09-11", "2026-09-21")],
        requiredDueCount: 1,
      }),
    ).toBe(true);
  });

  it("yesterday before first start → not due", () => {
    expect(
      yesterdayWasDueDay({
        yesterdayKey: YESTERDAY,
        todayKey: TODAY,
        ranges: [range("2026-09-14", "2026-09-21")],
        requiredDueCount: 1,
      }),
    ).toBe(false);
  });

  it("yesterday with 0 due tasks → not due", () => {
    expect(
      yesterdayWasDueDay({
        yesterdayKey: YESTERDAY,
        todayKey: TODAY,
        ranges: [range("2026-09-01", "2026-09-21")],
        requiredDueCount: 0,
      }),
    ).toBe(false);
  });
});
