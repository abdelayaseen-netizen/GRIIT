import { describe, it, expect } from "vitest";
import { decideCounterProgressWrite, decidePartialLogWrite } from "./counter-progress";
import { dateKeyInTimeZone } from "./date-utils";

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

/** Build 92 chunk 03.5: partial logs add up within the local day. */
describe("decidePartialLogWrite", () => {
  it("adds to the pending total and keeps every log", () => {
    const first = decidePartialLogWrite({
      existingStatus: undefined,
      existingValue: null,
      existingPayload: null,
      incomingValue: 2,
      log: { distance_km: 3.22, duration_min: 20, entry_mode: "hand" },
      at: "2026-10-18T14:00:00.000Z",
    });
    expect(first.action).toBe("write");
    if (first.action !== "write") return;
    expect(first.nextValue).toBe(2);
    expect(first.payload.partial_logs).toHaveLength(1);
    const second = decidePartialLogWrite({
      existingStatus: "pending",
      existingValue: 2,
      existingPayload: first.payload,
      incomingValue: 1,
      log: { distance_km: 1.61, duration_min: 10, entry_mode: "hand" },
      at: "2026-10-18T18:00:00.000Z",
    });
    expect(second.action).toBe("write");
    if (second.action !== "write") return;
    expect(second.nextValue).toBe(3);
    expect(second.payload.partial_logs).toHaveLength(2);
    expect(second.payload.partial_logs[1]).toMatchObject({ value: 1, distance_km: 1.61, at: "2026-10-18T18:00:00.000Z" });
  });

  it("a lower second log still adds (it is not a stale write)", () => {
    const d = decidePartialLogWrite({
      existingStatus: "pending",
      existingValue: 5,
      existingPayload: null,
      incomingValue: 1,
      log: {},
      at: "2026-10-18T18:00:00.000Z",
    });
    expect(d).toMatchObject({ action: "write", nextValue: 6 });
  });

  it("rejects once the task is completed and ignores a foreign payload shape", () => {
    expect(
      decidePartialLogWrite({
        existingStatus: "completed",
        existingValue: 3,
        existingPayload: null,
        incomingValue: 1,
        log: {},
        at: "2026-10-18T18:00:00.000Z",
      }),
    ).toEqual({ action: "reject_completed", storedValue: 3 });
    const d = decidePartialLogWrite({
      existingStatus: "pending",
      existingValue: 0.5,
      existingPayload: { timer: true },
      incomingValue: 0.25,
      log: {},
      at: "2026-10-18T18:00:00.000Z",
    });
    expect(d).toMatchObject({ action: "write", nextValue: 0.75 });
    if (d.action === "write") expect(d.payload.timer).toBe(true);
  });

  it("totals live under the local date_key, so they reset at local midnight in each zone", () => {
    // 2026-10-19 06:30 UTC: still the 18th in Los Angeles (23:30), already the 19th in Tokyo (15:30).
    const instant = new Date("2026-10-19T06:30:00.000Z");
    expect(dateKeyInTimeZone(instant, "America/Los_Angeles")).toBe("2026-10-18");
    expect(dateKeyInTimeZone(instant, "Asia/Tokyo")).toBe("2026-10-19");
    // One hour later Los Angeles has crossed midnight: a new key, so a fresh total.
    const later = new Date("2026-10-19T07:30:00.000Z");
    expect(dateKeyInTimeZone(later, "America/Los_Angeles")).toBe("2026-10-19");
    expect(dateKeyInTimeZone(later, "Asia/Tokyo")).toBe("2026-10-19");
  });
});
