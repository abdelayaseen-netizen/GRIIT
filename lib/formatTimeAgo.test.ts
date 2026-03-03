import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTimeAgo, formatTimeAgoCompact } from "./formatTimeAgo";

describe("formatTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns now for same moment", () => {
    const r = formatTimeAgo("2025-02-28T12:00:00.000Z");
    expect(r.text).toBe("now");
    expect(r.isDayOrMore).toBe(false);
  });

  it("returns minutes when < 60 min", () => {
    const r = formatTimeAgo("2025-02-28T11:55:00.000Z");
    expect(r.text).toBe("5m");
    expect(r.isDayOrMore).toBe(false);
  });

  it("returns hours when < 24h", () => {
    const r = formatTimeAgo("2025-02-28T10:00:00.000Z");
    expect(r.text).toBe("2h");
    expect(r.isDayOrMore).toBe(false);
  });

  it("returns days when >= 24h", () => {
    const r = formatTimeAgo("2025-02-27T12:00:00.000Z");
    expect(r.text).toBe("1d");
    expect(r.isDayOrMore).toBe(true);
  });
});

describe("formatTimeAgoCompact", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns compact string", () => {
    expect(formatTimeAgoCompact("2025-02-28T11:55:00.000Z")).toBe("5m");
    expect(formatTimeAgoCompact("2025-02-28T12:00:00.000Z")).toBe("now");
  });
});
