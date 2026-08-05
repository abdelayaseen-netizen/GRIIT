/**
 * Local photo proof metadata recorded at shutter (task-states-v2).
 * Groundwork for Step 11 server verification rows — not uploaded this step.
 */

export type PhotoCaptureMeta = {
  /** ISO timestamp at shutter press (successful camera return). */
  capturedAt: string;
  /** Always true for in-app camera path; false if library were used. */
  captured_in_app: boolean;
};

/**
 * Local frame bytes shared by launchCameraAsync and CameraView.
 * Both mechanisms must satisfy this shape before upload.
 */
export type PhotoCaptureAsset = {
  uri: string;
  base64: string;
};

export function createCameraCaptureMeta(now: Date = new Date()): PhotoCaptureMeta {
  return {
    capturedAt: now.toISOString(),
    captured_in_app: true,
  };
}

export function createLibraryCaptureMeta(now: Date = new Date()): PhotoCaptureMeta {
  return {
    capturedAt: now.toISOString(),
    captured_in_app: false,
  };
}

/**
 * Single contract for in-app camera provenance.
 * launchCameraAsync and CameraView both call this — never invent meta in either path.
 */
export function bindInAppCameraCapture(
  asset: PhotoCaptureAsset,
  now: Date = new Date()
): { asset: PhotoCaptureAsset; meta: PhotoCaptureMeta } {
  return {
    asset,
    meta: createCameraCaptureMeta(now),
  };
}

/** Library is unreachable when the task requires camera-only. */
export function isLibraryBlocked(requireCameraOnly: boolean): boolean {
  return requireCameraOnly === true;
}
