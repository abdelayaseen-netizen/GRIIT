import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DONE_FOR_TODAY,
  challengeDetailTodayCopy,
  challengeEnrollmentDone,
  challengeStickerProof,
  challengeStickerProofFromTasks,
} from "@/lib/challenge-today-copy";

describe("challenge today copy (frame 145)", () => {
  it("does not offer a sticker when this challenge has nothing done", () => {
    expect(challengeEnrollmentDone([{ completed_today: false }, { completed_today: false }])).toBe(false);
    expect(challengeStickerProof({ done: false, requirePhoto: true, gates: ["camera"] })).toBeNull();
    expect(
      challengeStickerProofFromTasks([
        { completed_today: false, require_photo: true, gates: ["camera"] },
      ]),
    ).toBeNull();
  });

  it("uses the gate that was used, not Self-reported for a camera task", () => {
    expect(
      challengeStickerProof({ done: true, hasCameraProof: true, requirePhoto: true, gates: ["camera"] }),
    ).toBe("camera");
    expect(
      challengeStickerProof({ done: true, requirePhoto: true, gates: ["camera"] }),
    ).toBe("self");
    expect(
      challengeStickerProofFromTasks([
        { completed_today: true, require_photo: true, gates: ["camera"], hasCameraProof: true },
      ]),
    ).toBe("camera");
    expect(challengeStickerProof({ done: true, gates: [] })).toBe("self");
  });

  it("says Done for today and names the other open challenge", () => {
    expect(
      challengeDetailTodayCopy({
        thisDone: true,
        daySecured: false,
        others: [{ name: "Read 30 Pages", left: 1 }],
      }),
    ).toEqual({
      status: DONE_FOR_TODAY,
      sub: "Your day is secured when Read 30 Pages is done too. 1 task left there.",
      showShareToday: false,
    });
    expect(
      challengeDetailTodayCopy({
        thisDone: true,
        daySecured: true,
        others: [],
      }).showShareToday,
    ).toBe(true);
    expect(challengeDetailTodayCopy({ thisDone: false, daySecured: true, others: [] }).status).toBeNull();
  });

  it("challenge detail never says Today is secured.", () => {
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ActiveChallengeV3.tsx"),
      "utf8",
    );
    const screen = readFileSync(
      resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(detail).toContain("DONE_FOR_TODAY");
    expect(detail).not.toContain("TODAY_IS_SECURED");
    expect(detail).not.toContain("Today is secured.");
    expect(detail).not.toContain("Day secured.");
    expect(screen).toContain("challengeEnrollmentDone");
    expect(screen).toContain("challengeStickerProofFromTasks");
  });
});
