import { describe, expect, it } from "vitest";
import {
  CREATE_CATEGORIES,
  displayCategory,
  isWizardCategory,
} from "@/lib/challenge-category";

describe("CREATE_CATEGORIES", () => {
  it("is Fitness · Faith · Mind · Health · Discipline · Learning", () => {
    expect(CREATE_CATEGORIES.map((c) => c.label)).toEqual([
      "Fitness",
      "Faith",
      "Mind",
      "Health",
      "Discipline",
      "Learning",
    ]);
  });
});

describe("displayCategory", () => {
  it("title-cases the six create slugs", () => {
    expect(displayCategory("fitness")).toBe("Fitness");
    expect(displayCategory("LEARNING")).toBe("Learning");
  });

  it("maps legacy Discover leftovers without dropping them", () => {
    expect(displayCategory("Body")).toBe("Body");
    expect(displayCategory("focus")).toBe("Focus");
    expect(displayCategory("other")).toBe("Other");
  });

  it("title-cases unknown stored values", () => {
    expect(displayCategory("morning_routine")).toBe("Morning Routine");
    expect(displayCategory("")).toBe("Other");
    expect(displayCategory(null)).toBe("Other");
  });
});

describe("isWizardCategory", () => {
  it("accepts only the six create ids", () => {
    expect(isWizardCategory("health")).toBe(true);
    expect(isWizardCategory("body")).toBe(false);
  });
});
