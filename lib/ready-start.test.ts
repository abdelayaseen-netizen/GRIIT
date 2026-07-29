import { describe, it, expect } from "vitest";
import { decideReadyStart, formatOpensAtLabel } from "./ready-start";

describe("formatOpensAtLabel", () => {
  it("formats zero-padded HH:MM", () => {
    expect(formatOpensAtLabel("07:00")).toBe("Opens at 07:00");
    expect(formatOpensAtLabel("7:05")).toBe("Opens at 07:05");
    expect(formatOpensAtLabel("22:30")).toBe("Opens at 22:30");
  });
});

describe("decideReadyStart", () => {
  it("enables when no window is configured", () => {
    expect(decideReadyStart({ status: "none", windowStart: null })).toEqual({
      canStart: true,
    });
  });

  it("enables when inside the window", () => {
    expect(
      decideReadyStart({ status: "in_window", windowStart: "07:00" })
    ).toEqual({ canStart: true });
  });

  it("disables out of window with Opens at {start}", () => {
    expect(
      decideReadyStart({ status: "out_of_window", windowStart: "07:00" })
    ).toEqual({
      canStart: false,
      disabledReason: "Opens at 07:00",
    });
  });

  it("disables out of window even if start string needs padding", () => {
    expect(
      decideReadyStart({ status: "out_of_window", windowStart: "6:30" })
    ).toEqual({
      canStart: false,
      disabledReason: "Opens at 06:30",
    });
  });
});
