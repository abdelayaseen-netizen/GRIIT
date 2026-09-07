import { describe, expect, it } from "vitest";
import { moderateChallengeQuality } from "./content-moderation";

const TITLE = "Morning run club";

describe("moderateChallengeQuality", () => {
  it("allows missing, null, and empty description (title checks still apply)", () => {
    for (const description of [undefined, null, ""] as const) {
      expect(
        moderateChallengeQuality({ title: TITLE, description, taskCount: 1 }),
      ).toEqual({ allowed: true });
    }
  });

  it("rejects whitespace-only description as empty", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "   ",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.category).toBe("low_quality");
    expect(result.reason).toMatch(/needs a description/i);
  });

  it("rejects a non-empty description shorter than MIN_DESCRIPTION_LENGTH", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "Too short",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.category).toBe("low_quality");
    expect(result.reason).toMatch(/at least 20 characters/i);
  });

  it("allows a description that meets MIN_DESCRIPTION_LENGTH", () => {
    expect(
      moderateChallengeQuality({
        title: TITLE,
        description: "A daily habit challenge with enough detail.",
        taskCount: 1,
      }),
    ).toEqual({ allowed: true });
  });

  it("still rejects a short title when description is omitted", () => {
    const result = moderateChallengeQuality({
      title: "Hi",
      description: "",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/title is too short/i);
  });

  it("still rejects a too-long title when description is omitted", () => {
    const result = moderateChallengeQuality({
      title: "T".repeat(81),
      description: undefined,
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/title is too long/i);
  });

  it("still requires at least one task", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "",
      taskCount: 0,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/at least one daily task/i);
  });
});
