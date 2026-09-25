/**
 * Profile token map — spec hex → DS_V3 paths.
 * Do not change brand.primary. Locked brand orange is #DC5401 (lib/design-system.ts).
 */
import { DS_V3, DS_RADIUS_V2, DS_SPACING_V2, DS_TYPE } from "@/lib/design-system";

export const PROFILE_V2_COLOR = {
  ink: DS_V3.color.canvas, // spec #0A0A0A
  inkHover: DS_V3.color.surface,
  body: DS_V3.color.textSecondary, // nearest to spec #4A4741
  muted: DS_V3.color.textSecondary,
  mutedLight: DS_V3.color.textSecondary, // spec #8A867E
  mutedOnDark: DS_V3.color.textSecondary, // nearest to spec #A8A49C
  orange: DS_V3.color.brand, // #DC5401 — locked, do not retarget
  orangePress: DS_V3.color.brandText,
  danger: DS_V3.color.danger, // nearest to spec #A4341A
  dangerWash: DS_V3.color.danger,
  success: DS_V3.color.brand, // nearest to spec #2E6B33
  canvas: DS_V3.color.canvas, // spec #F5F2EC → #F5F2ED
  surface: DS_V3.color.surface,
  sunken: DS_V3.color.surface,
  border: DS_V3.color.border,
  borderStrong: DS_V3.color.border,
  borderDashed: DS_V3.color.border,
  track: DS_V3.color.border,
  missed: DS_V3.color.border, // spec #C4BEB2 — nearest existing track
  todayBar: DS_V3.color.brandTint,
  chevron: DS_V3.color.border,
} as const;

export const PROFILE_V2_RADIUS = DS_RADIUS_V2;
export const PROFILE_V2_SPACE = DS_SPACING_V2;
export const PROFILE_V2_TYPE = DS_TYPE;
