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
  freezeNoneShowsSeePro,
  freezeOfferBody,
  freezeRefillDateLabel,
  freezeCloseAcksDateKey,
  freezeRefuseAcksDateKey,
  freezeSheetNetwork,
  freezeSheetVariant,
  freezeUseCallsMutation,
} from "./freeze-sheet";
import { morningAfterVisible } from "./morning-after";

describe("freeze sheet", () => {
  it("success path invalidates bootstrap, getStats, getFreezeStatus, and getRecord", () => {
    expect(FREEZE_SUCCESS_INVALIDATES).toEqual([
      ["home", "bootstrap"],
      ["profiles", "getStats"],
      ["streaks", "getFreezeStatus"],
      ["profiles", "getRecord"],
    ]);
    const profile = readFileSync(resolve(__dirname, "../lib/onboarding-v2-profile.ts"), "utf8");
    expect(profile).toContain('["profiles", "getRecord"]');
    const tab = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    expect(tab).toContain('queryKey: ["profiles", "getRecord", user?.id ?? ""]');
    const consistency = readFileSync(resolve(__dirname, "../app/profile/consistency.tsx"), "utf8");
    expect(consistency).toContain('queryKey: ["profiles", "getRecord", targetId]');
  });

  it("refusal makes no call", () => {
    expect(freezeSheetNetwork("refuse")).toBe("none");
    expect(freezeSheetNetwork("close")).toBe("none");
    expect(freezeSheetNetwork("use")).toBe("useFreeze");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("onRefuse={() => {");
    expect(home).toContain("setShowFreezeSheet(false)");
    expect(home).not.toContain("StreakFreezeModal");
    expect(home).toContain("for (const queryKey of FREEZE_SUCCESS_INVALIDATES)");
    expect(home).toContain("invalidateQueries({ queryKey: [...queryKey] })");
    expect(home).toContain("timeZone={homeTimeZone}");
    expect(home).not.toContain("previous_streak");
    expect(home).not.toContain("Math.max(recon.result?.previous_streak ?? 0, 1)");
    expect(home).toContain("useFreeze.mutate()");
    expect(home).toContain("missAckPayload(yesterdayKey)");
    expect(home).toContain("setFreezeError(inlineServerError(err))");
    expect(freezeUseCallsMutation()).toBe(true);
    expect(freezeRefuseAcksDateKey()).toBe(true);
    expect(freezeCloseAcksDateKey()).toBe(false);
    const freezeUi = readFileSync(resolve(__dirname, "../components/home/FreezeSheet.tsx"), "utf8");
    expect(freezeUi).not.toContain("onDismiss={onRefuse}");
    expect(freezeUi).toContain("onDismiss={onClose}");
    expect(freezeUi).toContain(`<Button label={NO_LET_IT_RESET} variant="tertiary" onPress={onRefuse} />`);
    const closeIdx = home.indexOf("onClose={() => {");
    const refuseIdx = home.indexOf("onRefuse={() => {");
    expect(closeIdx).toBeGreaterThan(-1);
    expect(refuseIdx).toBeGreaterThan(-1);
    const closeBlock = home.slice(closeIdx, closeIdx + 180);
    const refuseBlock = home.slice(refuseIdx, refuseIdx + 280);
    expect(closeBlock).not.toContain("missAckPayload");
    expect(closeBlock).not.toContain("AsyncStorage.setItem");
    expect(refuseBlock).toContain("missAckPayload");
    expect(refuseBlock).toContain("AsyncStorage.setItem");
    const sheet = readFileSync(resolve(__dirname, "../components/ds/Sheet.tsx"), "utf8");
    expect(sheet).toContain("zIndex: 1");
    expect(sheet).toContain("pointerEvents=\"box-none\"");
    expect(freezeUi).toContain("error ? <Text style={styles.error}>{error}</Text>");
    expect(morningAfterVisible("freeze", null, "2026-09-17")).toBe(true);
    expect(morningAfterVisible("freeze", "2026-09-17", "2026-09-17")).toBe(false);
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
    expect(freezeNoneShowsSeePro("premium")).toBe(false);
    expect(freezeNoneShowsSeePro("trial")).toBe(false);
    expect(freezeNoneShowsSeePro("free")).toBe(true);
    expect(freezeNoneShowsSeePro(null)).toBe(true);
    const sheet = readFileSync(resolve(__dirname, "../components/home/FreezeSheet.tsx"), "utf8");
    expect(sheet).toContain("variant === \"none\"");
    expect(sheet).toContain("freezeNoneShowsSeePro(subscriptionStatus)");
    expect(freezeRefillDateLabel("2026-09-16T00:00:00.000Z", "UTC")).toBe("16 October");
    expect(freezeRefillDateLabel("2026-09-16T00:00:00.000Z", "America/New_York")).toBe("15 October");
  });
});
