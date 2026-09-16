import { describe, expect, it } from "vitest";
import { securedHasCameraProof } from "@/lib/secured-layout";

describe("securedHasCameraProof", () => {
  it("is false when the completion has no camera proof", () => {
    expect(securedHasCameraProof({})).toBe(false);
    expect(securedHasCameraProof({ verified: false, proof_photo_url: null, proofUri: "" })).toBe(false);
  });

  it("is true when the completion returned a photo or verified flag", () => {
    expect(securedHasCameraProof({ proofUri: "file://proof.jpg" })).toBe(true);
    expect(securedHasCameraProof({ proof_photo_url: "https://cdn/proof.jpg" })).toBe(true);
    expect(securedHasCameraProof({ verified: true })).toBe(true);
  });

  it("does not take require_photo as an argument", () => {
    expect(securedHasCameraProof({ verified: false })).toBe(false);
    expect(
      securedHasCameraProof({
        verified: false,
        proof_photo_url: null,
        proofUri: null,
      })
    ).toBe(false);
  });
});
