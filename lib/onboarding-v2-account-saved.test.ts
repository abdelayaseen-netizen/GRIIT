import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { accountSavedLines } from "@/lib/onboarding-v2-account-saved";
import {
  accountInLine,
  WHY_PROOF_END,
  WHY_PROOF_FADE_MS,
  WHY_PROOF_HEADER_MS,
  WHY_PROOF_HOLD_MS,
  WHY_PROOF_RING_MS,
  WHY_PROOF_START,
  WHY_PROOF_SUB,
} from "@/lib/onboarding-v42-copy";

describe("accountSavedLines", () => {
  it("lists challenge Day 1 of N, line, and reminder", () => {
    expect(
      accountSavedLines({
        challengeTitle: "Read 30 Pages",
        durationDays: 30,
        targetStreak: 30,
        remindersEnabled: true,
        reminderPreset: "am6",
        reminderCustom: null,
      }),
    ).toEqual([
      "Read 30 Pages Day 1 of 30",
      "Your line 30 days",
      "Reminder 6:00 AM",
    ]);
    expect(accountInLine("Iron man")).toBe("You are in Iron man. Day 1 is today.");
  });

  it("omits empty rows", () => {
    expect(
      accountSavedLines({
        challengeTitle: null,
        targetStreak: null,
        remindersEnabled: false,
        reminderPreset: "am6",
        reminderCustom: null,
      }),
    ).toEqual([]);
  });
});

describe("WhyProof copy", () => {
  it("never says secured while a task is open", () => {
    expect(WHY_PROOF_START).toBe("2 of 3. The day is not secured.");
    expect(WHY_PROOF_START.toLowerCase()).not.toMatch(/day secured/);
    expect(WHY_PROOF_END).toBe("Day secured. 3 of 3 tasks.");
    expect(WHY_PROOF_SUB).toContain("The server decides, not you.");
    expect(WHY_PROOF_HOLD_MS).toBe(600);
    expect(WHY_PROOF_RING_MS).toBe(240);
    expect(WHY_PROOF_HEADER_MS).toBe(360);
    expect(WHY_PROOF_FADE_MS).toBe(200);
    const src = readFileSync(
      resolve(__dirname, "../components/onboarding/v2/screens/WhyProofScreen.tsx"),
      "utf8",
    );
    expect(src).toContain("isReduceMotionEnabled");
    expect(src).toContain("WHY_PROOF_HOLD_MS");
    expect(src).toContain("WHY_PROOF_RING_MS");
    expect(src).toContain("WHY_PROOF_HEADER_MS");
    expect(src).toContain("WHY_PROOF_FADE_MS");
    expect(src).toContain("WHY_PROOF_START");
    expect(src).toContain("WHY_PROOF_END");
  });
});
