import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  badgesEarnedLine,
  comebackDate,
  evaluateV42Badges,
  longestSecuredRun,
  V42_BADGES,
  V42_BADGE_COUNT,
} from "@/lib/v42-badges";

describe("v42 badges", () => {
  it("is twelve and never targets streak_100", () => {
    expect(V42_BADGES).toHaveLength(12);
    expect(V42_BADGE_COUNT).toBe(12);
    expect(V42_BADGES.some((b) => b.id.startsWith("streak_") && b.target === 100)).toBe(false);
    expect(V42_BADGES.map((b) => b.id)).toContain("secured_100");
    expect(V42_BADGES.map((b) => b.id)).toContain("camera_30");
  });

  it("counts a held gap without adding it, and finds a comeback", () => {
    const run = longestSecuredRun(
      ["2026-09-01", "2026-09-02", "2026-09-04"],
      ["2026-09-03"],
    );
    expect(run.length).toBe(3);
    expect(run.firstHit[3]).toBe("2026-09-04");
    expect(comebackDate(["2026-09-17"], ["2026-09-16", "2026-09-17"], [])).toBe("2026-09-17");
    expect(comebackDate(["2026-09-17"], ["2026-09-16", "2026-09-17"], ["2026-09-16"])).toBeNull();
  });

  it("awards only from the listed facts", () => {
    const rows = evaluateV42Badges({
      securedKeys: ["2026-09-01", "2026-09-02", "2026-09-03"],
      dueKeys: ["2026-09-01", "2026-09-02", "2026-09-03"],
      holdKeys: [],
      completedEndedKeys: ["2026-09-20"],
      timeGateSecuredKeys: ["2026-09-01"],
      cameraProofKeys: ["2026-09-01", "2026-09-02"],
    });
    expect(rows.find((r) => r.id === "streak_3")?.earned).toBe(true);
    expect(rows.find((r) => r.id === "streak_7")?.earned).toBe(false);
    expect(rows.find((r) => r.id === "finish_1")?.earned).toBe(true);
    expect(rows.find((r) => r.id === "finish_3")?.progress).toBe("1 of 3");
    expect(rows.find((r) => r.id === "comeback")?.progress).toBe("Not yet");
    expect(rows.find((r) => r.id === "camera_30")?.progress).toBe("2 of 30");
    expect(rows.find((r) => r.id === "full_house")?.earned).toBe(false);
    expect(badgesEarnedLine(rows)).toBe("2 of 12 earned");
    const ach = readFileSync(resolve(__dirname, "../backend/lib/achievements.ts"), "utf8");
    expect(ach).not.toContain("ACHIEVEMENTS.STREAK_100");
    const rec = readFileSync(resolve(__dirname, "../backend/trpc/routes/profiles-record.ts"), "utf8");
    expect(rec).toContain("evaluateV42Badges");
    expect(rec).toContain("proof_photo_url");
  });
});
