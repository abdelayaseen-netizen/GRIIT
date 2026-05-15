/**
 * Light theme only. Used by ThemeContext. No dark mode.
 * All colors from design-system so no raw hex remains here.
 */
import { DS_COLORS } from "@/lib/design-system";

export type ThemeColors = {
  background: string;
  card: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  accent: string;
  accentLight: string;
  accentTint: string;
  border: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  shadow: string;
  shadowMedium: string;
  pill: string;
  category: { fitness: string; mind: string; discipline: string; faith: string };
  streak: { fire: string; shield: string; gold: string; platinum: string };
  milestone: { bronze: string; silver: string; gold: string; diamond: string };
};

export const LIGHT_THEME: ThemeColors = {
  background: DS_COLORS.background,
  card: DS_COLORS.surface,
  text: {
    primary: DS_COLORS.textPrimary,
    secondary: DS_COLORS.textSecondary,
    tertiary: DS_COLORS.textSecondary,
    muted: DS_COLORS.textMuted,
  },
  accent: DS_COLORS.accent,
  accentLight: DS_COLORS.accentSoft,
  accentTint: DS_COLORS.accentSoft,
  border: DS_COLORS.border,
  success: DS_COLORS.success,
  successLight: DS_COLORS.successSoft,
  warning: DS_COLORS.warning,
  warningLight: DS_COLORS.warningSoft,
  danger: DS_COLORS.danger,
  dangerLight: DS_COLORS.dangerSoft,
  shadow: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  pill: DS_COLORS.surfaceWarm,
  category: {
    fitness: DS_COLORS.accent,
    mind: DS_COLORS.purpleStripe,
    discipline: DS_COLORS.challengeHeaderDark,
    faith: DS_COLORS.blueStripe,
  },
  streak: {
    fire: DS_COLORS.accent,
    shield: DS_COLORS.success,
    gold: DS_COLORS.warning,
    platinum: DS_COLORS.textMuted,
  },
  milestone: {
    bronze: DS_COLORS.milestoneBronze,
    silver: DS_COLORS.milestoneSilver,
    gold: DS_COLORS.milestoneGold,
    diamond: DS_COLORS.milestoneDiamond,
  },
};
