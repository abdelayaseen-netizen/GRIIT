import { describe, it, expect } from "vitest";
import { formatCheckinSecuredMeta } from "./checkin-log";

describe("formatCheckinSecuredMeta", () => {
  it("locks Secured meta — On location when target configured", () => {
    expect(formatCheckinSecuredMeta(true)).toBe("On location");
    expect(formatCheckinSecuredMeta()).toBe("On location");
  });

  it("locks Secured meta — Checked in when no location target", () => {
    expect(formatCheckinSecuredMeta(false)).toBe("Checked in");
  });
});
