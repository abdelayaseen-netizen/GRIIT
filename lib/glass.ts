/**
 * Build 92 · Part 0 · glass tokens and the on/off rule.
 * Port of design/handoff/b92/part0-liquid-glass/src/ds/glass/tokens.ts + useGlass.ts.
 * Pure values only, so vitest can read them. Components live in components/ds/glass/.
 *
 * Token mapping from the handoff: DS_COLORS_V2.brand -> DS_V3.color.brand (#DC5401, active tab icon),
 * DS_COLORS_V2.textPrimary -> DS_V3.color.textPrimary, primary fill -> DS_V3.color.primary (#BB471D).
 */
import { DS_V3 } from "@/lib/design-system";

export const GLASS = {
  /** Tab bar, floating action bar, toast. */
  chrome: {
    tint: "rgba(28,28,30,0.62)",
    blur: 24,
    saturation: 1.8,
    edgeTop: "rgba(255,255,255,0.28)",
    edgeInner: "rgba(255,255,255,0.10)",
    shadow: { y: 10, radius: 30, opacity: 0.45 },
  },
  /** Bottom sheets. */
  dense: {
    tint: "rgba(22,22,24,0.80)",
    blur: 40,
    saturation: 1.6,
    edgeTop: "rgba(255,255,255,0.22)",
    edgeInner: "rgba(255,255,255,0.08)",
    shadow: { y: -8, radius: 40, opacity: 0.55 },
  },
  /** Top bars. */
  thin: {
    tint: "rgba(28,28,30,0.50)",
    blur: 18,
    saturation: 1.8,
    edgeBottom: "rgba(255,255,255,0.10)",
  },
} as const;

export type GlassKind = keyof typeof GLASS;

/** iOS < 26, Reduce Transparency, or the flag off: every glass surface is this. */
export const GLASS_FALLBACK = { fill: "#1A1A1A", hairline: "#2A2A2A", hairlineWidth: 1 } as const;

export const GLASS_STATE = {
  selected: "rgba(255,255,255,0.14)",
  pressed: "rgba(255,255,255,0.22)",
  pressedScale: 0.98,
  disabledOpacity: 0.38,
  secondaryFill: "rgba(255,255,255,0.08)",
  rowDivider: "rgba(255,255,255,0.08)",
  grabber: "rgba(255,255,255,0.3)",
  sheetDim: "rgba(0,0,0,0.35)",
} as const;

/** Orange on glass: the active tab icon only. Labels on glass stay Text 1. */
export const GLASS_ACCENT = {
  activeTabIcon: DS_V3.color.brand,
  activeTabLabel: DS_V3.color.textPrimary,
} as const;

export const GLASS_RADIUS = { bar: 999, sheetTop: 32, toast: 22, actionBar: 32, rowIcon: 14 } as const;
/** Horizontal inset of floating chrome. */
export const GLASS_INSET = { se: 12, regular: 21 } as const;
export const SE_WIDTH = 375;

export const TOAST_LIFE_MS = 4000;
export const TOAST_MAX_LINES = 3;
/** Toasts sit this far above the top edge of the tab bar. */
export const TOAST_ABOVE_TAB_BAR = 70;
/** Lists under a floating action bar get this much bottom inset. */
export const ACTION_BAR_CONTENT_INSET = 90;

export function glassInset(width: number): number {
  return width <= SE_WIDTH ? GLASS_INSET.se : GLASS_INSET.regular;
}

/**
 * Glass is on only when FLAGS.LIQUID_GLASS is on, on iOS 26 or later, with Reduce
 * Transparency off. Everything else gets GLASS_FALLBACK.
 */
export function glassEnabled(input: {
  flag: boolean;
  os: string;
  osVersion: string | number;
  reduceTransparency: boolean;
}): boolean {
  if (!input.flag) return false;
  if (input.os !== "ios") return false;
  const major = parseInt(String(input.osVersion), 10);
  if (!Number.isFinite(major) || major < 26) return false;
  return !input.reduceTransparency;
}

/** Top bar: transparent at scroll 0, fully glass (or fallback) by 8 pt. */
export const TOP_BAR_GLASS_IN_PT = 8;
export function topBarGlassOpacity(scrollY: number): number {
  if (!Number.isFinite(scrollY) || scrollY <= 0) return 0;
  return Math.min(1, scrollY / TOP_BAR_GLASS_IN_PT);
}
