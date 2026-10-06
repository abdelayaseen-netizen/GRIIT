import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("leave schedules local midnight and the daily reset writes ended_at", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/challenges-join.ts"), "utf8");
    const reset = readFileSync(resolve(__dirname, "../lib/daily-reset.ts"), "utf8");
    expect(src).toContain("leave_effective_at: endsAt");
    expect(src).toContain("nextLocalMidnightIso");
    expect(reset).toContain("ended_at: at");
    expect(reset).toContain("end_seen_at: at");
    expect(src).toContain('.eq("id", input.activeChallengeId)');
    expect(src).not.toMatch(/from\("active_challenges"\)\s*\.delete\(/);
  });
});

describe("leave navigation", () => {
  it("goes Home and invalidates bootstrap + listMyActive for the tapped enrollment", () => {
    const screen = readFileSync(
      resolve(__dirname, "../../app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(screen).toContain("activeChallengeId: id");
    expect(screen).toContain('queryKey: ["home", "bootstrap"]');
    expect(screen).toContain('queryKey: ["challenge", "listMyActive"]');
    expect(screen).toContain("ROUTES.TABS_HOME");
    expect(screen).toContain("router.replace(ROUTES.TABS_HOME");
  });
});
