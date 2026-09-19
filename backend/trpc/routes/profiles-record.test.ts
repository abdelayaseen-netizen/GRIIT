import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { lastStandDaysAllTime } from "./profiles-record";

describe("getRecord lastStandDays", () => {
  it("is the all-time last_stand_uses count, same scope as cameraDays", () => {
    expect(lastStandDaysAllTime([{ date_key: "2026-01-01" }, { date_key: "2026-09-16" }])).toBe(2);
    expect(lastStandDaysAllTime([])).toBe(0);
    const src = readFileSync(resolve(__dirname, "./profiles-record.ts"), "utf8");
    expect(src).toContain("lastStandDays: lastStandDaysAllTime");
    expect(src).toContain("freezeDays: lastStandDaysAllTime");
    expect(src).toContain("cameraDays: split.cameraDays");
    expect(src).toContain("selfReportedDays: split.selfReportedDays");
  });
});
