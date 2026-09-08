import { describe, expect, it } from "vitest";
import {
  CREATOR_LEAVE_BLOCKED_MESSAGE,
  SOLO_LEAVE_ACTIVE_STATUS,
  decideLeaveChallenge,
} from "./leave-challenge";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

describe("decideLeaveChallenge", () => {
  it("lets a solo creator end (not reject)", () => {
    expect(
      decideLeaveChallenge({
        userId: USER,
        creatorId: USER,
        participationType: "solo",
      }),
    ).toEqual({ action: "end_solo" });
  });

  it("treats a missing participation_type as solo", () => {
    expect(
      decideLeaveChallenge({
        userId: USER,
        creatorId: USER,
        participationType: null,
      }),
    ).toEqual({ action: "end_solo" });
  });

  it("blocks the creator on team, duo, and shared_goal", () => {
    for (const participationType of ["team", "duo", "shared_goal"] as const) {
      expect(
        decideLeaveChallenge({
          userId: USER,
          creatorId: USER,
          participationType,
        }),
      ).toEqual({ action: "reject_creator" });
    }
    expect(CREATOR_LEAVE_BLOCKED_MESSAGE).toBe("You cannot leave a challenge you created.");
  });

  it("lets a non-creator leave any participation type", () => {
    expect(
      decideLeaveChallenge({
        userId: USER,
        creatorId: OTHER,
        participationType: "solo",
      }),
    ).toEqual({ action: "leave_participant" });
    expect(
      decideLeaveChallenge({
        userId: USER,
        creatorId: OTHER,
        participationType: "team",
      }),
    ).toEqual({ action: "leave_participant" });
  });
});

describe("SOLO_LEAVE_ACTIVE_STATUS", () => {
  it("abandons the enrollment instead of deleting it", () => {
    expect(SOLO_LEAVE_ACTIVE_STATUS).toBe("abandoned");
  });
});
