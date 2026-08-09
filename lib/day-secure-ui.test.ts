import { describe, it, expect } from "vitest";
import {
  buildIncompleteRequired,
  formatIncompleteProgress,
  isNotAllRequiredError,
  NOT_ALL_REQUIRED_MESSAGE,
} from "./day-secure-ui";

describe("isNotAllRequiredError", () => {
  it("matches the server BAD_REQUEST message", () => {
    expect(isNotAllRequiredError(new Error(NOT_ALL_REQUIRED_MESSAGE))).toBe(true);
  });

  it("matches raw NOT_ALL_REQUIRED token", () => {
    expect(isNotAllRequiredError(new Error("NOT_ALL_REQUIRED"))).toBe(true);
  });

  it("rejects transport copy", () => {
    expect(
      isNotAllRequiredError(
        new Error("Could not secure your day right now. Please try again in a moment.")
      )
    ).toBe(false);
  });
});

describe("formatIncompleteProgress", () => {
  it("formats done of total", () => {
    expect(formatIncompleteProgress(2, 3)).toBe("2 of 3 done");
  });
});

describe("buildIncompleteRequired", () => {
  it("lists remaining titles and counts", () => {
    const required = [
      { id: "a", title: "Water" },
      { id: "b", title: "Run" },
      { id: "c", title: "Journal" },
    ];
    const completed = new Set(["a"]);
    expect(buildIncompleteRequired({ requiredTasks: required, completedTaskIds: completed })).toEqual({
      kind: "incomplete_required",
      done: 1,
      total: 3,
      remainingTitles: ["Run", "Journal"],
    });
  });
});
