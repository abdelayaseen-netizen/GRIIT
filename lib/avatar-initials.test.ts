import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { avatarTint, initialsFrom } from "@/lib/avatar-initials";
import { DS_V3 } from "@/lib/design-system";
import { getDisplayInitials } from "@/lib/utils";

describe("initialsFrom", () => {
  it("uses letters from the display name", () => {
    expect(initialsFrom("Maya Chen")).toBe("MC");
    expect(initialsFrom("Maya")).toBe("M");
    expect(getDisplayInitials("Maya Chen")).toBe("MC");
    expect(getDisplayInitials("Parker The Smith")).toBe(initialsFrom("Parker The Smith"));
  });

  it("never blanks — emoji-only and missing names use a middle dot", () => {
    expect(initialsFrom("🔥")).toBe("·");
    expect(initialsFrom("🔥💪")).toBe("·");
    expect(initialsFrom(null, null)).toBe("·");
    expect(initialsFrom("user_abc")).toBe("·");
    expect(getDisplayInitials("🔥")).toBe("·");
    expect(initialsFrom("Maya Chen", "maya")).toBe("MC");
    expect(initialsFrom(null, "maya")).toBe("M");
  });

  it("tints from userId and never uses a person glyph in ds/Avatar", () => {
    expect(avatarTint(null)).toEqual({ bg: DS_V3.color.border, fg: DS_V3.color.textPrimary });
    const a = avatarTint("user-a");
    expect(avatarTint("user-a")).toEqual(a);
    expect([DS_V3.color.brandTint, DS_V3.color.border]).toContain(a.bg);
    expect([DS_V3.color.brandText, DS_V3.color.textPrimary]).toContain(a.fg);
    const avatar = readFileSync(resolve(__dirname, "../components/ds/Avatar.tsx"), "utf8");
    expect(avatar).not.toMatch(/\bUser\b/);
    expect(avatar).toContain("avatarTint");
    const profile = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    expect(profile).toContain("size={80}");
  });

  it("uses ds/Avatar and initialsFrom on Edit profile", () => {
    const edit = readFileSync(resolve(__dirname, "../app/edit-profile.tsx"), "utf8");
    expect(edit).toContain('from "@/components/ds/Avatar"');
    expect(edit).not.toContain('from "@/components/shared/Avatar"');
    const utils = readFileSync(resolve(__dirname, "../lib/utils.ts"), "utf8");
    expect(utils).toContain("initialsFrom(displayName)");
  });

  it("follow-list uses DS_V3 canvas and Avatar, no DS_COLORS", () => {
    const src = readFileSync(resolve(__dirname, "../app/follow-list.tsx"), "utf8");
    expect(src).not.toMatch(/\bDS_COLORS\b/);
    expect(src).toContain("DS_V3.color.canvas");
    expect(src).toContain('from "@/components/ds/Avatar"');
    expect(src).toContain("displayName={item.display_name}");
  });
});
