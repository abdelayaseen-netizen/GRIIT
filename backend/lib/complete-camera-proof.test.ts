import { describe, expect, it } from "vitest";
import { hasCameraProof as clientHasCameraProof } from "../../lib/active-challenge-ui";
import { hasCameraProof } from "./proof-predicate";
import {
  completeCameraProofWrite,
  isInAppCameraCapture,
} from "./complete-camera-proof";
import { createCameraCaptureMeta, createLibraryCaptureMeta } from "../../lib/photo-capture-meta";

const PHOTO = "https://cdn/proof.jpg";
const shutter = new Date("2026-09-17T12:00:00.000Z");

describe("isInAppCameraCapture", () => {
  it("is the captured_in_app === true check, same as photo-verification", () => {
    expect(isInAppCameraCapture(createCameraCaptureMeta(shutter))).toBe(true);
    expect(isInAppCameraCapture(createLibraryCaptureMeta(shutter))).toBe(false);
    expect(isInAppCameraCapture({ captured_in_app: true })).toBe(true);
    expect(isInAppCameraCapture({ captured_in_app: false })).toBe(false);
    expect(isInAppCameraCapture(null)).toBe(false);
    expect(isInAppCameraCapture(undefined)).toBe(false);
  });
});

describe("completeCameraProofWrite", () => {
  it("complete with in-app capture → proof_photo_url + verified + verification_method photo", () => {
    const row = completeCameraProofWrite({
      photoUrl: PHOTO,
      proofPayload: createCameraCaptureMeta(shutter),
    });
    expect(row).toEqual({
      proof_photo_url: PHOTO,
      verified: true,
      verification_method: "photo",
    });
    expect(hasCameraProof(row!)).toBe(true);
    expect(clientHasCameraProof(row!)).toBe(true);
    expect(hasCameraProof(row!)).toBe(clientHasCameraProof(row!));
  });

  it("complete without capture → neither proof_photo_url nor verified", () => {
    const row = completeCameraProofWrite({
      photoUrl: null,
      proofPayload: undefined,
    });
    expect(row).toBeNull();
    const written = { proof_photo_url: null as string | null, verified: undefined as boolean | undefined };
    expect(hasCameraProof(written)).toBe(false);
    expect(clientHasCameraProof(written)).toBe(false);
    expect(hasCameraProof(written)).toBe(clientHasCameraProof(written));
  });

  it("library pick with a photo does not set camera-proof columns", () => {
    expect(
      completeCameraProofWrite({
        photoUrl: PHOTO,
        proofPayload: createLibraryCaptureMeta(shutter),
      }),
    ).toBeNull();
    expect(
      completeCameraProofWrite({
        photoUrl: PHOTO,
        proofPayload: { captured_in_app: false },
      }),
    ).toBeNull();
  });

  it("photo without payload is not camera proof", () => {
    expect(completeCameraProofWrite({ photoUrl: PHOTO, proofPayload: null })).toBeNull();
  });
});
