import { describe, expect, it } from "vitest";
import { profileConsistencyFromBootstrap } from "./profile-consistency";

const WEEK = [
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-19",
  "2026-09-20",
];

describe("profileConsistencyFromBootstrap", () => {
  it("active challenge + one secured key → 1 of N, not No due days", () => {
    expect(
      profileConsistencyFromBootstrap({
        activeChallenges: [{ id: "ac-1" }],
        securedDateKeys: ["2026-09-15"],
        weekDateKeys: WEEK,
      }),
    ).toBe("1 of 7");
  });

  it("is No due days only when there are no active challenges", () => {
    expect(
      profileConsistencyFromBootstrap({
        activeChallenges: [],
        securedDateKeys: ["2026-09-15"],
        weekDateKeys: WEEK,
      }),
    ).toBe("No due days");
  });
});
