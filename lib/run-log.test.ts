import { describe, it, expect } from "vitest";
import { RUN_LOG_HELPER, formatRunSecuredMeta } from "./run-log";

describe("Run · Log copy", () => {
  it("locks helper string", () => {
    expect(RUN_LOG_HELPER).toBe("or run the in-app timer");
  });
});

describe("formatRunSecuredMeta", () => {
  it("formats km · min for both entry modes", () => {
    expect(formatRunSecuredMeta(5.2, 32)).toBe("5.2 km · 32 min");
    expect(formatRunSecuredMeta(3, 20)).toBe("3 km · 20 min");
  });
});
