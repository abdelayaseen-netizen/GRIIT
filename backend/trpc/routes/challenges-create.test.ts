import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dbTaskType, journalMinWords, taskStrictAndPhoto } from "./challenges";
import { soloCreateVisibility } from "../../lib/create-visibility";

describe("solo custom visibility", () => {
  it("never saves PUBLIC for solo, even if the client asks", () => {
    expect(soloCreateVisibility("solo", "PUBLIC")).toBe("PRIVATE");
    expect(soloCreateVisibility("solo", "FRIENDS")).toBe("PRIVATE");
    expect(soloCreateVisibility(undefined, "PUBLIC")).toBe("PRIVATE");
    expect(soloCreateVisibility("team", "PUBLIC")).toBe("PRIVATE");
    const wizard = readFileSync(resolve(__dirname, "../../../components/create/CreateWizardV2.tsx"), "utf8");
    expect(wizard).toContain('visibility: state.who === "group" ? "FRIENDS" : "PRIVATE"');
    expect(wizard).not.toContain('visibility: state.who === "group" ? "FRIENDS" : "PUBLIC"');
  });
});

describe("challenges.create helpers (regression)", () => {
  describe("dbTaskType", () => {
    it("maps simple to manual for DB enum", () => {
      expect(dbTaskType("simple")).toBe("manual");
    });
    it("maps photo to manual for backward compat", () => {
      expect(dbTaskType("photo")).toBe("manual");
    });
    it("passes through other types", () => {
      expect(dbTaskType("journal")).toBe("journal");
      expect(dbTaskType("timer")).toBe("timer");
      expect(dbTaskType("run")).toBe("run");
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

  describe("taskStrictAndPhoto", () => {
    it("never writes timer hard mode — wall-clock timer only", () => {
      expect(taskStrictAndPhoto({ type: "timer", strictTimerMode: true }).strict_timer_mode).toBe(false);
      expect(taskStrictAndPhoto({ type: "timer", strictTimerMode: false }).strict_timer_mode).toBe(false);
      expect(taskStrictAndPhoto({ type: "timer" }).strict_timer_mode).toBe(false);
      expect(taskStrictAndPhoto({ type: "journal" }).strict_timer_mode).toBe(false);
    });
    it("stores require_photo_proof for any type with requirePhotoProof or legacy photo type", () => {
      expect(taskStrictAndPhoto({ type: "journal", requirePhotoProof: true }).require_photo_proof).toBe(true);
      expect(taskStrictAndPhoto({ type: "photo" }).require_photo_proof).toBe(true);
      expect(taskStrictAndPhoto({ type: "simple", requirePhotoProof: false }).require_photo_proof).toBe(false);
      expect(taskStrictAndPhoto({ type: "simple" }).require_photo_proof).toBe(false);
    });
  });
});
