import { describe, expect, it } from "vitest";
import { feedNoPhotoCopy } from "@/lib/feed-copy";

const base = {
  displayName: "Maya",
  username: "maya",
  challengeName: "No Days Off",
  taskName: "Outdoor workout",
  currentDay: 12,
};

describe("feedNoPhotoCopy", () => {
  it("secured_day is not a feed line", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "secured_day" })).toBe("Maya");
  });

  it("joined_challenge says started challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "joined_challenge" })).toBe(
      "Maya started No Days Off",
    );
  });

  it("challenge_created says started challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "challenge_created" })).toBe(
      "Maya started No Days Off",
    );
  });

  it("task_completed says completed taskTitle", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "task_completed" })).toBe(
      "Maya completed Outdoor workout",
    );
  });

  it("completed_challenge says finished challengeName", () => {
    expect(feedNoPhotoCopy({ ...base, eventType: "completed_challenge" })).toBe(
      "Maya finished No Days Off",
    );
  });
});
