import { describe, expect, it } from "vitest";
import { filterChallengesByGoals } from "@/lib/goal-challenge-map";

const ROWS = [
  { id: "a", title: "5K Training", category: "Fitness", description: "Run or walk." },
  { id: "b", title: "Read 30 Pages", category: "Mind", description: "Read pages." },
  { id: "c", title: "Cold Shower", category: "Discipline", description: "Cold shower." },
  { id: "d", title: "Journal Today", category: "Mind", description: "Write a journal entry." },
];

describe("filterChallengesByGoals", () => {
  it("goals filter changes suggestions", () => {
    const physical = filterChallengesByGoals(["physical_toughness"], ROWS).map((r) => r.id);
    const reading = filterChallengesByGoals(["reading_learning"], ROWS).map((r) => r.id);
    expect(physical).toHaveLength(3);
    expect(reading).toHaveLength(3);
    expect(physical).not.toEqual(reading);
    expect(physical[0]).toBe("a");
    expect(reading[0]).toBe("b");
  });
});
