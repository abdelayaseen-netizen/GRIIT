/**
 * OnboardingFlowV2 token map.
 *
 * Translates the onboarding mockup's visual language to the app design system.
 * Every value resolves to a DS_V3 token — NO raw hex
 * lives here or in any V2 screen. The mockup's vivid orange maps to
 * `brand.primary` (locked). Use `accentAccessible` only for
 * dense orange-on-white text that needs AA.
 */
import { DS_V3, DS_RADIUS_V2, DS_SPACING_V2, DS_TYPE } from "@/lib/design-system";

export const OBV2_COLOR = {
  /** Phone screen background (warm near-white). */
  screen: DS_V3.color.canvas,
  card: DS_V3.color.surface,
  /** Primary ink. */
  ink: DS_V3.color.textPrimary,
  /** Secondary / subtitle ink. */
  ink2: DS_V3.color.textSecondary,
  /** Tertiary / legal / placeholder ink. */
  ink3: DS_V3.color.textSecondary,
  /** Brand orange (fills, CTAs). */
  orange: DS_V3.color.brand,
  /** Orange used as text/icon on light surfaces. */
  orangeInk: DS_V3.color.brand,
  orangeHover: DS_V3.color.brandText,
  /** Peach tint (selected chips, banners, icon wells). */
  peach: DS_V3.color.brandTint,
  /** Hairline dividers / unselected borders. */
  hair: DS_V3.color.border,
  sunken: DS_V3.color.surface,
  borderStrong: DS_V3.color.border,
  borderDashed: DS_V3.color.border,
  mutedWarm: DS_V3.color.textSecondary,
  /** Near-black button (Apple / dark CTA). */
  blackBtn: DS_V3.color.surface,
  onDark: DS_V3.color.textPrimary,
  white: DS_V3.color.surface,
  /** Neutral chip / segmented track. */
  track: DS_V3.color.border,
  /** Avatar placeholder neutral. */
  avatar: DS_V3.color.border,
  /** Progress-bar empty segment. */
  progressEmpty: DS_V3.color.border,
  /** Dark photo placeholder surface (proof / featured cards). */
  photoDark: DS_V3.color.surface,
  /** Translucent chip backdrop on a photo. */
  chipOnPhoto: DS_V3.color.surface,
  /** Text on a photo. */
  onPhoto: DS_V3.color.textPrimary,
  onPhotoDim: DS_V3.color.textSecondary,
} as const;

export const OBV2_RADIUS = {
  card: DS_RADIUS_V2.xl,      // 18
  button: DS_RADIUS_V2.button, // 16 — v4 CTA
  sel: DS_RADIUS_V2.xl,       // 18
  hero: DS_RADIUS_V2.hero,    // 24
  chip: DS_RADIUS_V2.full,    // pill
  icon: DS_RADIUS_V2.md,      // 10
} as const;

export const OBV2_SPACE = DS_SPACING_V2;
export const OBV2_TYPE = DS_TYPE;
