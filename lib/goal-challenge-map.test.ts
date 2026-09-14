import { describe, expect, it } from "vitest";
import { filterChallengesByGoals, inferChallengeGoalTags } from "@/lib/goal-challenge-map";
import type { OnboardingGoal } from "@/store/onboardingStore";

const BREATHE = {
  id: "breathe",
  title: "Breathe 1 Min",
  category: "Mind",
  description: "One minute of breathing.",
};
const SUNSET = {
  id: "sunset",
  title: "7-Day Digital Sunset",
  category: "mind",
  description: "Screens down at sunset.",
};
const RUN = {
  id: "run",
  title: "5K Training",
  category: "Fitness",
  description: "From zero to 5K. Run or walk.",
};
const READ = {
  id: "read",
  title: "Read 30 Pages",
  category: "Mind",
  description: "Read pages from a book.",
};
const JOURNAL = {
  id: "journal",
  title: "Journal Today",
  category: "Mind",
  description: "Write a journal entry.",
};
const COLD = {
  id: "cold",
  title: "Cold Shower Challenge",
  category: "Discipline",
  description: "Cold shower every morning.",
};
const WATER = {
  id: "water",
  title: "Drink Water Today",
  category: "Fitness",
  description: "Drink water daily.",
};
const BED = {
  id: "bed",
  title: "Consistent Bedtime",
  category: "Discipline",
  description: "Hit your bedtime window.",
};
const FAJR = {
  id: "fajr",
  title: "Fajr on Time",
  category: "Faith",
  description: "Pray fajr at the mosque.",
};
const COURSE = {
  id: "course",
  title: "Finish the Course",
  category: "other",
  description: "Learn one lesson from the course.",
};

const FIXTURES = [BREATHE, SUNSET, RUN, READ, JOURNAL, COLD, WATER, BED, FAJR, COURSE];

function idsFor(goal: OnboardingGoal): string[] {
  return filterChallengesByGoals([goal], FIXTURES).map((r) => r.id);
}

describe("filterChallengesByGoals", () => {
  it("physical_toughness ranks fitness work and skips Breathe 1 Min", () => {
    const ids = idsFor("physical_toughness");
    expect(ids).toContain("run");
    expect(ids).not.toContain("breathe");
    expect(ids).not.toContain("read");
  });

  it("mental_discipline matches Mind including Breathe 1 Min", () => {
    expect(inferChallengeGoalTags(BREATHE)).toContain("mental_discipline");
    expect(inferChallengeGoalTags(JOURNAL)).toContain("mental_discipline");
    expect(idsFor("mental_discipline")).toContain("breathe");
  });

  it("daily_habits matches water and bedtime, not Breathe 1 Min", () => {
    const ids = idsFor("daily_habits");
    expect(ids.some((id) => id === "water" || id === "bed")).toBe(true);
    expect(ids).not.toContain("breathe");
  });

  it("reading_learning is keywords only — not the Mind category", () => {
    const ids = idsFor("reading_learning");
    expect(ids).toContain("read");
    expect(ids).toContain("course");
    expect(ids).not.toContain("breathe");
    expect(ids).not.toContain("journal");
  });

  it("cold_exposure matches cold shower and skips Breathe 1 Min", () => {
    const ids = idsFor("cold_exposure");
    expect(ids).toContain("cold");
    expect(ids).not.toContain("breathe");
  });

  it("sleep_recovery matches Digital Sunset and skips Breathe 1 Min", () => {
    const ids = idsFor("sleep_recovery");
    expect(ids).toContain("sunset");
    expect(ids).toContain("bed");
    expect(ids).not.toContain("breathe");
  });

  it("faith_prayer matches faith work and skips Breathe 1 Min", () => {
    const ids = idsFor("faith_prayer");
    expect(ids).toEqual(["fajr"]);
    expect(ids).not.toContain("breathe");
  });

  it("never pads with score 0", () => {
    expect(filterChallengesByGoals(["faith_prayer"], [BREATHE, RUN, READ])).toEqual([]);
    expect(filterChallengesByGoals(["reading_learning"], [BREATHE, SUNSET])).toEqual([]);
  });
});
