import { describe, it, expect } from "vitest";
import {
  bindInAppCameraCapture,
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

describe("bindInAppCameraCapture — ImagePicker and CameraView parity", () => {
  const now = new Date("2026-07-28T11:42:00.000Z");

  it("both capture paths produce identical meta for the same shutter time", () => {
    // launchCameraAsync path (system sheet)
    const fromImagePicker = bindInAppCameraCapture(
      { uri: "file:///tmp/picker.jpg", base64: "aaa" },
      now
    );
    // CameraView path (in-app viewfinder)
    const fromCameraView = bindInAppCameraCapture(
      { uri: "file:///tmp/viewfinder.jpg", base64: "bbb" },
      now
    );

    expect(fromImagePicker.meta).toEqual(fromCameraView.meta);
    expect(fromImagePicker.meta).toEqual({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: true,
    });
  });

  it("always sets captured_in_app true — never invents a pass without provenance", () => {
    const { meta } = bindInAppCameraCapture(
      { uri: "file:///tmp/x.jpg", base64: "x" },
      now
    );
    expect(meta.captured_in_app).toBe(true);
    expect(meta).toEqual(createCameraCaptureMeta(now));
  });

  it("preserves the asset uri/base64 unchanged alongside meta", () => {
    const asset = { uri: "file:///tmp/keep.jpg", base64: "payload" };
    const bound = bindInAppCameraCapture(asset, now);
    expect(bound.asset).toEqual(asset);
  });
});

describe("isLibraryBlocked", () => {
  it("blocks library when require_camera_only", () => {
    expect(isLibraryBlocked(true)).toBe(true);
    expect(isLibraryBlocked(false)).toBe(false);
  });
});
