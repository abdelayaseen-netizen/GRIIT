import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { assertTimeGate, windowStateFor } from "./task-time-gate";

const NY = "America/New_York";
const TOKYO = "Asia/Tokyo";

/** 2026-09-17 is EDT (UTC−4). */
function utc(iso: string): Date {
  return new Date(iso);
}

const bySeven = {
  task_type: "check_off",
  gate_time_mode: "by" as const,
  gate_time_start: "07:00",
  gate_time_end: null,
};

const betweenNineThirty = {
  task_type: "check_off",
  gate_time_mode: "between" as const,
  gate_time_start: "09:30",
  gate_time_end: "10:30",
};

describe("assertTimeGate", () => {
  it("by 07:00 at 06:59 is accepted", () => {
    expect(() =>
      assertTimeGate(bySeven, NY, utc("2026-09-17T10:59:00.000Z"))
    ).not.toThrow();
  });

  it("by 07:00 at 07:01 is rejected FORBIDDEN Window closed.", () => {
    try {
      assertTimeGate(bySeven, NY, utc("2026-09-17T11:01:00.000Z"));
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).code).toBe("FORBIDDEN");
      expect((e as TRPCError).message).toBe("Window closed.");
    }
  });

  it("between 09:30–10:30 at 10:31 is rejected", () => {
    try {
      assertTimeGate(betweenNineThirty, NY, utc("2026-09-17T14:31:00.000Z"));
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).code).toBe("FORBIDDEN");
      expect((e as TRPCError).message).toBe("Window closed.");
    }
  });
});

describe("windowStateFor", () => {
  it("closing at 06:46 for by 07:00", () => {
    expect(windowStateFor(bySeven, NY, utc("2026-09-17T10:46:00.000Z"))).toBe(
      "closing"
    );
  });

  it("same UTC instant: Asia/Tokyo closed, America/New_York closing", () => {
    const instant = utc("2026-09-17T10:46:00.000Z");
    expect(windowStateFor(bySeven, TOKYO, instant)).toBe("closed");
    expect(windowStateFor(bySeven, NY, instant)).toBe("closing");
  });

  it("null when there is no time gate", () => {
    expect(windowStateFor({ task_type: "check_off" }, NY, utc("2026-09-17T10:46:00.000Z"))).toBe(
      null
    );
  });
});
