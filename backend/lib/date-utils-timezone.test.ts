import { describe, it, expect } from "vitest";
import { resolveCheckInTimeZone } from "./date-utils";

describe("resolveCheckInTimeZone", () => {
  it("prefers task schedule_timezone over profile", () => {
    expect(
      resolveCheckInTimeZone("America/Los_Angeles", "America/New_York")
    ).toBe("America/Los_Angeles");
  });

  it("falls back to profile when schedule unset", () => {
    expect(resolveCheckInTimeZone(null, "America/New_York")).toBe(
      "America/New_York"
    );
    expect(resolveCheckInTimeZone("  ", "Europe/London")).toBe("Europe/London");
  });

  it("falls back to UTC when both missing", () => {
    expect(resolveCheckInTimeZone(null, null)).toBe("UTC");
    expect(resolveCheckInTimeZone(undefined, undefined)).toBe("UTC");
  });
});
