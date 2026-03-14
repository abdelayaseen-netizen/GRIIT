/** GRIIT Part 3 design tokens — single source of truth for UI. Re-exports from design-system. */
import { DS_COLORS } from "@/lib/design-system";

export default {
  background: DS_COLORS.background,
  card: DS_COLORS.surface,
  text: {
    primary: DS_COLORS.challengeHeaderDark,
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
  pill: DS_COLORS.chipFill,

  category: {
    fitness: DS_COLORS.accent,
    mind: DS_COLORS.purpleStripe,
    discipline: DS_COLORS.black,
    faith: DS_COLORS.blueStripe,
  },

  streak: {
    fire: DS_COLORS.accent,
    shield: DS_COLORS.success,
    gold: DS_COLORS.milestoneGold,
    platinum: DS_COLORS.grayMedium,
  },

  milestone: {
    bronze: DS_COLORS.milestoneBronze,
    silver: DS_COLORS.milestoneSilver,
    gold: DS_COLORS.milestoneGold,
    diamond: DS_COLORS.milestoneDiamond,
  },
};
