import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { lastStandDaysAllTime } from "./profiles-record";

describe("getRecord lastStandDays", () => {
  it("is the all-time last_stand_uses count helper still exported", () => {
    expect(lastStandDaysAllTime([{ date_key: "2026-01-01" }, { date_key: "2026-09-16" }])).toBe(2);
    expect(lastStandDaysAllTime([])).toBe(0);
  });
});

describe("getRecord proofs days", () => {
  it("builds days[] via proofs-days and drops fractionDateKeysForRange", () => {
    const src = readFileSync(resolve(__dirname, "./profiles-record.ts"), "utf8");
    expect(src).toContain("buildProofsDays");
    expect(src).toContain("proofsBreakdown");
    expect(src).toContain("proofsHeader");
    expect(src).toContain("rangeSecuredElapsed");
    expect(src).toContain("viewer: \"visitor\"");
    expect(src).toContain("header");
    expect(src).not.toContain("fractionDateKeysForRange");
    expect(src).toContain("daySource");
    expect(src).toContain("checkInHasCameraProof");
    expect(src).toContain("fullHouseAtFromRoster");
    expect(src).toContain("fullHouseAt");
  });
});
