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

/** Library is unreachable when the task requires camera-only. */
export function isLibraryBlocked(requireCameraOnly: boolean): boolean {
  return requireCameraOnly === true;
}
