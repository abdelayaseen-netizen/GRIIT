import { describe, expect, it } from "vitest";
import { MIN_PROOF_IMAGE_BYTES } from "@/lib/proof-image-bytes";
import { captureEditPlan, chooseCaptureFile } from "@/lib/proof-capture";

describe("capture file choice", () => {
  it("keeps a real crop and falls back when the crop is the stub", () => {
    expect(chooseCaptureFile(MIN_PROOF_IMAGE_BYTES, 1401)).toBe("cropped");
    expect(chooseCaptureFile(1401, MIN_PROOF_IMAGE_BYTES + 1)).toBe("original");
    expect(chooseCaptureFile(1401, 1401)).toBe("none");
  });

  it("skips a 0×0 crop that would write the stub", () => {
    expect(captureEditPlan(0, 0)).toBeNull();
    const plan = captureEditPlan(3000, 4000);
    expect(plan?.crop.width).toBeGreaterThan(32);
    expect(plan?.resize?.width).toBeLessThanOrEqual(1600);
  });
});
