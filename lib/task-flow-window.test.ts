import { describe, expect, it } from "vitest";
import type { GateTime } from "@/backend/lib/task-model";
import {
  flowAllowsSubmit,
  flowFooterBrand,
  flowFooterCaption,
  flowHeaderTitle,
  gatesFromConfig,
  isWindowClosedError,
} from "@/lib/task-flow-window";
import { WINDOW_CLOSED_FORBIDDEN } from "@/lib/task-ui";

const bySeven: GateTime = { mode: "by", start: "07:00", end: null };
const between: GateTime = { mode: "between", start: "09:30", end: "10:30" };

describe("flowHeaderTitle", () => {
  it("Day n · By 7:00 am", () => {
    expect(flowHeaderTitle(3, bySeven, "Self-report")).toBe("Day 3 · By 7:00 am");
  });

  it("Day n · Between 9:30 and 10:30 am", () => {
    expect(flowHeaderTitle(1, between, "Timer")).toBe("Day 1 · Between 9:30 and 10:30 am");
  });

  it("falls back when there is no time gate", () => {
    expect(flowHeaderTitle(2, null, "Self-report")).toBe("Day 2 · Self-report");
  });

  it("Day n · Camera when the camera gate is the header fallback", () => {
    expect(flowHeaderTitle(1, null, "Camera")).toBe("Day 1 · Camera");
  });
});

describe("gatesFromConfig", () => {
  it("reads the backend gates array and drops anything else", () => {
    expect(gatesFromConfig({ gates: ["camera"] })).toEqual(["camera"]);
    expect(gatesFromConfig({ gates: ["camera", "time"], require_photo: true })).toEqual([
      "camera",
      "time",
    ]);
    expect(gatesFromConfig({ require_photo: true })).toEqual([]);
    expect(gatesFromConfig({ gates: ["heart_rate", "camera"] })).toEqual(["camera"]);
  });
});

describe("flow footer by windowState", () => {
  it("closing uses minutes left in brand", () => {
    expect(flowFooterCaption("closing", 12, "Nothing is secured until the server says so.")).toBe(
      "12 minutes left in the window.",
    );
    expect(flowFooterBrand("closing")).toBe(true);
  });

  it("open keeps the fallback caption", () => {
    expect(flowFooterCaption("open", null, "Nothing is secured until the server says so.")).toBe(
      "Nothing is secured until the server says so.",
    );
    expect(flowFooterBrand("open")).toBe(false);
  });

  it("closed has no submit", () => {
    expect(flowAllowsSubmit("closed")).toBe(false);
    expect(flowAllowsSubmit("open")).toBe(true);
    expect(flowAllowsSubmit("closing")).toBe(true);
    expect(isWindowClosedError(WINDOW_CLOSED_FORBIDDEN)).toBe(true);
  });
});
