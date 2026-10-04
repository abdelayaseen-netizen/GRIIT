import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  USE_FREEZE_ACTION,
  canOfferYesterdayFreeze,
  freezeRecoveryCaption,
  freezeRecoveryRow,
  freezeRecoveryTitle,
  freezeWindowOpen,
} from "@/lib/freeze-recovery";

const MISS = "2026-10-02";
const TODAY = "2026-10-03";

describe("freeze recovery after dismiss", () => {
  it("dismissed card + freeze available → row actionable", () => {
    const row = freezeRecoveryRow({
      hardMode: false,
      freezesRemaining: 2,
      missDateKey: MISS,
      todayKey: TODAY,
      securedDateKeys: [],
      timeZone: "UTC",
    });
    expect(row).toEqual({
      actionable: true,
      title: "Friday wasn't secured.",
      caption: "Use a freeze to cover it, until midnight. 2 left.",
      actionLabel: USE_FREEZE_ACTION,
    });
    expect(canOfferYesterdayFreeze({
      hardMode: false,
      freezesRemaining: 1,
      missDateKey: MISS,
      todayKey: TODAY,
      securedDateKeys: [],
    })).toBe(true);
    const src = readFileSync(resolve(__dirname, "./freeze-recovery.ts"), "utf8");
    expect(src).not.toMatch(/missAck|miss_ack|ackedDateKey/);
  });

  it("after midnight → copy only", () => {
    expect(freezeWindowOpen(MISS, "2026-10-04")).toBe(false);
    expect(
      freezeRecoveryRow({
        hardMode: false,
        freezesRemaining: 2,
        missDateKey: MISS,
        todayKey: "2026-10-04",
        securedDateKeys: [],
      }),
    ).toBeNull();
    expect(
      canOfferYesterdayFreeze({
        hardMode: false,
        freezesRemaining: 2,
        missDateKey: MISS,
        todayKey: "2026-10-04",
        securedDateKeys: [],
      }),
    ).toBe(false);
  });

  it("No Days Off → no button", () => {
    expect(
      freezeRecoveryRow({
        hardMode: true,
        freezesRemaining: 3,
        missDateKey: MISS,
        todayKey: TODAY,
        securedDateKeys: [],
      }),
    ).toBeNull();
    expect(USE_FREEZE_ACTION).toBe("Use freeze");
    expect(freezeRecoveryTitle(MISS, "UTC")).toBe("Friday wasn't secured.");
    expect(freezeRecoveryCaption(1)).toBe("Use a freeze to cover it, until midnight. 1 left.");
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ActiveChallengeV3.tsx"),
      "utf8",
    );
    expect(detail).toContain("p.freezeRow.actionLabel");
    expect(detail).toContain("onUseFreeze");
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toContain("onPressStreak");
    const tab = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(tab).toContain("canOfferYesterdayFreeze");
    expect(tab).toContain("onPressStreak");
    const screen = readFileSync(
      resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(screen).toContain("freezeRecoveryRow");
    expect(screen).toContain("FreezeSheet");
  });
});
