import { describe, it, expect } from "vitest";
import { isValidIanaTimeZone, resolveIanaTimeZone } from "./iana-timezone-core";

describe("isValidIanaTimeZone", () => {
  it("accepts common IANA zones and UTC", () => {
    expect(isValidIanaTimeZone("UTC")).toBe(true);
    expect(isValidIanaTimeZone("America/New_York")).toBe(true);
    expect(isValidIanaTimeZone("Europe/London")).toBe(true);
  });

  it("rejects empty and garbage", () => {
    expect(isValidIanaTimeZone("")).toBe(false);
    expect(isValidIanaTimeZone("   ")).toBe(false);
    expect(isValidIanaTimeZone("Not/A_Zone")).toBe(false);
    expect(isValidIanaTimeZone("Foo/Bar/Baz")).toBe(false);
  });
});

describe("resolveIanaTimeZone", () => {
  it("keeps valid input", () => {
    expect(resolveIanaTimeZone("America/Chicago")).toBe("America/Chicago");
  });

  it("falls back then UTC on garbage", () => {
    expect(resolveIanaTimeZone("bogus", "Europe/Paris")).toBe("Europe/Paris");
    expect(resolveIanaTimeZone("bogus", "also-bogus")).toBe("UTC");
    expect(resolveIanaTimeZone(null)).toBe("UTC");
  });
});
