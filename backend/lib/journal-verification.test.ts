import { describe, it, expect } from "vitest";
import {
  buildJournalVerification,
  formatJournalSecuredMeta,
  formatJournalWordLabel,
  formatSavedWindowLabel,
  type JournalLogFacts,
} from "./journal-verification";

describe("formatSavedWindowLabel", () => {
  it("formats inside / outside", () => {
    expect(formatSavedWindowLabel("21:18", true)).toBe(
      "Saved 21:18 — inside the window"
    );
    expect(formatSavedWindowLabel("09:00", false)).toBe(
      "Saved 09:00 — outside the window"
    );
  });
});

describe("formatJournalWordLabel", () => {
  it("floor branch uses over-a-floor copy", () => {
    const log: JournalLogFacts = { word_count: 220, floor_min: 150 };
    expect(formatJournalWordLabel(log)).toBe(
      "220 words over a 150 word floor"
    );
  });

  it("no-floor branch uses short copy", () => {
    expect(
      formatJournalWordLabel({ word_count: 40, floor_min: null })
    ).toBe("40 words");
    expect(
      formatJournalWordLabel({ word_count: 40, floor_min: 0 })
    ).toBe("40 words");
  });
});

describe("formatJournalSecuredMeta", () => {
  it("formats N words", () => {
    expect(formatJournalSecuredMeta(220)).toBe("220 words");
  });
});

describe("buildJournalVerification", () => {
  it("includes window + floor word row — never a camera row", () => {
    const verification = buildJournalVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "21:18" },
      journalLog: { word_count: 220, floor_min: 150 },
    });
    expect(verification.rows).toEqual([
      {
        key: "time_window",
        label: "Saved 21:18 — inside the window",
        verified: true,
        role: "check",
      },
      {
        key: "word_count",
        label: "220 words over a 150 word floor",
        verified: true,
        role: "record",
      },
    ]);
    expect(verification.rows.some((r) => r.key === "camera_in_app")).toBe(
      false
    );
  });

  it("no-floor short copy when floor_min null", () => {
    const verification = buildJournalVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      journalLog: { word_count: 40, floor_min: null },
    });
    expect(verification.rows).toEqual([
      {
        key: "word_count",
        label: "40 words",
        verified: true,
        role: "record",
      },
    ]);
  });
});
