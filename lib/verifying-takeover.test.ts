import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
    expect(VERIFYING_TAKEOVER_MS).toBe(800);
    const server = readFileSync(resolve(__dirname, "../backend/trpc/routes/checkins.ts"), "utf8");
    expect(server).toContain("[checkins.complete] timing");
    expect(server).toContain("[secure_day] rpc timing");
    const client = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(client).toContain("[finishSubmit] timing");
    expect(client).toContain("VERIFYING_TAKEOVER_MS");
  });
});
