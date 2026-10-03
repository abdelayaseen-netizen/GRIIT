import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { lastStandDaysAllTime, recordAccountVisible } from "./profiles-record";

const PUBLIC = {
  user_id: "owner",
  profile_visibility: "public",
  challenge_visibility: "public",
  activity_visibility: "public",
};
const PRIVATE = {
  user_id: "owner",
  profile_visibility: "private",
  challenge_visibility: "public",
  activity_visibility: "public",
};


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

describe("stranger preview gate", () => {
  it("public owner previewing sees the public view", () => {
    expect(
      recordAccountVisible({
        previewStranger: true,
        viewerId: "owner",
        owner: PUBLIC,
        isMutual: false,
      }),
    ).toBe(true);
  });

  it("private owner previewing sees the lock", () => {
    expect(
      recordAccountVisible({
        previewStranger: true,
        viewerId: "owner",
        owner: PRIVATE,
        isMutual: false,
      }),
    ).toBe(false);
  });
});
