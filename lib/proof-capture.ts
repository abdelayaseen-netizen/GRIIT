/**
 * The 4:5 crop must stay a real JPEG. ImageManipulator on the simulator
 * (and a 0×0 crop) writes a sub-8KB stub that upload rejects before
 * checkins.complete ever runs.
 */
import { cropRectTo45, type PixelRect } from "@/lib/crop-to-45";
import { MIN_PROOF_IMAGE_BYTES } from "@/lib/proof-image-bytes";

const MAX_EDGE = 1600;
const MIN_EDGE = 32;

export function captureEditPlan(
  width: number,
  height: number,
): { crop: PixelRect; resize?: { width: number; height: number } } | null {
  const crop = cropRectTo45(width, height);
  if (crop.width < MIN_EDGE || crop.height < MIN_EDGE) return null;
  const edge = Math.max(crop.width, crop.height);
  if (edge <= MAX_EDGE) return { crop };
  const scale = MAX_EDGE / edge;
  return {
    crop,
    resize: {
      width: Math.max(MIN_EDGE, Math.round(crop.width * scale)),
      height: Math.max(MIN_EDGE, Math.round(crop.height * scale)),
    },
  };
}

/** Prefer the cropped file. If that crop is the stub, keep the original camera file. */
export function chooseCaptureFile(
  croppedBytes: number,
  originalBytes: number,
): "cropped" | "original" | "none" {
  if (croppedBytes >= MIN_PROOF_IMAGE_BYTES) return "cropped";
  if (originalBytes >= MIN_PROOF_IMAGE_BYTES) return "original";
  return "none";
}
