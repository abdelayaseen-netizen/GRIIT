/**
 * Light theme only. Used by ThemeContext. No dark mode.
 * All colors from design-system so no raw hex remains here.
 */
import { DS_V3 } from "@/lib/design-system";

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
  background: DS_V3.color.canvas,
  card: DS_V3.color.surface,
  text: {
    primary: DS_V3.color.textPrimary,
    secondary: DS_V3.color.textSecondary,
    tertiary: DS_V3.color.textSecondary,
    muted: DS_V3.color.textSecondary,
  },
  accent: DS_V3.color.textPrimary,
  accentLight: DS_V3.color.surface,
  accentTint: DS_V3.color.surface,
  border: DS_V3.color.border,
  success: DS_V3.color.textPrimary,
  successLight: DS_V3.color.surface,
  warning: DS_V3.color.textPrimary,
  warningLight: DS_V3.color.surface,
  danger: DS_V3.color.danger,
  dangerLight: DS_V3.color.surface,
  shadow: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  pill: DS_V3.color.surface,
  category: {
    fitness: DS_V3.color.textPrimary,
    mind: DS_V3.color.surface,
    discipline: DS_V3.color.surface,
    faith: DS_V3.color.surface,
  },
  streak: {
    fire: DS_V3.color.textPrimary,
    shield: DS_V3.color.textPrimary,
    gold: DS_V3.color.textPrimary,
    platinum: DS_V3.color.textSecondary,
  },
  milestone: {
    bronze: DS_V3.color.surface,
    silver: DS_V3.color.border,
    gold: DS_V3.color.textPrimary,
    diamond: DS_V3.color.textSecondary,
  },
};
