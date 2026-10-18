import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FLAGS } from "@/lib/feature-flags";
import {
  GLASS,
  GLASS_FALLBACK,
  GLASS_STATE,
  TOAST_LIFE_MS,
  TOAST_MAX_LINES,
  glassEnabled,
  topBarGlassOpacity,
} from "@/lib/glass";

// Build 92 chunk 01.1: the glass material is an upgrade behind a flag. The solid
// fallback is what ships, and it is also what iOS < 26 and Reduce Transparency get.
describe("glass material switch", () => {
  it("ships off", () => {
    expect(FLAGS.LIQUID_GLASS).toBe(false);
  });

  it("is on only with the flag, iOS 26 or later, and Reduce Transparency off", () => {
    const base = { flag: true, os: "ios" as const, osVersion: "26.0", reduceTransparency: false };
    expect(glassEnabled(base)).toBe(true);
    expect(glassEnabled({ ...base, flag: false })).toBe(false);
    expect(glassEnabled({ ...base, osVersion: "18.6" })).toBe(false);
    expect(glassEnabled({ ...base, osVersion: 26 })).toBe(true);
    expect(glassEnabled({ ...base, reduceTransparency: true })).toBe(false);
    expect(glassEnabled({ ...base, os: "android" })).toBe(false);
  });

  it("fallback is #1A1A1A with a 1 px #2A2A2A hairline", () => {
    expect(GLASS_FALLBACK).toEqual({ fill: "#1A1A1A", hairline: "#2A2A2A", hairlineWidth: 1 });
  });

  it("keeps the Part 0 tints and states", () => {
    expect(GLASS.chrome.tint).toBe("rgba(28,28,30,0.62)");
    expect(GLASS.dense.tint).toBe("rgba(22,22,24,0.80)");
    expect(GLASS.thin.tint).toBe("rgba(28,28,30,0.50)");
    expect(GLASS_STATE.selected).toBe("rgba(255,255,255,0.14)");
    expect(GLASS_STATE.pressed).toBe("rgba(255,255,255,0.22)");
    expect(GLASS_STATE.pressedScale).toBe(0.98);
    expect(GLASS_STATE.disabledOpacity).toBe(0.38);
    expect(GLASS_STATE.sheetDim).toBe("rgba(0,0,0,0.35)");
  });
});

describe("top bar", () => {
  it("is transparent at scroll 0 and fully in by 8 pt", () => {
    expect(topBarGlassOpacity(0)).toBe(0);
    expect(topBarGlassOpacity(4)).toBe(0.5);
    expect(topBarGlassOpacity(8)).toBe(1);
    expect(topBarGlassOpacity(300)).toBe(1);
    expect(topBarGlassOpacity(-20)).toBe(0);
  });
});

describe("toast", () => {
  it("lasts 4 s and wraps to 3 lines", () => {
    expect(TOAST_LIFE_MS).toBe(4000);
    expect(TOAST_MAX_LINES).toBe(3);
  });

  it("is one system on a glass surface, announced to VoiceOver", () => {
    const src = readFileSync(resolve(__dirname, "../components/task-v2/TaskCompleteToast.tsx"), "utf8");
    expect(src).toContain("GlassSurface");
    expect(src).toContain("announceForAccessibility");
    expect(src).toContain('accessibilityRole="alert"');
    expect(src).toContain("toastBottomOffset(");
    expect(src).toContain("TOAST_LIFE_MS");
    expect(src).toContain("openStickerCarousel");
  });
});

describe("root stack headers", () => {
  it("never shows a native header with a route name", () => {
    // Build 91 phone test: /profile/posts was not registered in the root Stack, so the
    // native header painted "profile/posts" over the app's own header for a frame.
    const src = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    const stack = src.match(/<Stack screenOptions=\{\{([^}]*)\}\}>/);
    expect(stack).not.toBeNull();
    expect(stack?.[1]).toContain("headerShown: false");
  });

  it("Posts uses the glass top bar with a human title", () => {
    // Build 92 07.5: the list and its glass bar moved into PostViewer; the title is "Posts" or the challenge.
    const src = readFileSync(resolve(__dirname, "../components/profile/PostViewer.tsx"), "utf8");
    expect(src).toContain("GlassTopBar");
    const screen = readFileSync(resolve(__dirname, "../app/profile/posts.tsx"), "utf8");
    expect(screen).toContain("postViewerTitle(");
  });
});

describe("tab bar", () => {
  it("has 5 tabs in order Home, Discover, Create, Activity, Profile", () => {
    const src = readFileSync(resolve(__dirname, "../components/ds/TabBar.tsx"), "utf8");
    const labels = Array.from(src.matchAll(/label: "([A-Za-z]+)"/g)).map((m) => m[1]);
    expect(labels).toEqual(["Home", "Discover", "Create", "Activity", "Profile"]);
    expect(src).toContain("GLASS_FALLBACK");
    expect(src).toContain("CirclePlus");
    expect(src).toContain("Flame");
  });
});
