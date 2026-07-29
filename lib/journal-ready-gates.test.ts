import { describe, it, expect } from "vitest";
import {
  buildJournalReadyGates,
  formatJournalWordFloorLabel,
  resolveJournalReadySubtype,
  JOURNAL_READY_HELPER,
  JOURNAL_READY_SUBTYPE_FALLBACK,
} from "./journal-ready-gates";

describe("formatJournalWordFloorLabel", () => {
  it("formats N words · Minimum length from real floor", () => {
    expect(formatJournalWordFloorLabel(150)).toBe("150 words · Minimum length");
    expect(formatJournalWordFloorLabel(20)).toBe("20 words · Minimum length");
  });
});

describe("buildJournalReadyGates", () => {
  it("returns empty when no window and no word floor", () => {
    expect(buildJournalReadyGates({})).toEqual([]);
    expect(buildJournalReadyGates({ min_words: 0 })).toEqual([]);
  });

  it("adds time window with formatted range", () => {
    expect(
      buildJournalReadyGates({
        schedule_window_start: "20:00",
        schedule_window_end: "23:00",
      })
    ).toEqual([
      {
        key: "time",
        label: "Time window",
        sublabel: "20:00 – 23:00",
      },
    ]);
  });

  it("adds word floor only when min_words > 0", () => {
    expect(
      buildJournalReadyGates({ min_words: 150 }).map((g) => g.key)
    ).toEqual(["word_floor"]);
    expect(buildJournalReadyGates({ min_words: 150 })[0]?.label).toBe(
      "150 words · Minimum length"
    );
  });

  it("includes both gates when both apply — never a camera row", () => {
    const gates = buildJournalReadyGates({
      schedule_window_start: "20:00",
      schedule_window_end: "23:00",
      min_words: 150,
    });
    expect(gates.map((g) => g.key)).toEqual(["time", "word_floor"]);
    expect(gates.some((g) => g.key === "camera")).toBe(false);
  });
});

describe("resolveJournalReadySubtype", () => {
  it("falls back to Journal", () => {
    expect(resolveJournalReadySubtype({})).toBe(JOURNAL_READY_SUBTYPE_FALLBACK);
  });

  it("prefers subtype → label → unit_label", () => {
    expect(
      resolveJournalReadySubtype({
        subtype: "Gratitude",
        label: "Night notes",
        unit_label: "Journal",
      })
    ).toBe("Gratitude");
  });
});

describe("journal ready copy constants", () => {
  it("locks helper string", () => {
    expect(JOURNAL_READY_HELPER).toBe("No camera — words only.");
  });
});
