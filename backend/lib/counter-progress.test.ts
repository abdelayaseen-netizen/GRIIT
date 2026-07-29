import { describe, it, expect } from "vitest";
import { decideCounterProgressWrite } from "./counter-progress";

describe("decideCounterProgressWrite", () => {
  it("rejects further writes when row is already completed", () => {
    expect(
      decideCounterProgressWrite({
        existingStatus: "completed",
        existingValue: 8,
        incomingValue: 9,
      })
    ).toEqual({ action: "reject_completed", storedValue: 8 });
  });

  it("no-ops when incoming value is lower than stored (stale write)", () => {
    expect(
      decideCounterProgressWrite({
        existingStatus: "pending",
        existingValue: 5,
        incomingValue: 3,
      })
    ).toEqual({ action: "noop_stale", storedValue: 5 });
  });

  it("writes when incoming equals or exceeds stored", () => {
    expect(
      decideCounterProgressWrite({
        existingStatus: "pending",
        existingValue: 5,
        incomingValue: 5,
      })
    ).toEqual({ action: "write", nextValue: 5 });
    expect(
      decideCounterProgressWrite({
        existingStatus: "pending",
        existingValue: 5,
        incomingValue: 6,
      })
    ).toEqual({ action: "write", nextValue: 6 });
  });

  it("writes from empty pending as 0 baseline", () => {
    expect(
      decideCounterProgressWrite({
        existingStatus: "pending",
        existingValue: null,
        incomingValue: 1,
      })
    ).toEqual({ action: "write", nextValue: 1 });
  });
});
