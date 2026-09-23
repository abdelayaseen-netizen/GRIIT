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
  accent: DS_V3.color.brand,
  accentLight: DS_V3.color.brandTint,
  accentTint: DS_V3.color.brandTint,
  border: DS_V3.color.border,
  success: DS_V3.color.brand,
  successLight: DS_V3.color.brandTint,
  warning: DS_V3.color.brand,
  warningLight: DS_V3.color.brandTint,
  danger: DS_V3.color.danger,
  dangerLight: DS_V3.color.brandTint,
  shadow: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  pill: DS_V3.color.surface,
  category: {
    fitness: DS_V3.color.brand,
    mind: DS_V3.color.brandTint,
    discipline: DS_V3.color.surface,
    faith: DS_V3.color.brandTint,
  },
  streak: {
    fire: DS_V3.color.brand,
    shield: DS_V3.color.brand,
    gold: DS_V3.color.brand,
    platinum: DS_V3.color.textSecondary,
  },
  milestone: {
    bronze: DS_V3.color.brandTint,
    silver: DS_V3.color.border,
    gold: DS_V3.color.brand,
    diamond: DS_V3.color.textSecondary,
  },
};
