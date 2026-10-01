import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { tabBarContentPad } from "@/lib/tab-bar-inset";

describe("tab bar scroll inset", () => {
  it("clears the pill, dock, and home indicator", () => {
    expect(tabBarContentPad(34)).toBe(96);
    expect(tabBarContentPad(0)).toBe(96);
    expect(tabBarContentPad()).toBe(96);
  });

  it("is used on Profile, Home, Discover, and Activity", () => {
    const files = [
      "../app/(tabs)/profile.tsx",
      "../app/(tabs)/index.tsx",
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

  it("fills canvas under the pill so scroll cards cannot peek through", () => {
    const src = readFileSync(resolve(__dirname, "../components/ds/TabBar.tsx"), "utf8");
    expect(src).toContain("styles.under");
    expect(src).toContain("backgroundColor: DS_V3.color.canvas");
  });
});
