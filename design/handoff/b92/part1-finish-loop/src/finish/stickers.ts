// 1.3 · sticker styles, themes and the Pro gate
export const STICKER_STYLES = [
  { key: 'photo', label: 'Photo', pro: false },        // proof photo; with no photo, a plain card (never stock)
  { key: 'week', label: 'Week strip', pro: false },
  { key: 'glow', label: 'Streak glow', pro: true, transparent: true },
  { key: 'ring', label: 'Progress ring', pro: true, transparent: true },
] as const;
export const STICKER_THEMES = ['ink', 'orange', 'white'] as const;
// Orange rule: ink → orange only on the flame and done checks; white → orange only on the flame;
// orange → orange ground, ink type, ink flame. Progress ring stroke is the type colour, never orange.
export const EXPORTS = { story: { w: 1080, h: 1920 }, sticker: { transparent: true } } as const;
export const verifiedMark = (source: 'camera' | 'strava' | 'self') => (source === 'self' ? 'Self-reported' : 'Verified');
export function onStyleTap(style: (typeof STICKER_STYLES)[number], isPro: boolean, openUpgrade: () => void) { if (style.pro && !isPro) { openUpgrade(); return false; } return true; }
// Toast "Share" (Part 0) and Day secured "Share" both open this carousel.
