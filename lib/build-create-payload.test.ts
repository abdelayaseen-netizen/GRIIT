import { describe, it, expect } from "vitest";
import { buildCreatePayload } from "./build-create-payload";
import { CHALLENGE_PACKS, type ChallengePackDef } from "./challenge-packs";
import { challengeCreateInputSchema } from "../backend/trpc/routes/challenges-create";

const SNAKE_CASE_TASK_FIELDS = [
  "require_photo_proof",
  "strict_timer_mode",
  "duration_minutes",
  "min_words",
  "order_index",
];

function getMorningPack(): ChallengePackDef {
  const morning = CHALLENGE_PACKS.find((p) => p.id === "morning");
  if (!morning) throw new Error("morning pack not found");
  return morning;
}

function get75HardPack(): ChallengePackDef {
  const seventyFive = CHALLENGE_PACKS.find((p) => p.id === "75hard");
  if (!seventyFive) throw new Error("75hard pack not found");
  return seventyFive;
}

describe("buildCreatePayload", () => {
  it("output passes the actual challengeCreateInputSchema for a standard pack", () => {
    const payload = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "optional",
      category: "lifestyle",
    });
    const parsed = challengeCreateInputSchema.safeParse(payload);
    if (!parsed.success) {
      console.error("Zod validation issues:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("output passes the actual challengeCreateInputSchema for 75 Hard / hard mode / required photo", () => {
    const payload = buildCreatePayload({
      pack: get75HardPack(),
      durationDays: 75,
      difficulty: "hard",
      who: "solo",
      photoProof: "required",
      category: "fitness",
    });
    const parsed = challengeCreateInputSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("uses lowercase 'allow_replay' for replayPolicy", () => {
    const payload = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "optional",
      category: "lifestyle",
    });
    expect(payload.replayPolicy).toBe("allow_replay");
  });

  it("never emits snake_case task field keys", () => {
    for (const pack of CHALLENGE_PACKS) {
      const payload = buildCreatePayload({
        pack,
        durationDays: 30,
        difficulty: "hard",
        who: "group",
        photoProof: "required",
        category: "lifestyle",
      });
      const serialized = JSON.stringify(payload.tasks);
      for (const bad of SNAKE_CASE_TASK_FIELDS) {
        expect(serialized).not.toContain(bad);
      }
    }
  });

  it("hard mode forces strictTimerMode on timer tasks and requireSameRules at challenge level", () => {
    const payload = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "hard",
      who: "solo",
      photoProof: "off",
      category: "lifestyle",
    });
    expect(payload.requireSameRules).toBe(true);
    const timerTask = payload.tasks.find((t) => t.type === "timer");
    expect(timerTask?.strictTimerMode).toBe(true);
  });

  it("group → team with teamSize 10; solo → solo with teamSize 1; visibility always FRIENDS", () => {
    const group = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "group",
      photoProof: "off",
      category: "lifestyle",
    });
    const solo = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "off",
      category: "lifestyle",
    });
    expect(group.participationType).toBe("team");
    expect(group.teamSize).toBe(10);
    expect(group.visibility).toBe("FRIENDS");
    expect(solo.participationType).toBe("solo");
    expect(solo.teamSize).toBe(1);
    expect(solo.visibility).toBe("FRIENDS");
  });

  it("photoProof === 'off' disables photo on tasks that aren't inherently photo-typed", () => {
    const payload = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "off",
      category: "lifestyle",
    });
    const timer = payload.tasks.find((t) => t.type === "timer");
    expect(timer?.requirePhotoProof).toBe(false);
  });

  it("title falls back to pack name when titleOverride is empty/whitespace", () => {
    const empty = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "off",
      category: "lifestyle",
      titleOverride: "   ",
    });
    expect(empty.title).toBe(getMorningPack().name);
    const custom = buildCreatePayload({
      pack: getMorningPack(),
      durationDays: 30,
      difficulty: "standard",
      who: "solo",
      photoProof: "off",
      category: "lifestyle",
      titleOverride: "My custom challenge",
    });
    expect(custom.title).toBe("My custom challenge");
  });
});
