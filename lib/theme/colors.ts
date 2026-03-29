/**
 * Single source of truth for app colors. Match Rork reference.
 * Re-exports from design-system so no raw hex remains here.
 */
import { DS_COLORS } from "@/lib/design-system";

export const colors = {
  bg: DS_COLORS.background,
  surface: DS_COLORS.surface,
  surfaceMuted: DS_COLORS.surfaceMuted,
  text: DS_COLORS.textPrimary,
  textMuted: DS_COLORS.textSecondary,
  textSubtle: DS_COLORS.textMuted,
  border: DS_COLORS.border,
  borderStrong: DS_COLORS.textPrimary,
  shadow: "rgba(0,0,0,0.10)",

  accent: DS_COLORS.accent,
  accentSoft: DS_COLORS.accentSoft,
  success: DS_COLORS.success,
  successSoft: DS_COLORS.successSoft,
  danger: DS_COLORS.danger,
  dangerSoft: DS_COLORS.dangerSoft,

  blackBtn: DS_COLORS.black,
  white: DS_COLORS.white,

  // Legacy compatibility (map to new names where used)
  background: DS_COLORS.background,
  card: DS_COLORS.surface,
  accentLight: DS_COLORS.accentSoft,
} as const;

export type Colors = typeof colors;
