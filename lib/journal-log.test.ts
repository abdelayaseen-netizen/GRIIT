import { describe, it, expect } from "vitest";
import { formatJournalSecuredMeta } from "./journal-log";

describe("formatJournalSecuredMeta", () => {
  it("formats N words", () => {
    expect(formatJournalSecuredMeta(220)).toBe("220 words");
    expect(formatJournalSecuredMeta(1)).toBe("1 words");
  });
});
