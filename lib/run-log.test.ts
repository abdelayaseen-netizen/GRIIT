import { describe, it, expect } from "vitest";
import { RUN_LOG_HELPER } from "./run-log";

describe("Run · Log copy", () => {
  it("locks helper string", () => {
    expect(RUN_LOG_HELPER).toBe("or run the in-app timer");
  });
});
