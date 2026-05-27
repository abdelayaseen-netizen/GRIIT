import { describe, it, expect } from "vitest";
import { selectProposal } from "./create-proposal";
import { CHALLENGE_PACKS } from "./challenge-packs";

describe("selectProposal", () => {
  it("first-time user → easiest pack, standard difficulty, 30 days, first_challenge reason", () => {
    const out = selectProposal({
      daysSinceLastActivity: null,
      hasCompletedChallengeBefore: false,
      dayOfWeek: 2,
      hourOfDay: 14,
    });
    expect(out.reason.kind).toBe("first_challenge");
    expect(out.difficulty).toBe("standard");
    expect(out.durationDays).toBe(30);
    expect(["morning-routine", "morning"].includes(out.pack.id)).toBe(true);
  });

  it("user with daysSinceLastActivity >= 3 → mid pack, back_after_break reason, days propagated", () => {
    const out = selectProposal({
      daysSinceLastActivity: 5,
      hasCompletedChallengeBefore: true,
      dayOfWeek: 3,
      hourOfDay: 12,
    });
    expect(out.reason.kind).toBe("back_after_break");
    if (out.reason.kind === "back_after_break") {
      expect(out.reason.days_since_last_activity).toBe(5);
    }
    expect(out.difficulty).toBe("standard");
    expect(out.durationDays).toBe(30);
    expect(["athlete"].includes(out.pack.id)).toBe(true);
  });

  it("Sunday evening + has completed before → 75 Hard with hard difficulty, weekend_reset reason", () => {
    const out = selectProposal({
      daysSinceLastActivity: 1,
      hasCompletedChallengeBefore: true,
      dayOfWeek: 0,
      hourOfDay: 20,
    });
    expect(out.reason.kind).toBe("weekend_reset");
    expect(out.pack.id).toBe("75hard");
    expect(out.difficulty).toBe("hard");
    expect(out.durationDays).toBe(30);
  });

  it("Sunday evening but NEVER completed before → falls into first/default branch, NOT weekend_reset", () => {
    const out = selectProposal({
      daysSinceLastActivity: null,
      hasCompletedChallengeBefore: false,
      dayOfWeek: 0,
      hourOfDay: 21,
    });
    expect(out.reason.kind).toBe("first_challenge");
    expect(out.difficulty).toBe("standard");
  });

  it("Sunday afternoon (hour < 18) does NOT trigger weekend_reset", () => {
    const out = selectProposal({
      daysSinceLastActivity: 1,
      hasCompletedChallengeBefore: true,
      dayOfWeek: 0,
      hourOfDay: 14,
    });
    expect(out.reason.kind).not.toBe("weekend_reset");
  });

  it("active user (last activity 0–2 days, has done one before) → default branch, first pack", () => {
    const out = selectProposal({
      daysSinceLastActivity: 1,
      hasCompletedChallengeBefore: true,
      dayOfWeek: 3,
      hourOfDay: 9,
    });
    expect(out.reason.kind).toBe("default");
    const firstPack = CHALLENGE_PACKS[0];
    expect(firstPack).toBeDefined();
    expect(out.pack.id).toBe(firstPack?.id);
    expect(out.difficulty).toBe("standard");
  });

  it("returns a real ChallengePackDef from CHALLENGE_PACKS in every branch", () => {
    const inputs: Parameters<typeof selectProposal>[0][] = [
      { daysSinceLastActivity: null, hasCompletedChallengeBefore: false, dayOfWeek: 1, hourOfDay: 10 },
      { daysSinceLastActivity: 5, hasCompletedChallengeBefore: true, dayOfWeek: 1, hourOfDay: 10 },
      { daysSinceLastActivity: 1, hasCompletedChallengeBefore: true, dayOfWeek: 0, hourOfDay: 20 },
      { daysSinceLastActivity: 0, hasCompletedChallengeBefore: true, dayOfWeek: 3, hourOfDay: 12 },
    ];
    for (const input of inputs) {
      const out = selectProposal(input);
      expect(CHALLENGE_PACKS.some((p) => p.id === out.pack.id)).toBe(true);
    }
  });
});
