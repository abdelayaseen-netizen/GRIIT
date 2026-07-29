import { describe, it, expect } from "vitest";
import {
  createCameraCaptureMeta,
  createLibraryCaptureMeta,
  isLibraryBlocked,
} from "./photo-capture-meta";

describe("createCameraCaptureMeta", () => {
  it("records shutter time and captured_in_app: true", () => {
    const now = new Date("2026-07-28T11:42:00.000Z");
    expect(createCameraCaptureMeta(now)).toEqual({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: true,
    });
  });
});

describe("createLibraryCaptureMeta", () => {
  it("marks captured_in_app false", () => {
    const now = new Date("2026-07-28T11:42:00.000Z");
    expect(createLibraryCaptureMeta(now).captured_in_app).toBe(false);
  });
});

describe("isLibraryBlocked", () => {
  it("blocks library when require_camera_only", () => {
    expect(isLibraryBlocked(true)).toBe(true);
    expect(isLibraryBlocked(false)).toBe(false);
  });
});
