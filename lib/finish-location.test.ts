import { describe, expect, it } from "vitest";
import { finishWaitsOnLocation, LOCATION_FIX_TIMEOUT_MS } from "@/lib/finish-location";

describe("finishWaitsOnLocation", () => {
  it("lets a location-gated task wait, and a normal photo task does not", () => {
    expect(LOCATION_FIX_TIMEOUT_MS).toBe(5000);
    expect(finishWaitsOnLocation({ taskType: "checkin", requireLocation: false, hasTarget: true })).toBe(true);
    expect(finishWaitsOnLocation({ taskType: "photo", requireLocation: true, hasTarget: true })).toBe(true);
    expect(finishWaitsOnLocation({ taskType: "photo", requireLocation: false, hasTarget: true })).toBe(false);
    expect(finishWaitsOnLocation({ taskType: "manual", requireLocation: false, hasTarget: true })).toBe(false);
    expect(finishWaitsOnLocation({ taskType: "timer", requireLocation: false, hasTarget: false })).toBe(false);
    expect(finishWaitsOnLocation({ taskType: "journal", requireLocation: false, hasTarget: true })).toBe(false);
    expect(finishWaitsOnLocation({ taskType: "checkin", requireLocation: true, hasTarget: false })).toBe(false);
  });
});
