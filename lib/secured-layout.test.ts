import { describe, expect, it } from "vitest";
import { moreDaysThisWeek, securedHasCameraProof } from "@/lib/secured-layout";

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

  it("counts remaining days after today in a Mon–Sun week", () => {
    expect(moreDaysThisWeek(0)).toBe(6);
    expect(moreDaysThisWeek(5)).toBe(1);
    expect(moreDaysThisWeek(6)).toBe(0);
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
