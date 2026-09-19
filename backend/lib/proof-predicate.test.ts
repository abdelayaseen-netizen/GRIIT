import { describe, expect, it } from "vitest";
import { hasCameraProof as clientHasCameraProof } from "../../lib/active-challenge-ui";
import {
  cameraProofTiles,
  checkInHasCameraProof,
  hasCameraProof,
  proofCountsForDateKeys,
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

describe("proofCountsForDateKeys", () => {
  it("uses the same day set as the fraction: camera + self-reported = verified", () => {
    const part = proofCountsForDateKeys({
      dateKeys: ["2026-09-16", "2026-09-17", "2026-09-18"],
      securedDateKeys: ["2026-09-16", "2026-09-18", "2026-09-19"],
      checkIns: [
        { date_key: "2026-09-16", proof_url: "https://cdn/a.jpg" },
        { date_key: "2026-09-18" },
        { date_key: "2026-09-19", proof_url: "https://cdn/today.jpg" },
      ],
    });
    expect(part).toEqual({ camera: 1, selfReported: 1 });
    expect(part.camera + part.selfReported).toBe(2);
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

  it("one photo completion: Home, feed, and record all agree via hasCameraProof", () => {
    const photo = "https://cdn/proof.jpg";
    const home = clientHasCameraProof({ proof_photo_url: photo });
    const feed = hasCameraProof({ proof_photo_url: photo });
    const record = hasCameraProof({
      proof_photo_url: proofPhotoUrlFromCheckIn({ proof_url: photo }),
    });
    expect(home).toBe(true);
    expect(feed).toBe(true);
    expect(record).toBe(true);
    expect(home).toBe(feed);
    expect(feed).toBe(record);
  });

  it("cameraProofTiles skip self-reported days and carry challenge, date, gates", () => {
    const tiles = cameraProofTiles({
      checkIns: [
        {
          date_key: "2026-09-18",
          task_id: "t1",
          active_challenge_id: "ac-a",
          proof_url: "https://cdn/a.jpg",
        },
        { date_key: "2026-09-17", task_id: "t2", active_challenge_id: "ac-a" },
      ],
      securedDateKeys: ["2026-09-17", "2026-09-18"],
      enrollments: [{ id: "ac-a", challengeId: "ch-a", startDateKey: "2026-09-10" }],
      challenges: [{ id: "ch-a", title: "Iron man", duration_days: 75 }],
      tasks: [{ id: "t1", challenge_id: "ch-a", require_photo: true, task_type: "photo" }],
      events: [{ id: "ev-1", metadata: { task_id: "t1", date_key: "2026-09-18" } }],
    });
    expect(tiles).toEqual([
      {
        dateKey: "2026-09-18",
        day: 9,
        imageUrl: "https://cdn/a.jpg",
        challengeName: "Iron man",
        gates: ["camera"],
        eventId: "ev-1",
        durationDays: 75,
        capturedAt: null,
        taskName: "Task",
        gateTime: { mode: null, start: null, end: null },
      },
    ]);
  });

  it("checkins.complete writes proof_url, not proof_photo_url or verified", () => {
    // backend/trpc/routes/checkins.ts:772-774
    const written = { proof_url: "https://cdn/p.jpg", proof_photo_url: null as string | null, verified: undefined };
    expect(hasCameraProof(written)).toBe(false);
    expect(checkInHasCameraProof({ date_key: "2026-09-17", ...written })).toBe(true);
  });
});
