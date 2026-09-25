import { describe, expect, it } from "vitest";
import { isPersistedProofImage, MIN_PROOF_IMAGE_BYTES } from "@/lib/proof-image-bytes";

describe("isPersistedProofImage", () => {
  it("rejects the 19 Sept 1401-byte JFIF stub", () => {
    const stub = new Uint8Array(1401);
    stub[0] = 0xff;
    stub[1] = 0xd8;
    stub[2] = 0xff;
    expect(stub.byteLength).toBeLessThan(MIN_PROOF_IMAGE_BYTES);
    expect(isPersistedProofImage(stub.buffer)).toBe(false);
  });

  it("accepts a JPEG at or above the minimum", () => {
    const ok = new Uint8Array(MIN_PROOF_IMAGE_BYTES);
    ok[0] = 0xff;
    ok[1] = 0xd8;
    ok[2] = 0xff;
    expect(isPersistedProofImage(ok.buffer)).toBe(true);
  });
});
