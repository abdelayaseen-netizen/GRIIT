import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { hasCameraProof as clientHasCameraProof } from "../../lib/active-challenge-ui";
import {
  cameraProofTiles,
  checkInHasCameraProof,
  hasCameraProof,
  proofCountsForDateKeys,
  proofPhotoUrlFromCheckIn,
  proofsAfterSign,
  splitSecuredProof,
  tileImageSource,
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
        shared: true,
      },
    ]);
  });

  it("abandoned enrollment with proofs today → secured screen caption shows the real title, not \"Challenge\"", () => {
    const tiles = cameraProofTiles({
      checkIns: [
        {
          date_key: "2026-09-23",
          task_id: "t-iron",
          active_challenge_id: "ac-left",
          proof_url: "https://cdn/iron.jpg",
        },
      ],
      dateKey: "2026-09-23",
      enrollments: [{ id: "ac-left", challengeId: "ch-iron", startDateKey: "2026-09-16" }],
      challenges: [{ id: "ch-iron", title: "Iron man", duration_days: 14 }],
      tasks: [{ id: "t-iron", challenge_id: "ch-iron", require_photo: true, task_type: "photo" }],
    });
    expect(tiles[0]?.challengeName).toBe("Iron man");
    const names = [...new Set(tiles.map((p) => p.challengeName))].join(", ");
    expect(names).toBe("Iron man");
    expect(names).not.toBe("Challenge");
    const src = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    expect(src).toContain('.in("status", ["active", "completed", "abandoned"])');
    const screen = readFileSync(resolve(__dirname, "../../components/task-v2/SecuredDayScreen.tsx"), "utf8");
    expect(screen).toContain("proofs.map((p) => p.challengeName)");
  });

  it("checkins.complete writes proof_url, not proof_photo_url or verified", () => {
    // backend/trpc/routes/checkins.ts:772-774
    const written = { proof_url: "https://cdn/p.jpg", proof_photo_url: null as string | null, verified: undefined };
    expect(hasCameraProof(written)).toBe(false);
    expect(checkInHasCameraProof({ date_key: "2026-09-17", ...written })).toBe(true);
  });

  it("keeps a proof on a day that is not secured, including today", () => {
    const tiles = cameraProofTiles({
      checkIns: [
        {
          date_key: "2026-10-04",
          task_id: "t1",
          active_challenge_id: "ac-a",
          photo_url: "https://cdn/today.jpg",
        },
      ],
      securedDateKeys: [],
      enrollments: [{ id: "ac-a", challengeId: "ch-a", startDateKey: "2026-09-10" }],
      challenges: [{ id: "ch-a", title: "Iron man", duration_days: 30 }],
      tasks: [{ id: "t1", challenge_id: "ch-a", title: "Pages", task_type: "counter" }],
    });
    expect(tiles.map((t) => t.dateKey)).toEqual(["2026-10-04"]);
    expect(tiles[0]?.imageUrl).toBe("https://cdn/today.jpg");
  });

  it("keeps a bare task-proofs path so it can be signed before the https check", () => {
    const path = "11111111-1111-4111-8111-111111111111/proof.jpg";
    expect(tileImageSource({ proof_url: path })).toBe(path);
    const tiles = cameraProofTiles({
      checkIns: [
        {
          date_key: "2026-09-20",
          task_id: "t1",
          active_challenge_id: "ac-a",
          proof_url: path,
        },
      ],
      enrollments: [{ id: "ac-a", challengeId: "ch-a", startDateKey: "2026-09-10" }],
      challenges: [{ id: "ch-a", title: "Iron man" }],
      tasks: [{ id: "t1", challenge_id: "ch-a", title: "Pages" }],
    });
    expect(tiles[0]?.imageUrl).toBe(path);
    const signed = proofsAfterSign(tiles, ["https://signed.example/proof.jpg"]);
    expect(signed[0]?.imageUrl).toBe("https://signed.example/proof.jpg");
    expect(proofsAfterSign(tiles, [null])).toEqual([]);
  });

  it("getTodayCheckins selects photo_url with the other proof columns", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    const start = src.indexOf("getTodayCheckins:");
    const body = src.slice(start, src.indexOf("getTodayCheckinsForUser:"));
    expect(body).toContain("photo_url");
    expect(body).toContain("proof_url");
    expect(body).toContain("completion_image_url");
  });
});
