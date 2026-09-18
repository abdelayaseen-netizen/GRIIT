import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { tabBarContentPad, TAB_BAR_PILL_HEIGHT } from "@/lib/tab-bar-inset";
import { DS_V3 } from "@/lib/design-system";

describe("tab bar scroll inset", () => {
  it("clears the pill, dock, and home indicator", () => {
    expect(tabBarContentPad(34)).toBe(
      TAB_BAR_PILL_HEIGHT + 34 + DS_V3.space.gutter,
    );
    expect(tabBarContentPad(0)).toBe(
      TAB_BAR_PILL_HEIGHT + DS_V3.space.md + DS_V3.space.gutter,
    );
  });

  it("is used on Profile, Home, Discover, and Activity", () => {
    const files = [
      "../app/(tabs)/profile.tsx",
      "../components/LiveFeedSection.tsx",
      "../components/discover/DiscoverV3.tsx",
      "../components/activity/NotificationsTab.tsx",
      "../components/activity/LeaderboardTab.tsx",
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(__dirname, rel), "utf8");
      expect(src).toContain("tabBarContentPad");
    }
  });
});
