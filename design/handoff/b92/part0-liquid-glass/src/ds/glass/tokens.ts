// Build 92 · Part 0 · glass tokens. Extends DS_COLORS_V2; no raw hex outside this file.
import { DS_COLORS_V2 } from '../colors';

export const GLASS = {
  chrome: { tint: 'rgba(28,28,30,0.62)', blur: 24, saturation: 1.8, edgeTop: 'rgba(255,255,255,0.28)', edgeInner: 'rgba(255,255,255,0.10)', shadow: { y: 10, radius: 30, opacity: 0.45 } }, // tab bar, floating action bar, toast
  dense:  { tint: 'rgba(22,22,24,0.80)', blur: 40, saturation: 1.6, edgeTop: 'rgba(255,255,255,0.22)', edgeInner: 'rgba(255,255,255,0.08)', shadow: { y: -8, radius: 40, opacity: 0.55 } }, // bottom sheets
  thin:   { tint: 'rgba(28,28,30,0.50)', blur: 18, saturation: 1.8, edgeBottom: 'rgba(255,255,255,0.10)' }, // top bars
} as const;

export const GLASS_FALLBACK = { fill: '#1A1A1A', hairline: '#2A2A2A', hairlineWidth: 1 } as const; // iOS < 26 or Reduce Transparency

export const GLASS_STATE = {
  selected: 'rgba(255,255,255,0.14)',
  pressed: 'rgba(255,255,255,0.22)',
  pressedScale: 0.98,
  disabledOpacity: 0.38,
  secondaryFill: 'rgba(255,255,255,0.08)',
  sheetDim: 'rgba(0,0,0,0.35)',
} as const;

// Orange on glass: icon only (3:1 graphic). Labels on glass are always textPrimary.
export const GLASS_ACCENT = { activeTabIcon: DS_COLORS_V2.brand, activeTabLabel: DS_COLORS_V2.textPrimary } as const;

export const GLASS_RADIUS = { bar: 999, sheetTop: 32, toast: 22, actionBar: 32 } as const;
export const GLASS_INSET = { se: 12, regular: 21 } as const; // horizontal inset of floating chrome
