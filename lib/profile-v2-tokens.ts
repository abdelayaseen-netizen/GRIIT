/**
 * Profile v2 token map — spec hex → existing DS_COLORS_V2 paths.
 * Do not change brand.primary. Locked brand orange is #DC5401 (lib/design-system.ts).
 */
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2, DS_TYPE } from "@/lib/design-system";

export const PROFILE_V2_COLOR = {
  ink: DS_COLORS_V2.surface.canvasDark, // spec #0A0A0A
  inkHover: DS_COLORS_V2.surface.heroDarkWarm,
  body: DS_COLORS_V2.text.secondary, // nearest to spec #4A4741
  muted: DS_COLORS_V2.text.secondary,
  mutedLight: DS_COLORS_V2.text.mutedWarm, // spec #8A867E
  mutedOnDark: DS_COLORS_V2.text.onDarkSecondary, // nearest to spec #A8A49C
  orange: DS_COLORS_V2.brand.primary, // #DC5401 — locked, do not retarget
  orangePress: DS_COLORS_V2.brand.primaryHover,
  danger: DS_COLORS_V2.semantic.danger, // nearest to spec #A4341A
  dangerWash: DS_COLORS_V2.semantic.dangerSoft,
  success: DS_COLORS_V2.semantic.success, // nearest to spec #2E6B33
  canvas: DS_COLORS_V2.surface.canvas, // spec #F5F2EC → #F5F2ED
  surface: DS_COLORS_V2.surface.card,
  sunken: DS_COLORS_V2.surface.sunken,
  border: DS_COLORS_V2.surface.borderWarm,
  borderStrong: DS_COLORS_V2.surface.borderStrong,
  borderDashed: DS_COLORS_V2.surface.borderDashed,
  track: DS_COLORS_V2.surface.track,
  missed: DS_COLORS_V2.surface.track, // spec #C4BEB2 — nearest existing track
  todayBar: DS_COLORS_V2.brand.primarySoft,
  chevron: DS_COLORS_V2.surface.borderStrong,
} as const;

export const PROFILE_V2_RADIUS = DS_RADIUS_V2;
export const PROFILE_V2_SPACE = DS_SPACING_V2;
export const PROFILE_V2_TYPE = DS_TYPE;
