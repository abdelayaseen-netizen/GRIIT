import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("edit profile DS_V3", () => {
  it("drops PROFILE_V2_COLOR and uses ControlPill for Change photo", () => {
    const src = readFileSync(resolve(__dirname, "../app/edit-profile.tsx"), "utf8");
    expect(src).not.toContain("PROFILE_V2_COLOR");
    expect(src).not.toContain("@/lib/profile-v2-tokens");
    expect(src).toContain('from "@/components/ds/ControlPill"');
    expect(src).toContain('label="Change photo"');
    expect(src).toContain("DS_V3.color.canvas");
    expect(src).toContain("DS_V3.radius.input");
  });
});
