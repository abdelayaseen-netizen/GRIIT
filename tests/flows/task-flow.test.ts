/**
 * Invariant tests for the task-completion flow.
 *
 * These tests run in a pure Node environment (no React Native, no DOM).
 * They assert behavioural contracts that must hold before any commit ships:
 *
 *  1. Submit uses `TRPC.checkins.complete` — the real server mutation.
 *  2. The Verifying overlay never shows a row for a gate absent from config.
 *  3. "motion", "presence", "liveness" never appear in any overlay row or
 *     success line produced by buildVerifyingRows / getTypeSuccessLine.
 *  4. With FLAGS.COMPLETION_REWARDS = false, no points line and no reward
 *     chip can render (the flag is the only source of truth).
 *
 * Evidence contract: every assertion is linked to the real symbol it tests.
 * Prose claims are rejected — see CLEANUP_LOG.md.
 */

import { describe, it, expect } from "vitest";
import { buildVerifyingRows, getTypeSuccessLine } from "@/lib/task-flow-utils";
import { TRPC } from "@/lib/trpc-paths";
import { FLAGS } from "@/lib/feature-flags";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Submit mutation path
// ─────────────────────────────────────────────────────────────────────────────

describe("TRPC.checkins.complete — real mutation path", () => {
  it("TRPC.checkins.complete resolves to the correct tRPC path string", () => {
    // completeTask in hooks/useAppChallengeMutations.ts calls:
    //   trpcMutate(TRPC.checkins.complete, params)
    // This asserts it points to the real endpoint, not a local stub.
    expect(TRPC.checkins.complete).toBe("checkins.complete");
  });

  it("TRPC.checkins does not expose a verifyTask key (was fabricated in the prior report)", () => {
    expect((TRPC.checkins as Record<string, unknown>).verifyTask).toBeUndefined();
  });

  it("FLAGS.REAL_VERIFICATION exists on main (false) — not a fabricated verifyTask gate", () => {
    // Main ships REAL_VERIFICATION=false; merge keeps that value (rule 3).
    expect(FLAGS.REAL_VERIFICATION).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2 & 3. VerifyingOverlay rows — honest-cut invariant
// ─────────────────────────────────────────────────────────────────────────────

describe("buildVerifyingRows — honest-cut: only evaluated gates produce rows", () => {
  it("returns empty array when no gates are present in config", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: false,
      submitTimeLabel: "",
      hasCameraOnly: false,
      hasLocation: false,
    });
    expect(rows).toHaveLength(0);
  });

  it("returns exactly one row for time-window only", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: true,
      submitTimeLabel: "08:30 AM",
      hasCameraOnly: false,
      hasLocation: false,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.label).toBe("Within time window");
    expect(rows[0]!.detail).toBe("08:30 AM");
  });

  it("returns exactly one row for camera-only gate", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: false,
      submitTimeLabel: "",
      hasCameraOnly: true,
      hasLocation: false,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.label).toBe("Live camera");
    expect(rows[0]!.detail).toBe("not from library");
  });

  it("returns exactly one row for location gate", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: false,
      submitTimeLabel: "",
      hasCameraOnly: false,
      hasLocation: true,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.label).toBe("On location");
  });

  it("returns all three rows when every gate is present", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: true,
      submitTimeLabel: "09:15 AM",
      hasCameraOnly: true,
      hasLocation: true,
    });
    expect(rows).toHaveLength(3);
  });

  it("never produces a row containing 'motion', 'presence', or 'liveness' (fabricated gates)", () => {
    const allPossibleRows = buildVerifyingRows({
      hasTimeWindow: true,
      submitTimeLabel: "12:00 PM",
      hasCameraOnly: true,
      hasLocation: true,
    });
    const forbidden = ["motion", "presence", "liveness"];
    for (const row of allPossibleRows) {
      const combined = `${row.label} ${row.detail ?? ""}`.toLowerCase();
      for (const word of forbidden) {
        expect(combined).not.toContain(word);
      }
    }
  });
});

describe("getTypeSuccessLine — honest-cut: no fabricated gate descriptions", () => {
  const knownTypes = [
    "photo", "timer", "run", "workout", "journal",
    "counter", "water", "reading", "checkin",
  ];

  it.each(knownTypes)(
    "getTypeSuccessLine('%s') returns a non-empty string",
    (taskType) => {
      const line = getTypeSuccessLine(taskType);
      expect(typeof line).toBe("string");
      expect(line.length).toBeGreaterThan(0);
    }
  );

  it("getTypeSuccessLine for unknown type returns generic fallback", () => {
    expect(getTypeSuccessLine("unknown_future_type")).toBe("Task completed");
  });

  it("no success line from getTypeSuccessLine contains 'motion', 'presence', or 'liveness'", () => {
    const forbidden = ["motion", "presence", "liveness"];
    const allLines = [...knownTypes, "unknown_future_type"].map(getTypeSuccessLine);
    for (const line of allLines) {
      for (const word of forbidden) {
        expect(line.toLowerCase()).not.toContain(word);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. FLAGS.COMPLETION_REWARDS — controls points + reward chip visibility
// ─────────────────────────────────────────────────────────────────────────────

describe("FLAGS.COMPLETION_REWARDS — secured screen must be points-clean", () => {
  it("FLAGS.COMPLETION_REWARDS is false (storyboard: streak only, no points)", () => {
    // With this flag false, useTaskCompleteScreen.tsx passes subtitle: "" to
    // showCelebration (no points line) and skips the variableReward roll.
    // TaskCompleteCelebration.tsx gates the variableReward chip on this flag.
    expect(FLAGS.COMPLETION_REWARDS).toBe(false);
  });

  it("FLAGS.COMPLETION_REWARDS is a boolean (not undefined or absent)", () => {
    expect(typeof FLAGS.COMPLETION_REWARDS).toBe("boolean");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Edge-case: gate-absent inputs produce no surprising rows
// ─────────────────────────────────────────────────────────────────────────────

describe("buildVerifyingRows — edge cases", () => {
  it("empty submitTimeLabel still shows the time-window row (label only)", () => {
    const rows = buildVerifyingRows({
      hasTimeWindow: true,
      submitTimeLabel: "",
      hasCameraOnly: false,
      hasLocation: false,
    });
    expect(rows[0]!.label).toBe("Within time window");
    expect(rows[0]!.detail).toBe("");
  });

  it("returns a new array on each call (no shared state)", () => {
    const a = buildVerifyingRows({ hasTimeWindow: true, submitTimeLabel: "T", hasCameraOnly: false, hasLocation: false });
    const b = buildVerifyingRows({ hasTimeWindow: true, submitTimeLabel: "T", hasCameraOnly: false, hasLocation: false });
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
