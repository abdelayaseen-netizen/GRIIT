import { describe, it, expect } from "vitest";
import { formatCheckinSecuredMeta } from "./checkin-log";

describe("formatCheckinSecuredMeta", () => {
  it("locks Secured meta — On location, no dwell", () => {
    expect(formatCheckinSecuredMeta()).toBe("On location");
  });
});
