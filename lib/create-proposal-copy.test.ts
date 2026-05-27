import { describe, it, expect } from "vitest";
import { headlineForReason } from "./create-proposal-copy";

describe("headlineForReason", () => {
  it("first_challenge → 'Your first one' eyebrow + welcoming line", () => {
    const h = headlineForReason({ kind: "first_challenge" });
    expect(h.eyebrow).toBe("Your first one");
    expect(h.line.toLowerCase()).toContain("start with this");
  });

  it("back_after_break (3–14 days) → uses the day count in the line", () => {
    const h = headlineForReason({ kind: "back_after_break", days_since_last_activity: 5 });
    expect(h.eyebrow).toBe("For you");
    expect(h.line).toContain("5 days");
  });

  it("back_after_break (boundary: 3 days) → still uses day count", () => {
    const h = headlineForReason({ kind: "back_after_break", days_since_last_activity: 3 });
    expect(h.line).toContain("3 days");
  });

  it("back_after_break (boundary: 14 days) → still uses day count", () => {
    const h = headlineForReason({ kind: "back_after_break", days_since_last_activity: 14 });
    expect(h.line).toContain("14 days");
  });

  it("back_after_break (>14 days) → falls back to safe generic line", () => {
    const h = headlineForReason({ kind: "back_after_break", days_since_last_activity: 90 });
    expect(h.line).not.toContain("90 days");
    expect(h.line.toLowerCase()).toContain("lock in");
  });

  it("back_after_break (<3 days, edge case) → falls back to safe generic line", () => {
    const h = headlineForReason({ kind: "back_after_break", days_since_last_activity: 1 });
    expect(h.line).not.toContain("1 days");
    expect(h.line.toLowerCase()).toContain("lock in");
  });

  it("weekend_reset → 'Sunday night' eyebrow", () => {
    const h = headlineForReason({ kind: "weekend_reset" });
    expect(h.eyebrow).toBe("Sunday night");
    expect(h.line.toLowerCase()).toContain("pick");
  });

  it("default → safe 'For you' / 'Try this one.' fallback", () => {
    const h = headlineForReason({ kind: "default" });
    expect(h.eyebrow).toBe("For you");
    expect(h.line).toBe("Try this one.");
  });
});
