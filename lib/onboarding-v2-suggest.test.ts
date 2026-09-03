import { describe, expect, it } from "vitest";
import {
  isJoinableChallengeId,
  matchReasonForChallenge,
  suggestChallengesForGoals,
} from "@/lib/onboarding-v2-suggest";

const CATALOG = [
  {
    id: "a1000001-4000-4000-8000-000000000005",
    title: "5K Training",
    category: "Fitness",
    description: "From zero to 5K. Run or walk.",
  },
  {
    id: "a1000001-4000-4000-8000-000000000004",
    title: "Read 30 Pages",
    category: "Mind",
    description: "Feed your mind daily. Read pages.",
  },
  {
    id: "a1000001-4000-4000-8000-000000000007",
    title: "Cold Shower Challenge",
    category: "Discipline",
    description: "Embrace the cold. Cold shower.",
  },
  {
    id: "b2000001-4000-4000-8000-000000000001",
    title: "Drink Water Today",
    category: "Fitness",
    description: "Drink water and post a photo.",
  },
  {
    id: "b2000001-4000-4000-8000-000000000004",
    title: "Journal Today",
    category: "Mind",
    description: "Write a short journal entry.",
  },
  {
    id: "b2000001-4000-4000-8000-000000000006",
    title: "Consistent Bedtime",
    category: "Discipline",
    description: "Hit your bedtime window.",
  },
];

describe("isJoinableChallengeId", () => {
  it("accepts UUIDs and rejects fallback placeholders", () => {
    expect(isJoinableChallengeId("a1000001-4000-4000-8000-000000000005")).toBe(true);
    expect(isJoinableChallengeId("fallback-cold-7")).toBe(false);
    expect(isJoinableChallengeId("")).toBe(false);
  });
});

describe("suggestChallengesForGoals", () => {
  it("returns different ids for physical vs reading goal sets", () => {
    const physical = suggestChallengesForGoals(["physical_toughness"], CATALOG).map((c) => c.id);
    const reading = suggestChallengesForGoals(["reading_learning"], CATALOG).map((c) => c.id);
    expect(physical).toHaveLength(3);
    expect(reading).toHaveLength(3);
    expect(physical).not.toEqual(reading);
    expect(physical[0]).toBe("a1000001-4000-4000-8000-000000000005");
    expect(reading[0]).toBe("a1000001-4000-4000-8000-000000000004");
  });

  it("returns no fake joinable ids on an empty catalog", () => {
    expect(suggestChallengesForGoals(["physical_toughness"], [])).toEqual([]);
    expect(
      suggestChallengesForGoals(
        ["cold_exposure"],
        [{ id: "fallback-cold-7", title: "7-Day Cold Shower", category: "Discipline" }]
      )
    ).toEqual([]);
  });

  it("re-ranks when goals change and writes a match-reason line", () => {
    const physical = suggestChallengesForGoals(["physical_toughness"], CATALOG);
    const sleep = suggestChallengesForGoals(["sleep_recovery"], CATALOG);
    expect(matchReasonForChallenge(physical[0]!, ["physical_toughness"])).toBe(
      "Matches physical toughness"
    );
    expect(sleep[0]?.id).toBe("b2000001-4000-4000-8000-000000000006");
    expect(matchReasonForChallenge(sleep[0]!, ["sleep_recovery"])).toBe(
      "Matches sleep & recovery"
    );
    expect(matchReasonForChallenge(CATALOG[1]!, ["physical_toughness"])).toBe(
      "Popular first challenge"
    );
  });
});
