import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { initialsFrom } from "@/lib/avatar-initials";
import { getDisplayInitials } from "@/lib/utils";

describe("initialsFrom", () => {
  it("uses letters from the display name", () => {
    expect(initialsFrom("Maya Chen")).toBe("MC");
    expect(initialsFrom("Maya")).toBe("M");
    expect(getDisplayInitials("Maya Chen")).toBe("MC");
    expect(getDisplayInitials("Parker The Smith")).toBe(initialsFrom("Parker The Smith"));
  });

  it("falls back to the person glyph for an emoji-only name", () => {
    expect(initialsFrom("🔥")).toBeNull();
    expect(initialsFrom("🔥💪")).toBeNull();
    expect(getDisplayInitials("🔥")).toBe("");
  });

  it("uses ds/Avatar and initialsFrom on Edit profile", () => {
    const edit = readFileSync(resolve(__dirname, "../app/edit-profile.tsx"), "utf8");
    expect(edit).toContain('from "@/components/ds/Avatar"');
    expect(edit).not.toContain('from "@/components/shared/Avatar"');
    const utils = readFileSync(resolve(__dirname, "../lib/utils.ts"), "utf8");
    expect(utils).toContain("initialsFrom(displayName)");
  });
});
