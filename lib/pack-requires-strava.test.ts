import { describe, it, expect } from "vitest";
import { packRequiresStrava } from "./pack-requires-strava";
import { CHALLENGE_PACKS, type ChallengePackDef } from "./challenge-packs";

describe("packRequiresStrava", () => {
  it("returns false for a pack with no Strava-tagged tasks", () => {
    const pack: ChallengePackDef = {
      id: "test-no-strava",
      name: "No Strava",
      emoji: "🧘",
      description: "Just journaling",
      taskCount: 1,
      tasks: [
        { name: "Write", type: "journal", config: { prompt: "today" }, photo: "none" },
      ],
    };
    expect(packRequiresStrava(pack)).toBe(false);
  });

  it("returns true when ANY task has verificationMethod === 'strava_activity'", () => {
    const pack: ChallengePackDef = {
      id: "test-strava-modern",
      name: "Strava Run",
      emoji: "🏃",
      description: "",
      taskCount: 2,
      tasks: [
        { name: "Stretch", type: "timer", config: { minutes: 5 }, photo: "none" },
        { name: "Run", type: "run", config: { verificationMethod: "strava_activity" }, photo: "none" },
      ],
    };
    expect(packRequiresStrava(pack)).toBe(true);
  });

  it("returns true when ANY task has require_strava === true (legacy flag)", () => {
    const pack: ChallengePackDef = {
      id: "test-strava-legacy",
      name: "Legacy Strava",
      emoji: "🏃",
      description: "",
      taskCount: 1,
      tasks: [
        { name: "Run", type: "run", config: { require_strava: true }, photo: "none" },
      ],
    };
    expect(packRequiresStrava(pack)).toBe(true);
  });

  it("returns false when require_strava is set to false", () => {
    const pack: ChallengePackDef = {
      id: "test-strava-off",
      name: "Strava Off",
      emoji: "🏃",
      description: "",
      taskCount: 1,
      tasks: [
        { name: "Run", type: "run", config: { require_strava: false }, photo: "none" },
      ],
    };
    expect(packRequiresStrava(pack)).toBe(false);
  });

  it("none of the shipped CHALLENGE_PACKS currently require Strava", () => {
    for (const pack of CHALLENGE_PACKS) {
      expect(packRequiresStrava(pack)).toBe(false);
    }
  });
});
