import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterSecuredNext, momentSurfaceFromPathname, shouldPresentAwayRecap } from "@/lib/moment-queue";

describe("moment queue", () => {
  it("away recap is Home only — never on Finish, Secured, or a task flow", () => {
    expect(momentSurfaceFromPathname("/(tabs)")).toBe("home");
    expect(shouldPresentAwayRecap("/(tabs)")).toBe(true);
    expect(shouldPresentAwayRecap("/(tabs)/index")).toBe(true);
    expect(shouldPresentAwayRecap("/task/complete")).toBe(false);
    expect(shouldPresentAwayRecap("/task/secured")).toBe(false);
    expect(shouldPresentAwayRecap("/challenge/complete")).toBe(false);
    expect(shouldPresentAwayRecap("/challenge/end")).toBe(false);
    expect(shouldPresentAwayRecap("/onboarding")).toBe(false);
  });

  it("explains the 5:20 am Drink Water Today + Secured stack", () => {
    expect(afterSecuredNext({ challengeDone: true, challengeDay: 1, challengeLength: 1 })).toBe(
      "challenge_complete",
    );
    expect(shouldPresentAwayRecap("/task/secured")).toBe(false);
    const end = readFileSync(resolve(__dirname, "./challenge-end.ts"), "utf8");
    const gate = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    const secured = readFileSync(resolve(__dirname, "../app/task/secured.tsx"), "utf8");
    expect(end).toContain("shouldPresentAwayRecap");
    expect(gate).toContain("pathname");
    expect(secured).toContain("afterSecuredNext");
    expect(secured).toContain("CHALLENGE_COMPLETE");
  });

  it("task → Finish → Secured → (final day) complete → Home", () => {
    expect(afterSecuredNext({ challengeDay: 7, challengeLength: 30 })).toBe("home");
    expect(afterSecuredNext({ challengeDay: 30, challengeLength: 30 })).toBe("challenge_complete");
    expect(afterSecuredNext({ challengeDone: true, challengeDay: 3, challengeLength: 30 })).toBe(
      "challenge_complete",
    );
  });
});
