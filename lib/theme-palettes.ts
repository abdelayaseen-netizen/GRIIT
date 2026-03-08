/**
 * Light and dark color palettes for ThemeContext.
 * Shape matches @/constants/colors so components can swap to useTheme().colors.
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
  shadow: string;
  shadowMedium: string;
  pill: string;
  category: { fitness: string; mind: string; discipline: string; faith: string };
  streak: { fire: string; shield: string; gold: string; platinum: string };
  milestone: { bronze: string; silver: string; gold: string; diamond: string };
};

export const LIGHT_THEME: ThemeColors = {
  background: "#F7F6F3",
  card: "#FFFFFF",
  text: {
    primary: "#111111",
    secondary: "#5A5A5A",
    tertiary: "#8E8E8E",
    muted: "#B5B5B5",
  },
  accent: "#E87D4F",
  accentLight: "#FFF5F0",
  accentTint: "#FFF9F6",
  border: "#E8E6E1",
  success: "#2E7D4A",
  successLight: "#E8F5E9",
  warning: "#E87D4F",
  warningLight: "#FFF5F0",
  shadow: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  pill: "#F0EEEB",
  category: {
    fitness: "#E8613C",
    mind: "#7C6BC4",
    discipline: "#1A1A1A",
    faith: "#2563EB",
  },
  streak: {
    fire: "#FF6B35",
    shield: "#2E7D4A",
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
    primary: "#F5F5F5",
    secondary: "#A0A0A0",
    tertiary: "#737373",
    muted: "#525252",
  },
  accent: "#E87D4F",
  accentLight: "rgba(232, 125, 79, 0.15)",
  accentTint: "rgba(232, 125, 79, 0.08)",
  border: "#2A2A2A",
  success: "#22C55E",
  successLight: "rgba(34, 197, 94, 0.15)",
  warning: "#F97316",
  warningLight: "rgba(249, 115, 22, 0.15)",
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  pill: "#262626",
  category: {
    fitness: "#E8613C",
    mind: "#8B7CD4",
    discipline: "#E5E5E5",
    faith: "#3B82F6",
  },
  streak: {
    fire: "#FF6B35",
    shield: "#22C55E",
    gold: "#EAB308",
    platinum: "#71717A",
  },
  milestone: {
    bronze: "#CD7F32",
    silver: "#A8A8A8",
    gold: "#EAB308",
    diamond: "#67E8F1",
  },
};
