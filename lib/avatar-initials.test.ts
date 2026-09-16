import { describe, expect, it } from "vitest";
import { initialsFrom } from "@/lib/avatar-initials";
import { getDisplayInitials } from "@/lib/utils";

describe("initialsFrom", () => {
  it("uses letters from the display name", () => {
    expect(initialsFrom("Maya Chen")).toBe("MC");
    expect(initialsFrom("Maya")).toBe("M");
  });

  it("falls back to the person glyph for an emoji-only name", () => {
    expect(initialsFrom("🔥")).toBeNull();
    expect(initialsFrom("🔥💪")).toBeNull();
    expect(getDisplayInitials("🔥")).toBe("");
  });
});
