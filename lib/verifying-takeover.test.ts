import { describe, expect, it } from "vitest";
import { VERIFYING_TAKEOVER_MS, shouldMountVerifyingTakeover } from "@/lib/verifying-takeover";

describe("shouldMountVerifyingTakeover", () => {
  it("stays in-place under the threshold", () => {
    expect(shouldMountVerifyingTakeover(0)).toBe(false);
    expect(shouldMountVerifyingTakeover(VERIFYING_TAKEOVER_MS - 1)).toBe(false);
  });

  it("mounts the takeover at and over the threshold", () => {
    expect(shouldMountVerifyingTakeover(VERIFYING_TAKEOVER_MS)).toBe(true);
    expect(shouldMountVerifyingTakeover(VERIFYING_TAKEOVER_MS + 200)).toBe(true);
  });
});
