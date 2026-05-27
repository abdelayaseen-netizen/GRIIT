/**
 * Proposal engine — picks one curated `ChallengePackDef` from `lib/challenge-packs.ts`
 * based on lightweight, deterministic activity hints.
 *
 * Inputs are user-derived (not server-side ML): activity recency, day of week, hour.
 * No randomness, no remote config — just a small rule table.
 */

import { CHALLENGE_PACKS, type ChallengePackDef } from "@/lib/challenge-packs";

export type ProposalReason =
  | { kind: "first_challenge" }
  | { kind: "back_after_break"; days_since_last_activity: number }
  | { kind: "weekend_reset" }
  | { kind: "default" };

export type ProposalInput = {
  /** Days since the user last secured a day. `null` = brand-new user (no secured days). */
  daysSinceLastActivity: number | null;
  hasCompletedChallengeBefore: boolean;
  /** 0=Sun..6=Sat, in user's local timezone. */
  dayOfWeek: number;
  /** 0–23, in user's local timezone. */
  hourOfDay: number;
};

export type ProposalOutput = {
  pack: ChallengePackDef;
  reason: ProposalReason;
  durationDays: number;
  difficulty: "standard" | "hard";
};

function findPack(
  packs: readonly ChallengePackDef[],
  predicate: (p: ChallengePackDef) => boolean
): ChallengePackDef | undefined {
  return packs.find(predicate);
}

function findEasiestPack(packs: readonly ChallengePackDef[]): ChallengePackDef {
  const morning = findPack(
    packs,
    (p) => p.id === "morning-routine" || p.id === "morning" || /morning routine/i.test(p.name)
  );
  if (morning) return morning;
  const sorted = [...packs].sort((a, b) => a.taskCount - b.taskCount);
  const first = sorted[0];
  const fallback = packs[0];
  if (first) return first;
  if (fallback) return fallback;
  throw new Error("CHALLENGE_PACKS is empty — proposal engine cannot pick a default.");
}

function findMidPack(packs: readonly ChallengePackDef[]): ChallengePackDef {
  const athlete = findPack(packs, (p) => p.id === "athlete" || /athlete/i.test(p.name));
  if (athlete) return athlete;
  const sorted = [...packs].sort((a, b) => a.taskCount - b.taskCount);
  const mid = sorted[Math.floor(sorted.length / 2)];
  if (mid) return mid;
  return findEasiestPack(packs);
}

function find75Hard(packs: readonly ChallengePackDef[]): ChallengePackDef | undefined {
  return findPack(
    packs,
    (p) => p.id === "75-hard-classic" || p.id === "75hard" || /75 hard/i.test(p.name)
  );
}

export function selectProposal(input: ProposalInput): ProposalOutput {
  const packs = CHALLENGE_PACKS;
  if (packs.length === 0) {
    throw new Error("CHALLENGE_PACKS is empty — proposal engine cannot run.");
  }

  const isSundayEvening = input.dayOfWeek === 0 && input.hourOfDay >= 18;

  if (isSundayEvening && input.hasCompletedChallengeBefore) {
    const seventyFiveHard = find75Hard(packs);
    if (seventyFiveHard) {
      return {
        pack: seventyFiveHard,
        reason: { kind: "weekend_reset" },
        durationDays: 30,
        difficulty: "hard",
      };
    }
    return {
      pack: findMidPack(packs),
      reason: { kind: "weekend_reset" },
      durationDays: 30,
      difficulty: "standard",
    };
  }

  const isFirstTime =
    input.daysSinceLastActivity === null && !input.hasCompletedChallengeBefore;
  if (isFirstTime) {
    return {
      pack: findEasiestPack(packs),
      reason: { kind: "first_challenge" },
      durationDays: 30,
      difficulty: "standard",
    };
  }

  if (
    typeof input.daysSinceLastActivity === "number" &&
    input.daysSinceLastActivity >= 3
  ) {
    return {
      pack: findMidPack(packs),
      reason: {
        kind: "back_after_break",
        days_since_last_activity: input.daysSinceLastActivity,
      },
      durationDays: 30,
      difficulty: "standard",
    };
  }

  const fallback = packs[0];
  if (!fallback) {
    throw new Error("CHALLENGE_PACKS is empty — proposal engine cannot fall back.");
  }
  return {
    pack: fallback,
    reason: { kind: "default" },
    durationDays: 30,
    difficulty: "standard",
  };
}
