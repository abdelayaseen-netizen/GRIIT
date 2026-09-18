import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLOSE,
  FREEZE_SUCCESS_INVALIDATES,
  NO_FREEZES_LEFT,
  NO_LET_IT_RESET,
  SEE_PRO,
  USE_A_FREEZE_FOR_YESTERDAY_Q,
  USE_THE_FREEZE,
  freezeNoneBody,
  freezeOfferBody,
  freezeRefillDateLabel,
  freezeSheetNetwork,
  freezeSheetVariant,
} from "./freeze-sheet";

describe("freeze sheet", () => {
  it("success path invalidates home bootstrap", () => {
    expect(FREEZE_SUCCESS_INVALIDATES).toEqual(["home", "bootstrap"]);
  });

  it("refusal makes no call", () => {
    expect(freezeSheetNetwork("refuse")).toBe("none");
    expect(freezeSheetNetwork("close")).toBe("none");
    expect(freezeSheetNetwork("use")).toBe("useFreeze");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("onRefuse={() => setShowFreezeSheet(false)}");
    expect(home).not.toContain("StreakFreezeModal");
    expect(home).toContain("invalidateQueries({ queryKey: [...FREEZE_SUCCESS_INVALIDATES] })");
    expect(home).toContain("timeZone={homeTimeZone}");
    expect(home).not.toContain("previous_streak");
    expect(home).not.toContain("Math.max(recon.result?.previous_streak ?? 0, 1)");
  });

  it("matches the frame 54 table", () => {
    expect(freezeSheetVariant(1)).toBe("offer");
    expect(freezeSheetVariant(0)).toBe("none");
    expect(USE_A_FREEZE_FOR_YESTERDAY_Q).toBe("Use a freeze for yesterday?");
    expect(freezeOfferBody(12, 1)).toBe(
      "Your 12-day streak comes back. 1 left, and it refills 30 days after you use it.",
    );
    expect(freezeOfferBody(0, 1)).toBe(
      "Your 0-day streak comes back. 1 left, and it refills 30 days after you use it.",
    );
    expect(USE_THE_FREEZE).toBe("Use the freeze");
    expect(NO_LET_IT_RESET).toBe("No, let it reset");
    expect(NO_FREEZES_LEFT).toBe("No freezes left");
    expect(freezeNoneBody("16 October")).toBe(
      "Yours refills on 16 October. Pro carries four a month instead of one.",
    );
    expect(SEE_PRO).toBe("See Pro");
    expect(CLOSE).toBe("Close");
    expect(freezeRefillDateLabel("2026-09-16T00:00:00.000Z", "UTC")).toBe("16 October");
    expect(freezeRefillDateLabel("2026-09-16T00:00:00.000Z", "America/New_York")).toBe("15 October");
  });
});
