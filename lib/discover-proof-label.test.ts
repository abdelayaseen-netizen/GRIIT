import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { discoverProofLabel } from "./discover-proof-label";

describe("discoverProofLabel", () => {
  it("Camera for photo, Self-reported otherwise", () => {
    expect(discoverProofLabel({ proofType: "photo" })).toBe("Camera");
    expect(discoverProofLabel({ proofType: "self_reported", taskTypes: ["check_off"] })).toBe(
      "Self-reported",
    );
    expect(discoverProofLabel({ proofType: "location", taskTypes: ["check_off"] })).toBe(
      "Self-reported",
    );
  });

  it("never says text proof unless the task type is Text", () => {
    expect(discoverProofLabel({ proofType: "self_reported", taskTypes: ["check_off"] })).not.toBe(
      "text proof",
    );
    expect(discoverProofLabel({ proofType: "text", taskTypes: ["text"] })).toBe("text proof");
    expect(discoverProofLabel({ proofType: "self_reported", taskTypes: ["text"] })).toBe(
      "text proof",
    );
  });

  it("DiscoverV3 and CompactChallengeRow use the helper", () => {
    const v3 = readFileSync(resolve(__dirname, "../components/discover/DiscoverV3.tsx"), "utf8");
    const row = readFileSync(
      resolve(__dirname, "../components/challenges/CompactChallengeRow.tsx"),
      "utf8",
    );
    expect(v3).toContain("discoverProofLabel");
    expect(v3).not.toContain("text proof");
    expect(row).toContain("discoverProofLabel");
    expect(row).not.toMatch(/return "Text proof"/);
  });
});
