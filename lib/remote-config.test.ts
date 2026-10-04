import { describe, expect, it } from "vitest";
import { INVITE_BASE } from "@/lib/config";
import { parseMinSupportedBuild } from "@/lib/remote-config";

describe("invite base and remote config", () => {
  it("keeps INVITE_BASE off griit.app", () => {
    expect(INVITE_BASE ?? "").not.toContain("griit.app");
  });

  it("reads min_supported_build only when it is a positive number", () => {
    expect(parseMinSupportedBuild({ min_supported_build: 75 })).toBe(75);
    expect(parseMinSupportedBuild({ min_supported_build: "76" })).toBe(76);
    expect(parseMinSupportedBuild({ min_supported_build: 0 })).toBeNull();
    expect(parseMinSupportedBuild({})).toBeNull();
    expect(parseMinSupportedBuild(null)).toBeNull();
  });
});
