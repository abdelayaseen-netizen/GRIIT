import { describe, expect, it } from "vitest";
import { resolveTarget, systemAlert, usablePoint } from "./match";
import type { El } from "./screen";

const el = (a11y: string, bounds: string): El => ({ text: "", a11y, id: "", bounds, value: "" });

describe("tap matching", () => {
  it("matches a short goal name to the full row and returns its center", () => {
    const hit = resolveTarget("Physical toughness", [
      el("GRIIT", "[0,0][393,852]"),
      el("Physical toughness. Lifting, running, no missed sessions", "[16,204][190,316]"),
      el("Pick at least one", "[16,700][377,748]"),
    ]);
    expect(hit?.label.startsWith("Physical toughness")).toBe(true);
    expect(hit?.point).toBe("26%,31%");
  });

  it("prefers the taller Email field over the caption", () => {
    const hit = resolveTarget("Email", [
      el("GRIIT", "[0,0][393,852]"),
      el("EMAIL", "[16,204][377,217]"),
      el("Email", "[17,224][376,270]"),
    ]);
    expect(hit?.label).toBe("Email");
    expect(hit?.point).toBe("50%,29%");
  });

  it("prefers the Email field over the caption and Forgot password", () => {
    const els = [
      el("GRIIT", "[0,0][393,852]"),
      el("Email", "[16,325][377,343]"),
      el("Email address", "[33,364][360,386]"),
      el("Password", "[16,411][377,429]"),
      el("Password", "[33,450][360,472]"),
      el("Forgot password?", "[16,497][377,541]"),
      el("Sign in with Apple", "[16,265][377,313]"),
      el("Sign in", "[16,583][377,631]"),
    ];
    expect(resolveTarget("Email", els)?.label).toBe("Email address");
    expect(resolveTarget("Email", els)?.point).toBe("50%,44%");
    expect(resolveTarget("Password", els)?.point).toBe("50%,54%");
    expect(resolveTarget("Sign in", els)?.label).toBe("Sign in");
    const withBar = [...els, el("Passwords", "[30,517][363,561]")];
    expect(resolveTarget("Password", withBar)?.point).toBe("50%,54%");
  });

  it("uses the phone window when the page is taller than the screen", () => {
    const hit = resolveTarget("Find a challenge", [
      el("GRIIT", "[0,0][393,852]"),
      el("scroll", "[0,0][393,1213]"),
      el("Find a challenge", "[16,421][377,461]"),
    ]);
    expect(hit?.point).toBe("50%,52%");
    expect(usablePoint("50%,400%")).toBeNull();
    expect(usablePoint("50%,52%")).toBe("50%,52%");
  });

  it("chooses Don't Allow for a stress tester", () => {
    expect(systemAlert(["Allow", "Don't Allow"], true)).toBe("Don't Allow");
    expect(systemAlert(["Allow", "Don't Allow"], false)).toBe("Allow");
  });
});

describe("13 Day 2 Home: the task button, not yesterday's post", () => {
  const el = (bounds: string, a11y: string): El => ({ text: "", a11y, id: "", value: "", bounds });
  it("an exact label wins over a bigger element that only starts with the target", () => {
    const els = [
      el("[0,0][440,956]", ""),
      el("[34,335][426,385]", "Walk 7,000 steps"),
      el("[17,517][443,577]", "Walk 7,000 steps, Next, 7K Steps · Day 2 of 7 · Self-reported"),
      el("[17,680][443,900]", "Walk 7,000 steps. Self-reported. 7K Steps · Day 1 of 7"),
    ];
    expect(resolveTarget("Walk 7,000 steps", els)?.point).toBe("52%,38%");
  });
});
