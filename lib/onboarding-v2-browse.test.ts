import { describe, expect, it } from "vitest";
import {
  applyBrowseBack,
  applyBrowsePick,
  browseAllExitPolicy,
  catalogueForBrowseAll,
  mergePickedIntoSuggestions,
} from "@/lib/onboarding-v2-browse";
import { suggestChallengesForGoals } from "@/lib/onboarding-v2-suggest";

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

describe("browse-all stays in flow", () => {
  it("does not complete onboarding, mint a session, or leave /onboarding", () => {
    expect(browseAllExitPolicy()).toEqual({
      completeOnboarding: false,
      mintSession: false,
      leaveOnboarding: false,
    });
  });

  it("catalogue is the starter-pack query without the take-3", () => {
    const suggestions = suggestChallengesForGoals(["physical_toughness"], CATALOG, 3);
    const all = catalogueForBrowseAll(["physical_toughness"], CATALOG);
    expect(suggestions).toHaveLength(3);
    expect(all.length).toBeGreaterThan(3);
    expect(all).toHaveLength(CATALOG.length);
    expect(all.slice(0, 3).map((c) => c.id)).toEqual(suggestions.map((c) => c.id));
  });

  it("selecting a catalogue challenge returns that id to the challenge step", () => {
    const suggestions = suggestChallengesForGoals(["physical_toughness"], CATALOG, 3);
    const all = catalogueForBrowseAll(["physical_toughness"], CATALOG);
    const outsideTake3 = all.find((c) => !suggestions.some((s) => s.id === c.id));
    expect(outsideTake3).toBeTruthy();

    const returned = applyBrowsePick(outsideTake3!.id);
    expect(returned.phase).toBe("closed");
    expect(returned.selectedChallengeId).toBe(outsideTake3!.id);

    const cards = mergePickedIntoSuggestions(suggestions, CATALOG, returned.selectedChallengeId);
    expect(cards[0]?.id).toBe(outsideTake3!.id);
    expect(cards).toHaveLength(suggestions.length + 1);
  });

  it("back from the picker leaves the challenge step selection unchanged", () => {
    expect(applyBrowseBack("already-picked-id")).toEqual({
      phase: "closed",
      selectedChallengeId: "already-picked-id",
    });
    expect(applyBrowseBack(null)).toEqual({
      phase: "closed",
      selectedChallengeId: null,
    });
  });
});
