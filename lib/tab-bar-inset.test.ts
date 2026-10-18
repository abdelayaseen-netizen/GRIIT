import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { tabBarContentPad, toastBottomOffset } from "@/lib/tab-bar-inset";

describe("toast offset", () => {
  it("sits 70 pt above the top edge of the tab bar", () => {
    // Build 92 01.4: pill 64 + dock max(inset, 12) + 70.
    expect(toastBottomOffset(34)).toBe(64 + 34 + 70);
    expect(toastBottomOffset(0)).toBe(64 + 12 + 70);
    expect(toastBottomOffset()).toBe(64 + 12 + 70);
  });
});

describe("tab bar scroll inset", () => {
  it("clears the pill, dock, and home indicator", () => {
    // 06.4: pill 64 + dock max(inset, 12) + 16 of air; the pill top sits at 64 + dock.
    expect(tabBarContentPad(34)).toBe(114);
    expect(tabBarContentPad(34)).toBeGreaterThan(64 + 34);
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
