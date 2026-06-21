/**
 * OnboardingFlowV2 token map.
 *
 * Translates the onboarding mockup's visual language to the app design system.
 * Every value resolves to a DS_COLORS_V2 nested path / DS token — NO raw hex
 * lives here or in any V2 screen. The mockup's vivid orange (#DC5401) maps to
 * the AA-safe `brand.primary` (#BB471D, 5.2:1 on white).
 */
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2, DS_TYPE } from "@/lib/design-system";

export const OBV2_COLOR = {
  /** Phone screen background (warm near-white). */
  screen: DS_COLORS_V2.surface.canvas,
  card: DS_COLORS_V2.surface.card,
  /** Primary ink. */
  ink: DS_COLORS_V2.text.primary,
  /** Secondary / subtitle ink. */
  ink2: DS_COLORS_V2.text.secondary,
  /** Tertiary / legal / placeholder ink. */
  ink3: DS_COLORS_V2.text.tertiary,
  /** Brand orange (fills, CTAs). */
  orange: DS_COLORS_V2.brand.primary,
  /** Orange used as text/icon on light surfaces. */
  orangeInk: DS_COLORS_V2.brand.primary,
  orangeHover: DS_COLORS_V2.brand.primaryHover,
  /** Peach tint (selected chips, banners, icon wells). */
  peach: DS_COLORS_V2.brand.primarySoft,
  /** Hairline dividers / unselected borders. */
  hair: DS_COLORS_V2.surface.divider,
  /** Near-black button (Apple / dark CTA). */
  blackBtn: DS_COLORS_V2.surface.heroDark,
  onDark: DS_COLORS_V2.text.onDark,
  white: DS_COLORS_V2.surface.card,
  /** Neutral chip / segmented track. */
  track: DS_COLORS_V2.surface.cardChipNeutral,
  /** Avatar placeholder neutral. */
  avatar: DS_COLORS_V2.surface.divider,
  /** Progress-bar empty segment. */
  progressEmpty: DS_COLORS_V2.surface.divider,
  /** Dark photo placeholder surface (proof / featured cards). */
  photoDark: DS_COLORS_V2.surface.heroDark,
  /** Translucent chip backdrop on a photo. */
  chipOnPhoto: DS_COLORS_V2.overlay.chipOnPhoto55,
  /** Text on a photo. */
  onPhoto: DS_COLORS_V2.overlay.textOnPhoto100,
  onPhotoDim: DS_COLORS_V2.overlay.textOnPhoto85,
} as const;

export const OBV2_RADIUS = {
  card: DS_RADIUS_V2.xl,   // 18 — mockup 22, mapped to nearest token
  button: DS_RADIUS_V2.lg, // 14 — mockup 16
  sel: DS_RADIUS_V2.xl,    // 18
  chip: DS_RADIUS_V2.full, // pill
  icon: DS_RADIUS_V2.md,   // 10
} as const;

export const OBV2_SPACE = DS_SPACING_V2;
export const OBV2_TYPE = DS_TYPE;
