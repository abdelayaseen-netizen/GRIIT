import { describe, it, expect } from "vitest";
import { dbTaskType, journalMinWords, taskStrictAndPhoto } from "./challenges";
import { challengeCreateInputSchema } from "./challenges-create";

describe("challenges.create input schema (P0 bug regression)", () => {
  it("rejects the exact uppercase 'ALLOW_REPLAY' replayPolicy the old wizard sent", () => {
    const oldWizardBuggyPayload = {
      title: "30 Day Reset",
      description: "",
      type: "standard" as const,
      durationDays: 30,
      difficulty: "standard" as const,
      status: "published" as const,
      categories: ["fitness"],
      participationType: "solo" as const,
      teamSize: 1,
      visibility: "PUBLIC" as const,
      replayPolicy: "ALLOW_REPLAY",
      showReplayLabel: false,
      requireSameRules: false,
      liveDate: "",
      tasks: [
        {
          title: "Workout",
          type: "simple",
          required: true,
          require_photo_proof: true,
          strict_timer_mode: false,
          duration_minutes: null,
          min_words: null,
          order_index: 0,
        },
      ],
    };
    const result = challengeCreateInputSchema.safeParse(oldWizardBuggyPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const replayPolicyIssue = result.error.issues.find((iss) =>
        iss.path.includes("replayPolicy")
      );
      expect(replayPolicyIssue).toBeDefined();
    }
  });

  it("accepts lowercase replayPolicy + camelCase task fields and preserves requirePhotoProof", () => {
    const correctPayload = {
      title: "30 Day Reset",
      description: "",
      type: "standard" as const,
      durationDays: 30,
      difficulty: "standard" as const,
      status: "published" as const,
      categories: ["fitness"],
      participationType: "solo" as const,
      teamSize: 1,
      visibility: "PUBLIC" as const,
      replayPolicy: "allow_replay" as const,
      showReplayLabel: false,
      requireSameRules: false,
      liveDate: "",
      tasks: [
        {
          title: "Workout",
          type: "timer",
          required: true,
          requirePhotoProof: true,
          strictTimerMode: true,
          durationMinutes: 45,
          minWords: undefined,
        },
      ],
    };
    const result = challengeCreateInputSchema.safeParse(correctPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.replayPolicy).toBe("allow_replay");
      expect(result.data.tasks[0]?.requirePhotoProof).toBe(true);
      expect(result.data.tasks[0]?.strictTimerMode).toBe(true);
      expect(result.data.tasks[0]?.durationMinutes).toBe(45);
    }
  });

  it("does NOT preserve snake_case fields (Zod strips unknown keys, which is exactly the bug)", () => {
    const partialBuggyPayload = {
      title: "X",
      type: "standard" as const,
      durationDays: 30,
      replayPolicy: "allow_replay" as const,
      tasks: [
        {
          title: "Workout",
          type: "simple",
          required: true,
          require_photo_proof: true,
          strict_timer_mode: true,
          duration_minutes: 30,
          min_words: 50,
          order_index: 0,
        },
      ],
    };
    const result = challengeCreateInputSchema.safeParse(partialBuggyPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tasks[0]?.requirePhotoProof).toBeUndefined();
      expect(result.data.tasks[0]?.strictTimerMode).toBeUndefined();
      expect(result.data.tasks[0]?.durationMinutes).toBeUndefined();
      expect(result.data.tasks[0]?.minWords).toBeUndefined();
    }
  });
});

describe("challenges.create helpers (regression)", () => {
  describe("dbTaskType", () => {
    it("maps simple to manual for DB enum", () => {
      expect(dbTaskType("simple")).toBe("manual");
    });
    it("maps photo to manual for backward compat", () => {
      expect(dbTaskType("photo")).toBe("manual");
    });
    it("passes through other types", () => {
      expect(dbTaskType("journal")).toBe("journal");
      expect(dbTaskType("timer")).toBe("timer");
      expect(dbTaskType("run")).toBe("run");
      expect(dbTaskType("checkin")).toBe("checkin");
    });
  });

  describe("journalMinWords", () => {
    it("defaults to 20 when undefined or null", () => {
      expect(journalMinWords(undefined)).toBe(20);
      expect(journalMinWords(null)).toBe(20);
    });
    it("returns value when provided", () => {
      expect(journalMinWords(50)).toBe(50);
      expect(journalMinWords(1)).toBe(1);
    });
  });

  describe("taskStrictAndPhoto", () => {
    it("stores strict_timer_mode true only for timer with strictTimerMode", () => {
      expect(taskStrictAndPhoto({ type: "timer", strictTimerMode: true }).strict_timer_mode).toBe(true);
      expect(taskStrictAndPhoto({ type: "timer", strictTimerMode: false }).strict_timer_mode).toBe(false);
      expect(taskStrictAndPhoto({ type: "timer" }).strict_timer_mode).toBe(false);
      expect(taskStrictAndPhoto({ type: "journal" }).strict_timer_mode).toBe(false);
    });
    it("stores require_photo_proof for any type with requirePhotoProof or legacy photo type", () => {
      expect(taskStrictAndPhoto({ type: "journal", requirePhotoProof: true }).require_photo_proof).toBe(true);
      expect(taskStrictAndPhoto({ type: "photo" }).require_photo_proof).toBe(true);
      expect(taskStrictAndPhoto({ type: "simple", requirePhotoProof: false }).require_photo_proof).toBe(false);
      expect(taskStrictAndPhoto({ type: "simple" }).require_photo_proof).toBe(false);
    });
  });
});
