import { describe, expect, it } from "vitest";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import {
  TYPE_CAPTION,
  closedWindowCaption,
  closedWindowTime,
  format12h,
  formatGateTime,
  formatWindowRange,
  gateLine,
  windowClosedAtLine,
  typeCaption,
  wizardGateLine,
} from "@/lib/task-ui";

const bySeven: GateTime = { mode: "by", start: "07:00", end: null };
const betweenNineThirty: GateTime = { mode: "between", start: "09:30", end: "10:30" };
const betweenSixNine: GateTime = { mode: "between", start: "06:00", end: "09:00" };
const betweenCross: GateTime = { mode: "between", start: "11:30", end: "12:30" };

describe("format12h", () => {
  it("formats 7:00 am with minutes and am/pm", () => {
    expect(format12h("07:00")).toBe("7:00 am");
    expect(format12h("7:00")).toBe("7:00 am");
  });

  it("formats 9:30 am and noon/midnight", () => {
    expect(format12h("09:30")).toBe("9:30 am");
    expect(format12h("12:00")).toBe("12:00 pm");
    expect(format12h("00:00")).toBe("12:00 am");
    expect(format12h("21:00")).toBe("9:00 pm");
  });
});

describe("formatGateTime", () => {
  it("By 7:00 am", () => {
    expect(formatGateTime(bySeven)).toBe("By 7:00 am");
  });

  it("Between 9:30 and 10:30 am when both are am", () => {
    expect(formatGateTime(betweenNineThirty)).toBe("Between 9:30 and 10:30 am");
  });

  it("keeps both meridiems when they differ", () => {
    expect(formatGateTime(betweenCross)).toBe("Between 11:30 am and 12:30 pm");
  });
});

describe("gateLine", () => {
  it("Self-reported when gates are empty", () => {
    expect(gateLine([])).toBe("Self-reported");
    expect(gateLine(null)).toBe("Self-reported");
    expect(gateLine(undefined)).toBe("Self-reported");
  });

  it("Camera alone", () => {
    expect(gateLine(["camera"])).toBe("Camera");
  });

  it("time by and between", () => {
    expect(gateLine(["time"], bySeven)).toBe("By 7:00 am");
    expect(gateLine(["time"], betweenNineThirty)).toBe("Between 9:30 and 10:30 am");
  });

  it("Location alone", () => {
    expect(gateLine(["location"])).toBe("Location");
  });

  it("Camera · By 7:00 am", () => {
    expect(gateLine(["camera", "time"], bySeven)).toBe("Camera · By 7:00 am");
  });

  it("Camera · Location", () => {
    expect(gateLine(["camera", "location"])).toBe("Camera · Location");
  });

  it("By 7:00 am · Location", () => {
    expect(gateLine(["time", "location"], bySeven)).toBe("By 7:00 am · Location");
  });

  it("Camera · By 7:00 am · Location in that order regardless of input order", () => {
    const gates: TaskGate[] = ["location", "time", "camera"];
    expect(gateLine(gates, bySeven)).toBe("Camera · By 7:00 am · Location");
  });

  it("Camera · Between 9:30 and 10:30 am · Location", () => {
    expect(gateLine(["camera", "time", "location"], betweenNineThirty)).toBe(
      "Camera · Between 9:30 and 10:30 am · Location",
    );
  });
});

describe("wizardGateLine", () => {
  it("prefers gates over requirePhoto", () => {
    expect(wizardGateLine({ gates: ["location"], requirePhoto: true })).toBe("Camera · Place");
  });

  it("camera from requirePhoto when gates are missing", () => {
    expect(wizardGateLine({ requirePhoto: true })).toBe("Camera");
    expect(wizardGateLine({ requirePhoto: false })).toBe("Self-reported");
  });

  it("task rows show quantity · camera · time · place name", () => {
    expect(
      wizardGateLine({
        type: "counter",
        targetValue: 30,
        unit: "pages",
        gates: ["camera", "time", "location"],
        gateTime: { mode: "by", start: "07:00", end: null },
        requirePhoto: true,
        locationName: "Gym",
      }),
    ).toBe("30 pages · Camera · By 7:00 am · Gym");
  });
});

describe("typeCaption", () => {
  it("matches the 104–105 one-line captions", () => {
    expect(typeCaption("check_off")).toBe("Tap when it is done.");
    expect(typeCaption("timer")).toBe("Run a timer in the app.");
    expect(typeCaption("counter")).toBe("Hit a number, like 8 glasses.");
    expect(typeCaption("text")).toBe("Write a set number of words.");
    expect(typeCaption("run")).toBe("Log distance and time.");
    expect(TYPE_CAPTION.check_off).toBe(typeCaption("check_off"));
  });
});

describe("closed window range", () => {
  it("Window closed · 6:00–9:00 am", () => {
    expect(formatWindowRange(betweenSixNine)).toBe("6:00–9:00 am");
    expect(closedWindowCaption(betweenSixNine)).toBe("Window closed · 6:00–9:00 am");
  });

  it("by-mode uses midnight to the deadline", () => {
    expect(closedWindowCaption(bySeven)).toBe("Window closed · 12:00–7:00 am");
  });
});

describe("windowClosedAtLine", () => {
  it("uses the By time and the Between end", () => {
    expect(closedWindowTime(bySeven)).toBe("7:00 am");
    expect(closedWindowTime({ mode: "by", start: null, end: "07:00" })).toBe("7:00 am");
    expect(closedWindowTime(betweenNineThirty)).toBe("10:30 am");
    expect(windowClosedAtLine(closedWindowTime(bySeven))).toBe(
      "Window closed at 7:00 am. Today is not secured.",
    );
    expect(windowClosedAtLine(closedWindowTime(betweenNineThirty))).toBe(
      "Window closed at 10:30 am. Today is not secured.",
    );
    expect(windowClosedAtLine(closedWindowTime(bySeven))).not.toBe(
      "Window closed at . Today is not secured.",
    );
  });
});
