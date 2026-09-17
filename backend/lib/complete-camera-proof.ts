/**
 * Camera-proof columns for checkins.complete.
 *
 * Capture source check (same as buildPhotoVerification):
 *   proof_payload_json.captured_in_app === true
 * Camera path always sets that true (lib/photo-capture-meta.ts
 * createCameraCaptureMeta). A library pick sets captured_in_app false
 * (createLibraryCaptureMeta) and must not write proof_photo_url / verified.
 */

export type CompleteCameraProofWrite = {
  proof_photo_url: string;
  verified: true;
  verification_method: "photo";
};

export function isInAppCameraCapture(
  proofPayload: { captured_in_app?: boolean } | null | undefined,
): boolean {
  return proofPayload?.captured_in_app === true;
}

export function completeCameraProofWrite(args: {
  photoUrl: string | null | undefined;
  proofPayload: { captured_in_app?: boolean } | null | undefined;
}): CompleteCameraProofWrite | null {
  const url = typeof args.photoUrl === "string" ? args.photoUrl.trim() : "";
  if (!url) return null;
  if (!isInAppCameraCapture(args.proofPayload)) return null;
  return {
    proof_photo_url: url,
    verified: true,
    verification_method: "photo",
  };
}
