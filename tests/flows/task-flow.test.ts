/**
 * Invariant tests for the task-completion flow.
 */

import { describe, it, expect } from "vitest";
import { TRPC } from "@/lib/trpc-paths";
import { FLAGS } from "@/lib/feature-flags";

describe("TRPC.checkins — completion v2 paths", () => {
  it("exposes complete, startSession, and secureDay", () => {
    expect(TRPC.checkins.complete).toBe("checkins.complete");
    expect(TRPC.checkins.startSession).toBe("checkins.startSession");
    expect(TRPC.checkins.secureDay).toBe("checkins.secureDay");
  });

  it("does not expose a verifyTask key", () => {
    expect((TRPC.checkins as Record<string, unknown>).verifyTask).toBeUndefined();
  });

  it("FLAGS.REAL_VERIFICATION exists and is false", () => {
    expect(FLAGS.REAL_VERIFICATION).toBe(false);
  });

  it("COMPLETION_REWARDS is gone", () => {
    expect("COMPLETION_REWARDS" in FLAGS).toBe(false);
  });
});
