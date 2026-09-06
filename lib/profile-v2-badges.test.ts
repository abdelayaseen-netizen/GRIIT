import { describe, expect, it } from "vitest";
import { nextProfileV2Badge } from "@/lib/profile-v2-badges";

describe("nextProfileV2Badge", () => {
  it("uses the five Profile marks only — 3 / 7 / 14 / 30 / 100", () => {
    expect(nextProfileV2Badge({ bestStreak: 0, verifiedDays: 0 })?.name).toBe("3 days");
    expect(nextProfileV2Badge({ bestStreak: 3, verifiedDays: 3 })?.name).toBe("7 days");
    expect(nextProfileV2Badge({ bestStreak: 7, verifiedDays: 10 })?.name).toBe("14 days");
    expect(nextProfileV2Badge({ bestStreak: 14, verifiedDays: 20 })?.name).toBe("30 days");
    expect(nextProfileV2Badge({ bestStreak: 30, verifiedDays: 40 })?.name).toBe("100 verified");
    expect(nextProfileV2Badge({ bestStreak: 5, verifiedDays: 5 })?.need).toBe(7);
    expect(nextProfileV2Badge({ bestStreak: 100, verifiedDays: 100 })).toBeNull();
  });
});
