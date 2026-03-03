import { describe, it, expect } from "vitest";
import { dbTaskType, journalMinWords } from "./challenges";

describe("challenges.create helpers (regression)", () => {
  describe("dbTaskType", () => {
    it("maps simple to manual for DB enum", () => {
      expect(dbTaskType("simple")).toBe("manual");
    });
    it("passes through other types", () => {
      expect(dbTaskType("journal")).toBe("journal");
      expect(dbTaskType("timer")).toBe("timer");
      expect(dbTaskType("run")).toBe("run");
      expect(dbTaskType("photo")).toBe("photo");
      expect(dbTaskType("checkin")).toBe("checkin");
    });
  });

  describe("journalMinWords", () => {
    it("defaults to 20 when undefined or null", () => {
      expect(journalMinWords(undefined)).toBe(20);
      expect(journalMinWords(null)).toBe(20);
    });
    it("returns value when provided", () => {
      expect(journalMinWords(50)).toBe(50);
      expect(journalMinWords(1)).toBe(1);
    });
  });
});
