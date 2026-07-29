/**
 * Invariant tests for the task-completion flow.
 *
 * Pure Node — no React Native. Asserts submit path + rewards flag contracts
 * that must hold after the legacy verifying overlay helpers were removed
 * (7 types use VerifyingProof / SecuredScreen; timer keeps TaskCompleteCelebration).
 */

import { describe, it, expect } from "vitest";
import { TRPC } from "@/lib/trpc-paths";
import { FLAGS } from "@/lib/feature-flags";

describe("TRPC.checkins.complete — real mutation path", () => {
  it("TRPC.checkins.complete resolves to the correct tRPC path string", () => {
    expect(TRPC.checkins.complete).toBe("checkins.complete");
  });

  it("TRPC.checkins does not expose a verifyTask key", () => {
    expect((TRPC.checkins as Record<string, unknown>).verifyTask).toBeUndefined();
  });

  it("FLAGS.REAL_VERIFICATION exists and is false", () => {
    expect(FLAGS.REAL_VERIFICATION).toBe(false);
  });
});

describe("FLAGS.COMPLETION_REWARDS — secured screen must be points-clean", () => {
  it("FLAGS.COMPLETION_REWARDS is false (storyboard: streak only, no points)", () => {
    expect(FLAGS.COMPLETION_REWARDS).toBe(false);
  });

  it("FLAGS.COMPLETION_REWARDS is a boolean", () => {
    expect(typeof FLAGS.COMPLETION_REWARDS).toBe("boolean");
  });
});
