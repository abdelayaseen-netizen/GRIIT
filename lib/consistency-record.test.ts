import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONSISTENCY_FOOTER,
  CONSISTENCY_TITLE,
  HELD_BY_FREEZE_LABEL,
  HELD_BY_LAST_STAND_LABEL,
  RECORD_DAY_NOT_SECURED,
  RECORD_DAY_OPEN,
  RECORD_DAY_SECURED,
  freezeSplitLine,
  challengeProofCaption,
  completionPct,
  daysValue,
  heroDayLine,
  lastStandSplitLine,
  ofElapsed,
  recordDayDetail,
  recordDayLabel,
  type RecordDayRow,
} from "@/lib/consistency-record";

describe("completionPct", () => {
  it("is round(verifiedClosed / closedDueDays) of elapsed, not duration", () => {
    expect(completionPct(9, 12)).toBe("75%");
    expect(completionPct(12, 75)).toBe("16%");
    expect(completionPct(0, 0)).toBe("—");
  });
});

describe("consistency copy", () => {
  it("matches the frame 41 table", () => {
    expect(CONSISTENCY_TITLE).toBe("Consistency");
    expect(ofElapsed(12)).toBe("of 12");
    expect(heroDayLine(12, 75)).toBe("Day 12 of 75.");
    expect(daysValue(9)).toBe("9 days");
    expect(daysValue(1)).toBe("1 day");
    expect(challengeProofCaption(7, 2)).toBe("7 camera proof, 2 self-reported");
    expect(CONSISTENCY_FOOTER).toBe(
      "A day is secured or it is not. A part-done day counts for nothing, and the count is here so the record is not shorter than the truth.",
    );
  });
});

describe("record day rows by state", () => {
  const row = (
    state: RecordDayRow["state"],
    extra: Partial<RecordDayRow> = {},
  ): RecordDayRow => ({
    dateKey: "2026-09-16",
    state,
    done: 4,
    total: 6,
    cameraProof: false,
    cameraProofCount: 0,
    missedTaskNames: ["Run", "Read"],
    ...extra,
  });

  it("labels freeze, Last Stand, open, and not secured", () => {
    expect(recordDayLabel("secured")).toBe(RECORD_DAY_SECURED);
    expect(recordDayLabel("not_secured")).toBe(RECORD_DAY_NOT_SECURED);
    expect(recordDayLabel("last_stand")).toBe(HELD_BY_LAST_STAND_LABEL);
    expect(recordDayLabel("frozen")).toBe(HELD_BY_FREEZE_LABEL);
    expect(recordDayLabel("open")).toBe(RECORD_DAY_OPEN);
    expect(
      recordDayDetail(
        row("secured", { cameraProof: true, cameraProofCount: 3, done: 6, missedTaskNames: [] }),
      ),
    ).toBe("6 of 6 · 3 camera proof");
    expect(recordDayDetail(row("not_secured"))).toBe("4 of 6 · Run, Read");
    expect(recordDayDetail(row("open"))).toBe("4 of 6 · Run, Read");
    expect(recordDayDetail(row("last_stand"))).toBe("4 of 6 · nothing was checked");
    expect(recordDayDetail(row("frozen"))).toBe("4 of 6 · Run, Read");
    expect(lastStandSplitLine(2)).toBe("Held by a Last Stand — 2 days");
    expect(freezeSplitLine(1)).toBe("Held by a freeze — 1 day");
    expect(lastStandSplitLine(1)).toBe("Held by a Last Stand — 1 day");
    const src = readFileSync(resolve(__dirname, "../app/profile/consistency.tsx"), "utf8");
    expect(src).toContain("daysFromSource");
    expect(src).toContain("ConsistencyGrid");
    expect(src).not.toContain("heroDayLine");
    expect(src).not.toContain("lastStandDaysCount");
  });
});
