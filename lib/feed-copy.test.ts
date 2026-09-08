import { describe, expect, it } from "vitest";
import { feedNoPhotoCopy } from "@/lib/feed-copy";

const base = {
  displayName: "Maya",
  username: "maya",
  challengeName: "75 Hard Classic",
  taskName: "Outdoor workout",
  currentDay: 12,
};

describe("feedNoPhotoCopy", () => {
  it("secured_day says secured day N from raw current_day", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "secured_day", currentDay: 2 })).toBe(
      "Maya secured day 1",
    );
    expect(feedNoPhotoCopy({ ...base, eventType: "secured_day", currentDay: 13 })).toBe(
      "Maya secured day 12",
    );
  });

  it("joined_challenge says started challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "joined_challenge" })).toBe(
      "Maya started 75 Hard Classic",
    );
  });

  it("challenge_created says started challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "challenge_created" })).toBe(
      "Maya started 75 Hard Classic",
    );
  });

  it("task_completed says completed taskTitle", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "task_completed" })).toBe(
      "Maya completed Outdoor workout",
    );
  });

  it("completed_challenge says finished challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "completed_challenge" })).toBe(
      "Maya finished 75 Hard Classic",
    );
  });
});
