/**
 * Compatibility: photo-ready-start re-exports decideReadyStart as decidePhotoReadyStart.
 * Behavior covered in ready-start.test.ts — this proves the alias still works.
 */
import { describe, it, expect } from "vitest";
import {
  decidePhotoReadyStart,
  decideReadyStart,
  formatOpensAtLabel,
} from "./photo-ready-start";

describe("photo-ready-start re-exports", () => {
  it("decidePhotoReadyStart is decideReadyStart", () => {
    expect(decidePhotoReadyStart).toBe(decideReadyStart);
  });

  it("alias behavior matches decideReadyStart", () => {
    expect(
      decidePhotoReadyStart({ status: "out_of_window", windowStart: "07:00" })
    ).toEqual(decideReadyStart({ status: "out_of_window", windowStart: "07:00" }));
    expect(formatOpensAtLabel("07:00")).toBe("Opens at 07:00");
  });
});
