import { describe, expect, it } from "vitest";
import {
  HARD_MODE_PROOF_CAPTION,
  HARD_MODE_REVIEW_PHOTO,
  effectivePhotoProof,
  reviewPhotoLine,
} from "@/lib/create-wizard-hard-proof";

describe("effectivePhotoProof", () => {
  it("forces required on hard even when the stored value is optional or off", () => {
    expect(effectivePhotoProof("hard", "optional")).toBe("required");
    expect(effectivePhotoProof("hard", "off")).toBe("required");
    expect(effectivePhotoProof("hard", "required")).toBe("required");
  });

  it("passes the stored value through on standard", () => {
    expect(effectivePhotoProof("standard", "optional")).toBe("optional");
    expect(effectivePhotoProof("standard", "off")).toBe("off");
    expect(effectivePhotoProof("standard", "required")).toBe("required");
  });
});

describe("reviewPhotoLine", () => {
  it("reads Photo proof required · Hard mode when difficulty is hard", () => {
    expect(reviewPhotoLine("hard", "optional")).toBe(HARD_MODE_REVIEW_PHOTO);
    expect(reviewPhotoLine("hard", "off")).toBe("Photo proof required · Hard mode");
  });

  it("keeps off / optional / required on standard", () => {
    expect(reviewPhotoLine("standard", "off")).toBe("Photo proof off");
    expect(reviewPhotoLine("standard", "optional")).toBe("Photo proof optional");
    expect(reviewPhotoLine("standard", "required")).toBe("Photo proof required");
  });
});

describe("HARD_MODE_PROOF_CAPTION", () => {
  it("is the step 3 locked-control caption", () => {
    expect(HARD_MODE_PROOF_CAPTION).toBe("Hard mode requires photo proof on every task.");
  });
});
