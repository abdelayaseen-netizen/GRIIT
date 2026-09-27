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
  it("shows feed visibility, never the word Photo", () => {
    expect(reviewPhotoLine("hard", "optional")).toBe(HARD_MODE_REVIEW_PHOTO);
    expect(reviewPhotoLine("hard", "off")).toBe("Feed · Required");
    expect(reviewPhotoLine("standard", "off")).toBe("Feed · Off");
    expect(reviewPhotoLine("standard", "optional")).toBe("Feed · Optional");
    expect(reviewPhotoLine("standard", "required")).toBe("Feed · Required");
    expect(reviewPhotoLine("hard", "required")).not.toMatch(/Photo/i);
    expect(reviewPhotoLine("standard", "optional")).not.toMatch(/Photo/i);
  });
});

describe("HARD_MODE_PROOF_CAPTION", () => {
  it("is the step 3 locked-control caption", () => {
    expect(HARD_MODE_PROOF_CAPTION).toBe("Hard mode requires photo proof on every task.");
  });
});
