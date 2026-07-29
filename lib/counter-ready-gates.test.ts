import { describe, it, expect } from "vitest";
import {
  buildCounterReadyGates,
  COUNTER_ALL_DAY_GATE_LABEL,
  formatCounterTargetGateLabel,
  resolveCounterReadySubtype,
  counterReadyHelper,
} from "./counter-ready-gates";

describe("buildCounterReadyGates", () => {
  it("always includes all-day gate and never a time window", () => {
    const gates = buildCounterReadyGates({ target: 8, variant: "water" });
    expect(gates.map((g) => g.key)).toEqual(["all_day", "target"]);
    expect(gates[0]?.label).toBe(COUNTER_ALL_DAY_GATE_LABEL);
    expect(gates.some((g) => g.key === "time")).toBe(false);
  });

  it("formats Target · N cups · Tap each one for water", () => {
    expect(formatCounterTargetGateLabel(8, "cups")).toBe(
      "Target · 8 cups · Tap each one"
    );
  });

  it("omits target gate when target missing", () => {
    expect(buildCounterReadyGates({ target: 0, variant: "water" }).map((g) => g.key)).toEqual([
      "all_day",
    ]);
  });
});

describe("resolveCounterReadySubtype / helper", () => {
  it("falls back by variant", () => {
    expect(resolveCounterReadySubtype({}, "water")).toBe("Water");
    expect(resolveCounterReadySubtype({}, "reading")).toBe("Reading");
    expect(resolveCounterReadySubtype({}, "counter")).toBe("Counter");
  });

  it("reading helper mentions optional page photo", () => {
    expect(counterReadyHelper("reading")).toBe(
      "Reading adds an optional page photo."
    );
    expect(counterReadyHelper("water")).toBe("Tap up to your daily target.");
  });
});
