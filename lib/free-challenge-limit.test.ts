import { describe, expect, it } from "vitest";
import {
  FREE_ACTIVE_CHALLENGES_LIMIT,
  FREE_ACTIVE_LIMIT_MESSAGE,
  isFreeActiveLimitReached,
} from "@/lib/free-challenge-limit";

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
});

describe("FREE_ACTIVE_LIMIT_MESSAGE", () => {
  it("is the paywall / server copy", () => {
    expect(FREE_ACTIVE_CHALLENGES_LIMIT).toBe(3);
    expect(FREE_ACTIVE_LIMIT_MESSAGE).toBe(
      "Free accounts can be in 3 challenges at a time. Finish or leave one, or upgrade to GRIIT Pro.",
    );
  });
});
