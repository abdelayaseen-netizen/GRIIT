import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  filterOnboardingStarterPack,
  isOnboardingStarterEligible,
  ONBOARD_WATER_STARTER_ID,
} from "./onboarding-starter-pack";

describe("onboarding starter pack", () => {
  it("keeps catalog rows with duration_days ≥ 2", () => {
    expect(
      isOnboardingStarterEligible({
        creator_id: null,
        duration_days: 7,
        source_starter_id: "onboard-steps",
      }),
    ).toBe(true);
    expect(
      isOnboardingStarterEligible({
        creator_id: null,
        duration_days: 75,
        source_starter_id: null,
      }),
    ).toBe(true);
  });

  it("drops 1-day rows and onboard-water, keeps the DB row unused", () => {
    expect(
      isOnboardingStarterEligible({
        creator_id: null,
        duration_days: 1,
        source_starter_id: ONBOARD_WATER_STARTER_ID,
      }),
    ).toBe(false);
    expect(
      isOnboardingStarterEligible({
        creator_id: null,
        duration_days: 30,
        source_starter_id: ONBOARD_WATER_STARTER_ID,
      }),
    ).toBe(false);
    expect(
      isOnboardingStarterEligible({
        creator_id: null,
        duration_days: 1,
        source_starter_id: "onboard-journal",
      }),
    ).toBe(false);
    expect(
      filterOnboardingStarterPack([
        { id: "water", creator_id: null, duration_days: 1, source_starter_id: ONBOARD_WATER_STARTER_ID },
        { id: "read", creator_id: null, duration_days: 30, source_starter_id: null },
        { id: "user", creator_id: "someone", duration_days: 30 },
      ]),
    ).toEqual([{ id: "read", creator_id: null, duration_days: 30, source_starter_id: null }]);
  });

  it("getStarterPack applies the filter and no longer orders onboard-water first", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/challenges-discover.ts"), "utf8");
    expect(src).toContain("filterOnboardingStarterPack");
    expect(src).toMatch(/getStarterPack[\s\S]*filterOnboardingStarterPack/);
    expect(src).not.toMatch(/ORDER: string\[\] = \[\s*'onboard-water'/);
  });
});
