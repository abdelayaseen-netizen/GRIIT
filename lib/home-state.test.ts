import { describe, it, expect } from "vitest";
import { computeHomeState } from "./home-state";

describe("computeHomeState", () => {
  it("returns new_user when streak === 0 regardless of other inputs", () => {
    expect(
      computeHomeState({ streak: 0, tasksRemaining: 2, minutesToMidnight: 30 }),
    ).toBe("new_user");
    expect(
      computeHomeState({ streak: 0, tasksRemaining: 0, minutesToMidnight: 600 }),
    ).toBe("new_user");
  });

  it("returns streak_healthy when streak >= 1 and tasksRemaining === 0", () => {
    expect(
      computeHomeState({ streak: 1, tasksRemaining: 0, minutesToMidnight: 30 }),
    ).toBe("streak_healthy");
    expect(
      computeHomeState({ streak: 23, tasksRemaining: 0, minutesToMidnight: 720 }),
    ).toBe("streak_healthy");
  });

  it("returns streak_at_risk when streak >= 1 and tasksRemaining > 0 and < 60min", () => {
    expect(
      computeHomeState({ streak: 14, tasksRemaining: 1, minutesToMidnight: 59 }),
    ).toBe("streak_at_risk");
    expect(
      computeHomeState({ streak: 14, tasksRemaining: 2, minutesToMidnight: 0 }),
    ).toBe("streak_at_risk");
  });

  it("returns day_in_progress when streak >= 1 and tasksRemaining > 0 and >= 60min", () => {
    expect(
      computeHomeState({ streak: 1, tasksRemaining: 2, minutesToMidnight: 60 }),
    ).toBe("day_in_progress");
    expect(
      computeHomeState({ streak: 5, tasksRemaining: 1, minutesToMidnight: 800 }),
    ).toBe("day_in_progress");
  });
});
