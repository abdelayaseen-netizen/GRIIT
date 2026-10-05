import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  flowAllowsSubmit,
  flowFooterBrand,
  flowFooterCaption,
  flowHeaderTitle,
  gatesFromConfig,
  isWindowClosedError,
} from "@/lib/task-flow-window";
import { WINDOW_CLOSED_FORBIDDEN } from "@/lib/task-ui";

describe("flowHeaderTitle", () => {
  it("is {challenge} · Day {n} of {N} and never the type", () => {
    expect(flowHeaderTitle("5am crew", 3, 30)).toBe("5am crew · Day 3 of 30");
    expect(flowHeaderTitle("Read 30 min", 1, 7)).toBe("Read 30 min · Day 1 of 7");
    expect(flowHeaderTitle("5am crew", 3, 30)).not.toMatch(/Camera|Timer|Counter|Self-report|By |Between /);
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

describe("window open copy", () => {
  it("reads the window start and never says midnight", () => {
    const blocked = readFileSync(resolve(__dirname, "../components/task-v2/steps/BlockedStep.tsx"), "utf8");
    const closed = readFileSync(resolve(__dirname, "../components/task-v2/steps/WindowClosedStep.tsx"), "utf8");
    const tomorrow = readFileSync(resolve(__dirname, "./task-ui.ts"), "utf8");
    expect(blocked).toContain("WINDOW.opensAt");
    expect(blocked).not.toMatch(/midnight/i);
    expect(closed).not.toMatch(/midnight/i);
    expect(tomorrow).not.toMatch(/Tomorrow opens at midnight/);
  });
});
