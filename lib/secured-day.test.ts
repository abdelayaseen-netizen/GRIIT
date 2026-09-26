import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { HomeProofTask } from "@/lib/home-proof-card";
import {
  SECURED_LOAD_ERROR,
  SECURED_LOAD_RETRY,
  SECURED_SELF,
  SECURED_TODAY,
  proofsFromComplete,
  securedChallengeLine,
  securedDayCaption,
  securedOverflowLabel,
  selectSecuredDayMeta,
} from "@/lib/secured-day";

function task(partial: Partial<HomeProofTask> & Pick<HomeProofTask, "name" | "challengeName">): HomeProofTask {
  return {
    currentDay: 3,
    durationDays: 14,
    done: true,
    challengeSecuredToday: true,
    ...partial,
  };
}

describe("secured day copy", () => {
  it("uses the frame 59 table — no bare Day n", () => {
    expect(SECURED_TODAY).toBe("Today is secured.");
    expect(SECURED_SELF).toBe("Self-reported");
    expect(SECURED_LOAD_ERROR).toBe("Couldn't load. Try again.");
    expect(SECURED_LOAD_RETRY).toBe("Retry");
    expect(securedChallengeLine("Iron man", 2, 14)).toBe("Iron man · Day 2 of 14");
    expect(
      securedDayCaption({ taskCount: 4, challengeCount: 2, cameraProofs: 3 }),
    ).toBe("4 tasks across 2 challenges. 3 camera proofs.");
    expect(
      securedDayCaption({ taskCount: 2, challengeCount: 1, cameraProofs: 1 }),
    ).toBe("2 tasks. 1 camera proofs.");
    expect(
      securedDayCaption({
        taskCount: 3,
        challengeCount: 2,
        cameraProofs: 0,
        allSelfReported: true,
      }),
    ).toBe("3 tasks across 2 challenges, all self-reported. Nothing was checked.");
    expect(
      securedDayCaption({
        taskCount: 2,
        challengeCount: 1,
        cameraProofs: 0,
        allSelfReported: true,
      }),
    ).toBe("2 tasks, all self-reported. Nothing was checked.");
    expect(
      securedDayCaption({ taskCount: 3, challengeCount: 2, cameraProofs: 0 }),
    ).toBe("3 tasks across 2 challenges. 0 camera proofs.");
  });

  it("three tiles and +n", () => {
    expect(securedOverflowLabel(1)).toBeNull();
    expect(securedOverflowLabel(3)).toBeNull();
    expect(securedOverflowLabel(4)).toBe("+2");
    expect(securedOverflowLabel(5)).toBe("+3");
  });
});

describe("secured day data", () => {
  it("all self-reported is every completed task's proof type, not zero photo tiles", () => {
    const cameraDone = task({
      name: "Run",
      challengeName: "Iron man",
      requirePhoto: true,
      gates: ["camera"],
    });
    const selfDone = task({
      name: "Write",
      challengeName: "Daily Gratitude",
      requirePhoto: false,
      gates: [],
    });
    const mixed = selectSecuredDayMeta({ tasks: [cameraDone, selfDone], proofs: [] });
    expect(mixed.taskCount).toBe(2);
    expect(mixed.allSelfReported).toBe(false);
    const onlySelf = selectSecuredDayMeta({ tasks: [selfDone], proofs: [] });
    expect(onlySelf.allSelfReported).toBe(true);
    expect(securedDayCaption({
      taskCount: onlySelf.taskCount,
      challengeCount: onlySelf.challengeCount,
      cameraProofs: 0,
      allSelfReported: onlySelf.allSelfReported,
    })).toContain("all self-reported");
  });

  it("lists self-reported challenges and never invents a photo", () => {
    const proofs = proofsFromComplete({
      dayProofs: [{ imageUrl: "https://cdn/a.jpg", challengeName: "Iron man", day: 2, durationDays: 14, eventId: "e1" }],
      challengeName: "Iron man",
      challengeDay: 2,
      challengeLength: 14,
    });
    expect(proofs).toEqual([
      { uri: "https://cdn/a.jpg", challengeName: "Iron man", day: 2, length: 14, eventId: "e1" },
    ]);
    const meta = selectSecuredDayMeta({
      tasks: [
        task({ name: "Run", challengeName: "Iron man", currentDay: 3, requirePhoto: true, gates: ["camera"] }),
        task({ name: "Write", challengeName: "Daily Gratitude", currentDay: 2, durationDays: 30 }),
      ],
      proofs,
    });
    expect(meta.taskCount).toBe(2);
    expect(meta.challengeCount).toBe(2);
    expect(meta.selfReported.map((r) => r.name)).toEqual(["Daily Gratitude"]);
  });
});

describe("secured screen wiring", () => {
  it("Secured uses the day list, shareProof, and no Verified on self-report", () => {
    const secured = readFileSync(resolve(__dirname, "../app/task/secured.tsx"), "utf8");
    const screen = readFileSync(
      resolve(__dirname, "../components/task-v2/SecuredDayScreen.tsx"),
      "utf8",
    );
    const moment = readFileSync(
      resolve(__dirname, "../components/task-v2/MomentScreenV3.tsx"),
      "utf8",
    );
    expect(secured).toContain("SecuredDayScreen");
    expect(secured).toContain("TRPC.checkins.shareProof");
    expect(secured).not.toContain("shareProgressImage");
    expect(secured).not.toContain("TaskConfirmation");
    expect(screen).toContain("SECURED_PHOTO_H");
    expect(screen).toContain("SECURED_TILE_MAX");
    expect(screen).not.toContain("formatSecuredStateLine");
    expect(moment).toContain('camera ? "Verified"');
    expect(moment).toContain("camera && hasPhoto");
  });

  it("fetch failure shows Couldn't load. Try again. and Retry, never a blank ready caption", () => {
    const secured = readFileSync(resolve(__dirname, "../app/task/secured.tsx"), "utf8");
    const screen = readFileSync(
      resolve(__dirname, "../components/task-v2/SecuredDayScreen.tsx"),
      "utf8",
    );
    expect(secured).toContain("error: true");
    expect(secured).toContain("ready: false");
    expect(secured).toContain("onRetryLoad");
    expect(screen).toContain("SECURED_LOAD_ERROR");
    expect(screen).toContain("SECURED_LOAD_RETRY");
    expect(screen).toContain('variant="error"');
  });
});
