import { describe, expect, it } from "vitest";
import {
  FREE_ACTIVE_CHALLENGES_LIMIT,
  FREE_ACTIVE_LIMIT_MESSAGE,
  countActiveEnrollments,
  isFreeActiveLimitReached,
} from "./free-challenge-limit";

describe("isFreeActiveLimitReached", () => {
  it("blocks a user with 3 active", () => {
    expect(
      isFreeActiveLimitReached([
        { status: "active" },
        { status: "active" },
        { status: "active" },
      ]),
    ).toBe(true);
  });

  it("allows a user with 2 active and 5 completed", () => {
    expect(
      isFreeActiveLimitReached([
        { status: "active" },
        { status: "active" },
        { status: "completed" },
        { status: "completed" },
        { status: "completed" },
        { status: "completed" },
        { status: "completed" },
      ]),
    ).toBe(false);
  });

  it("does not count abandoned enrollments", () => {
    expect(
      isFreeActiveLimitReached([
        { status: "active" },
        { status: "active" },
        { status: "abandoned" },
      ]),
    ).toBe(false);
  });

  it("2 active + 1 abandoned + 1 completed → count is 2, join allowed", () => {
    const rows = [
      { status: "active" },
      { status: "active" },
      { status: "abandoned" },
      { status: "completed" },
    ];
    expect(countActiveEnrollments(rows)).toBe(2);
    expect(isFreeActiveLimitReached(rows)).toBe(false);
  });
});

describe("FREE_ACTIVE_LIMIT_MESSAGE", () => {
  it("is the paywall / server copy", () => {
    expect(FREE_ACTIVE_CHALLENGES_LIMIT).toBe(3);
    expect(FREE_ACTIVE_LIMIT_MESSAGE).toBe(
      "Free accounts can be in 3 challenges at a time. Finish or leave one, or upgrade to GRIIT Pro.",
    );
  });
});
