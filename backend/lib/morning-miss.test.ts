import { describe, expect, it } from "vitest";
import { medianCheckInMinutes, morningMissBody, shouldSendMorningMiss } from "./morning-miss";

describe("morning-after miss push", () => {
  const open = {
    everSecured: true,
    yesterdaySecured: false,
    yesterdayFrozen: false,
    alreadySentForDate: false,
    pushesToday: 0,
    nowMinutes: 9 * 60,
    targetMinutes: 9 * 60,
  };

  it("sends in the target hour after an uncovered miss", () => {
    expect(shouldSendMorningMiss(open)).toBe(true);
  });

  it("stays quiet when the member has never secured a day", () => {
    expect(shouldSendMorningMiss({ ...open, everSecured: false })).toBe(false);
  });

  it("stays quiet when yesterday was secured or held", () => {
    expect(shouldSendMorningMiss({ ...open, yesterdaySecured: true })).toBe(false);
    expect(shouldSendMorningMiss({ ...open, yesterdayFrozen: true })).toBe(false);
  });

  it("is never sent twice and counts toward the 3-a-day cap", () => {
    expect(shouldSendMorningMiss({ ...open, alreadySentForDate: true })).toBe(false);
    expect(shouldSendMorningMiss({ ...open, pushesToday: 3 })).toBe(false);
    expect(shouldSendMorningMiss({ ...open, pushesToday: 2 })).toBe(true);
  });

  it("uses 9:00 when there is no check-in history", () => {
    expect(medianCheckInMinutes([])).toBe(9 * 60);
    expect(medianCheckInMinutes([8 * 60, 10 * 60])).toBe(9 * 60);
    expect(medianCheckInMinutes([7 * 60, 8 * 60, 11 * 60])).toBe(8 * 60);
  });

  it("uses the freeze branch only when a freeze is held", () => {
    expect(morningMissBody(true)).toBe("Yesterday wasn’t secured. A freeze can hold it until midnight.");
    expect(morningMissBody(false)).toBe("Secure today and you’re back at 1.");
  });
});
