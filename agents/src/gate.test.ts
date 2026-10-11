import { describe, expect, it } from "vitest";
import { parseDecision, reviewAction } from "./gate";
import { inferCheck } from "./goals";
import { classifyScreen } from "./screen";
import type { Decision } from "./types";

const tap = (target: string): Decision => ({ action: "tap", target, thought: "", emotion: "neutral" });

describe("agent action gate", () => {
  it("parses a fenced model reply", () => {
    const decision = parseDecision('```json\n{"action":"tap","target":"Start","thought":"Begin","emotion":"neutral"}\n```');
    expect(decision?.target).toBe("Start");
  });

  it("blocks Apple, purchases, skipped accounts, and likes on real people", () => {
    expect(reviewAction({ decision: tap("Sign in with Apple"), screenText: "", allowedNames: [], group: "gym" }).ok).toBe(false);
    expect(reviewAction({ decision: tap("Subscribe"), screenText: "Premium", allowedNames: [], group: "premium" }).ok).toBe(false);
    expect(reviewAction({ decision: tap("Skip — I'll risk losing my progress"), screenText: "Save your streak.", allowedNames: [], group: "teen" }).ok).toBe(false);
    expect(reviewAction({ decision: tap("Follow"), screenText: "Maya Chen", allowedNames: ["Seed GRIIT"], group: "wellness" }).ok).toBe(false);
    expect(reviewAction({ decision: tap("Respect"), screenText: "Seed GRIIT Day 2", allowedNames: ["Seed GRIIT"], group: "wellness" }).ok).toBe(true);
  });

  it("classifies goals and the home screen", () => {
    expect(inferCheck("Join a gym, workout, or discipline challenge.")).toBe("joined");
    expect(inferCheck("Find your streak on Home.")).toBe("observed");
    expect(inferCheck("Finish creating your account with the email and password you were given.")).toBe("account");
    expect(classifyScreen(["Today"])).toBe("home");
    expect(classifyScreen(["Good evening, Smoke", "0 days in a row", "Discover", "No challenge yet. Join one and Day 1 is today."])).toBe("home");
    expect(classifyScreen(["Continue", "Day 1 is today. Enough to find out."])).toBe("onboarding");
    expect(classifyScreen(["Continue with email", "Your challenges are where you left them."])).toBe("auth");
  });
});
