/**
 * Light and dark color palettes for ThemeContext.
 * Light theme matches reference: #FAFAF8 background, #E8734A accent, #2D8B4E success, etc.
 */

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
  background: "#FAFAF8",
  card: "#FFFFFF",
  text: {
    primary: "#1A1A1A",
    secondary: "#6B7280",
    tertiary: "#6B7280",
    muted: "#9CA3AF",
  },
  accent: "#E8734A",
  accentLight: "#FFF5F0",
  accentTint: "#FFF5F0",
  border: "#F0EDE8",
  success: "#2D8B4E",
  successLight: "#F0FFF4",
  warning: "#D4A017",
  warningLight: "#FFFBEB",
  danger: "#E53E3E",
  dangerLight: "#FEF2F2",
  shadow: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  pill: "#F3F4F6",
  category: {
    fitness: "#E8734A",
    mind: "#7C6BC4",
    discipline: "#1A1A1A",
    faith: "#2563EB",
  },
  streak: {
    fire: "#E8734A",
    shield: "#2D8B4E",
    gold: "#D4A017",
    platinum: "#6B7280",
  },
  milestone: {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    diamond: "#B9F2FF",
  },
};

export const DARK_THEME: ThemeColors = {
  background: "#0A0A0A",
  card: "#1A1A1A",
  text: {
    primary: "#FFFFFF",
    secondary: "#A0A0A0",
    tertiary: "#737373",
    muted: "#525252",
  },
  accent: "#E8734A",
  accentLight: "rgba(232, 115, 74, 0.15)",
  accentTint: "rgba(232, 115, 74, 0.08)",
  border: "#2A2A2A",
  success: "#2D8B4E",
  successLight: "rgba(45, 139, 78, 0.15)",
  warning: "#D4A017",
  warningLight: "rgba(212, 160, 23, 0.15)",
  danger: "#E53E3E",
  dangerLight: "rgba(229, 62, 62, 0.15)",
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  pill: "#262626",
  category: {
    fitness: "#E8734A",
    mind: "#8B7CD4",
    discipline: "#E5E5E5",
    faith: "#3B82F6",
  },
  streak: {
    fire: "#E8734A",
    shield: "#2D8B4E",
    gold: "#D4A017",
    platinum: "#71717A",
  },
  milestone: {
    bronze: "#CD7F32",
    silver: "#A8A8A8",
    gold: "#EAB308",
    diamond: "#67E8F1",
  },
};
