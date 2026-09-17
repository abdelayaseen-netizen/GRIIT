import { describe, expect, it } from "vitest";
import { hasCameraProof as clientHasCameraProof } from "../../lib/active-challenge-ui";
import {
  checkInHasCameraProof,
  hasCameraProof,
  proofPhotoUrlFromCheckIn,
  splitSecuredProof,
} from "./proof-predicate";

describe("hasCameraProof", () => {
  it("mirrors lib/active-challenge-ui hasCameraProof (verified || proof_photo_url)", () => {
    const cases: { verified?: boolean; proof_photo_url?: string | null }[] = [
      {},
      { verified: true },
      { proof_photo_url: "https://cdn/proof.jpg" },
      { verified: false, proof_photo_url: null },
    ];
    for (const c of cases) {
      expect(hasCameraProof(c)).toBe(clientHasCameraProof(c));
    }
  });
});

describe("splitSecuredProof", () => {
  it("3 secured days, 2 with photos → 2/1; per-challenge split sums to the total", () => {
    const securedDateKeys = ["2026-09-01", "2026-09-02", "2026-09-03"];
    const checkIns = [
      {
        date_key: "2026-09-01",
        active_challenge_id: "ac-a",
        photo_url: "https://cdn/a.jpg",
      },
      {
        date_key: "2026-09-02",
        active_challenge_id: "ac-a",
        proof_url: "https://cdn/b.jpg",
      },
      {
        date_key: "2026-09-03",
        active_challenge_id: "ac-b",
      },
    ];
    const split = splitSecuredProof({
      securedDateKeys,
      checkIns,
      enrollmentIds: ["ac-a", "ac-b"],
    });
    expect(split.cameraDays).toBe(2);
    expect(split.selfReportedDays).toBe(1);
    expect(split.byEnrollment).toEqual([
      { id: "ac-a", camera: 2, selfReported: 0 },
      { id: "ac-b", camera: 0, selfReported: 1 },
    ]);
    expect(split.byEnrollment.reduce((n, r) => n + r.camera, 0)).toBe(split.cameraDays);
    expect(split.byEnrollment.reduce((n, r) => n + r.selfReported, 0)).toBe(
      split.selfReportedDays,
    );
  });

  it("counts a day as camera when verified is true without a URL", () => {
    expect(
      checkInHasCameraProof({
        date_key: "2026-09-01",
        verified: true,
      }),
    ).toBe(true);
    expect(proofPhotoUrlFromCheckIn({ photo_url: "  https://cdn/x.jpg  " })).toBe(
      "https://cdn/x.jpg",
    );
  });
});
