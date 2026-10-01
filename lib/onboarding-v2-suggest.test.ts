import { describe, expect, it } from "vitest";
import {
  challengeDetailLine,
  isJoinableChallengeId,
  isNoDaysOffChallenge,
  matchReasonForChallenge,
  meetsOnboardingDuration,
  preselectedSuggestionId,
  suggestChallengesForGoals,
} from "@/lib/onboarding-v2-suggest";

const CATALOG = [
  {
    id: "a1000001-4000-4000-8000-000000000005",
    title: "5K Training",
    category: "Fitness",
    description: "From zero to 5K. Run or walk.",
    duration_days: 30,
  },
  {
    id: "a1000001-4000-4000-8000-000000000004",
    title: "Read 30 Pages",
    category: "Mind",
    description: "Feed your mind daily. Read pages.",
    duration_days: 30,
  },
  {
    id: "a1000001-4000-4000-8000-000000000007",
    title: "Cold Shower Challenge",
    category: "Discipline",
    description: "Embrace the cold. Cold shower.",
    duration_days: 30,
  },
  {
    id: "b2000001-4000-4000-8000-000000000001",
    title: "Drink Water Today",
    category: "Fitness",
    description: "Drink water and post a photo.",
    duration_days: 1,
  },
  {
    id: "b2000001-4000-4000-8000-000000000004",
    title: "Journal Today",
    category: "Mind",
    description: "Write a short journal entry.",
    duration_days: 1,
  },
  {
    id: "b2000001-4000-4000-8000-000000000006",
    title: "Consistent Bedtime",
    category: "Discipline",
    description: "Hit your bedtime window.",
    duration_days: 1,
  },
  {
    id: "c3000001-4000-4000-8000-000000000001",
    title: "Breathe 1 Min",
    category: "Mind",
    description: "One minute of breathing.",
    duration_days: 1,
  },
  {
    id: "c3000001-4000-4000-8000-000000000002",
    title: "7-Day Digital Sunset",
    category: "mind",
    description: "Screens down at sunset.",
    duration_days: 7,
  },
  {
    id: "a1000001-4000-4000-8000-000000000001",
    title: "No Days Off",
    category: "fitness",
    description: "The ultimate mental toughness challenge.",
    duration_days: 75,
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
    expect(physical.length).toBeGreaterThan(0);
    expect(reading.length).toBeGreaterThan(0);
    expect(physical).not.toEqual(reading);
    expect(physical[0]).toBe("a1000001-4000-4000-8000-000000000005");
    expect(reading[0]).toBe("a1000001-4000-4000-8000-000000000004");
    expect(reading).not.toContain("c3000001-4000-4000-8000-000000000001");
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
    expect(sleep.map((c) => c.id)).toContain("c3000001-4000-4000-8000-000000000002");
    expect(matchReasonForChallenge(sleep[0]!, ["sleep_recovery"])).toBe(
      "Matches sleep and recovery"
    );
    expect(matchReasonForChallenge(CATALOG[1]!, ["physical_toughness"])).toBe(
      "Popular first challenge"
    );
  });

  it("never pads with a score-0 challenge", () => {
    const faithOnly = CATALOG.filter((c) => c.title !== "No Days Off");
    expect(suggestChallengesForGoals(["faith_prayer"], faithOnly)).toEqual([]);
  });

  it("Physical toughness + Daily habits at 30 days has no result shorter than 30", () => {
    const rows = suggestChallengesForGoals(["physical_toughness", "daily_habits"], CATALOG, 3, 30);
    expect(rows.every((c) => (c.duration_days ?? 0) >= 30)).toBe(true);
    expect(rows.some((c) => (c.duration_days ?? 0) < 30)).toBe(false);
  });

  it("never offers 1-day challenges and requires duration ≥ the line", () => {
    expect(meetsOnboardingDuration(1, 7)).toBe(false);
    expect(meetsOnboardingDuration(7, 7)).toBe(true);
    expect(meetsOnboardingDuration(6, 7)).toBe(false);
    const ids = suggestChallengesForGoals(["physical_toughness"], CATALOG, 3, 7).map((c) => c.id);
    expect(ids).not.toContain("b2000001-4000-4000-8000-000000000001");
    expect(ids.every((id) => CATALOG.find((c) => c.id === id)!.duration_days >= 7)).toBe(true);
  });

  it("sorts by closest duration to the line, then goals; Custom uses its number", () => {
    const seven = suggestChallengesForGoals(["sleep_recovery"], CATALOG, 3, 7);
    expect(seven[0]?.id).toBe("c3000001-4000-4000-8000-000000000002");
    const custom = suggestChallengesForGoals(["physical_toughness"], CATALOG, 3, 30);
    expect(custom[0]?.duration_days).toBe(30);
    expect(isNoDaysOffChallenge(custom[custom.length - 1]!)).toBe(true);
    const tooLong = suggestChallengesForGoals(["sleep_recovery"], CATALOG, 3, 14);
    expect(tooLong.map((c) => c.id)).not.toContain("c3000001-4000-4000-8000-000000000002");
  });

  it("pins No Days Off last and never pre-selects it", () => {
    const seven = suggestChallengesForGoals(["physical_toughness"], CATALOG, 3, 7);
    expect(isNoDaysOffChallenge(seven[seven.length - 1]!)).toBe(true);
    expect(isNoDaysOffChallenge(seven[0]!)).toBe(false);
    expect(preselectedSuggestionId(seven)).toBe(seven[0]!.id);
    expect(preselectedSuggestionId(seven)).not.toBe("a1000001-4000-4000-8000-000000000001");
    const onlyNdo = suggestChallengesForGoals(
      ["physical_toughness"],
      CATALOG.filter((c) => c.title === "No Days Off"),
      3,
      7,
    );
    expect(onlyNdo).toHaveLength(1);
    expect(preselectedSuggestionId(onlyNdo)).toBeNull();
  });

  it("returns fewer than 3 when the catalog is thin", () => {
    const thin = suggestChallengesForGoals(
      ["reading_learning"],
      CATALOG.filter((c) => c.title === "Read 30 Pages"),
      3,
      7,
    );
    expect(thin).toHaveLength(1);
  });
});

describe("challengeDetailLine", () => {
  it("uses Duolingo pluralization: 1 day / 1 task, else days / tasks", () => {
    expect(challengeDetailLine({ id: "x", duration_days: 1, tasks: [{}] })).toBe("1 day · 1 task · daily");
    expect(challengeDetailLine({ id: "x", duration_days: 23, tasks: [{}, {}] })).toBe(
      "23 days · 2 tasks · daily"
    );
  });
});
