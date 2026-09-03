import { describe, expect, it } from "vitest";
import { mergeGoalsIntoAnswers, parseGoalsFromAnswers } from "@/lib/onboarding-v2-goals-core";

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

  it("keeps all six known ids including sleep_recovery (no cap of 3)", () => {
    expect(
      parseGoalsFromAnswers({
        goals: [
          "physical_toughness",
          "mental_discipline",
          "daily_habits",
          "reading_learning",
          "cold_exposure",
          "sleep_recovery",
        ],
      })
    ).toEqual([
      "physical_toughness",
      "mental_discipline",
      "daily_habits",
      "reading_learning",
      "cold_exposure",
      "sleep_recovery",
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
