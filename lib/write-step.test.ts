import { describe, expect, it } from "vitest";
import { wordCount } from "@/lib/task-flow-state";
import {
  WRITE_FOOTER_CAPTION,
  WRITE_PLACEHOLDER,
  WRITE_WORDS_LABEL,
  writeCounterFill,
  writeCounterLabel,
  writeCounterMet,
  writeCtaEnabled,
  writeCtaLabel,
  writeHonestyLine,
  writeStepHeader,
} from "@/lib/write-step";

describe("write counter", () => {
  it("keeps counting past the target", () => {
    expect(writeCounterLabel(0, 150)).toBe("0 of 150");
    expect(writeCounterLabel(150, 150)).toBe("150 of 150");
    expect(writeCounterLabel(155, 150)).toBe("155 of 150");
    expect(writeCounterFill(155, 150)).toBe(1);
    expect(writeCounterMet(149, 150)).toBe(false);
    expect(writeCounterMet(150, 150)).toBe(true);
  });
});

describe("write CTA", () => {
  it("pluralises remaining words and enables Post at the target", () => {
    expect(writeCtaLabel(0, 150)).toBe("Write 150 more words");
    expect(writeCtaEnabled(0, 150)).toBe(false);
    expect(writeCtaLabel(149, 150)).toBe("Write 1 more word");
    expect(writeCtaEnabled(149, 150)).toBe(false);
    expect(writeCtaLabel(150, 150)).toBe("Post");
    expect(writeCtaEnabled(150, 150)).toBe(true);
    expect(writeCtaLabel(155, 150)).toBe("Post");
  });

  it("counts words the same way the submit path does", () => {
    expect(wordCount("one two three")).toBe(3);
    expect(writeCtaLabel(wordCount("a"), 2)).toBe("Write 1 more word");
  });
});

describe("write copy", () => {
  it("matches the frame 40 table", () => {
    expect(writeStepHeader(12)).toBe("Day 12 · Write");
    expect(writeHonestyLine(150)).toBe("150 words. Counted, not read.");
    expect(WRITE_WORDS_LABEL).toBe("Words");
    expect(WRITE_PLACEHOLDER).toBe("Write here");
    expect(WRITE_FOOTER_CAPTION).toBe("Nothing is secured until the server says so.");
  });
});
