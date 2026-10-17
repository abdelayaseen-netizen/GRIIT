import { describe, expect, it } from "vitest";
import { mergeGoalsIntoAnswers, parseGoalsFromAnswers, toggleOnboardingGoal } from "@/lib/onboarding-v2-goals-core";

describe("parseGoalsFromAnswers", () => {
  it("reads a goals array and drops unknowns", () => {
    expect(
      parseGoalsFromAnswers({ goals: ["reading_learning", "nope", "cold_exposure", "reading_learning"] })
    ).toEqual(["reading_learning", "cold_exposure"]);
  });

  it("returns empty for missing or malformed answers", () => {
    expect(parseGoalsFromAnswers(null)).toEqual([]);
    expect(parseGoalsFromAnswers({})).toEqual([]);
    expect(parseGoalsFromAnswers({ goals: "physical_toughness" })).toEqual([]);
  });

  it("keeps all seven known ids including faith_prayer (no cap of 3)", () => {
    expect(
      parseGoalsFromAnswers({
        goals: [
          "physical_toughness",
          "mental_discipline",
          "daily_habits",
          "reading_learning",
          "cold_exposure",
          "sleep_recovery",
          "faith_prayer",
        ],
      })
    ).toEqual([
      "physical_toughness",
      "mental_discipline",
      "daily_habits",
      "reading_learning",
      "cold_exposure",
      "sleep_recovery",
      "faith_prayer",
    ]);
  });
});

describe("toggleOnboardingGoal", () => {
  it("keeps the only selected goal when it is tapped again", () => {
    expect(toggleOnboardingGoal(["faith_prayer"], "faith_prayer", 3)).toEqual(["faith_prayer"]);
  });

  it("adds until the cap and drops a goal when another is still selected", () => {
    expect(toggleOnboardingGoal(["faith_prayer"], "reading_learning", 3)).toEqual([
      "faith_prayer",
      "reading_learning",
    ]);
    expect(toggleOnboardingGoal(["faith_prayer", "reading_learning"], "faith_prayer", 3)).toEqual([
      "reading_learning",
    ]);
  });
});

describe("mergeGoalsIntoAnswers", () => {
  it("writes goals without dropping other keys", () => {
    expect(mergeGoalsIntoAnswers({ motivation: "x" }, ["daily_habits"])).toEqual({
      motivation: "x",
      goals: ["daily_habits"],
    });
  });
});
