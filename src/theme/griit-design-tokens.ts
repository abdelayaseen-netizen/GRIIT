/**
 * GRIIT design tokens — aligned with lib/design-system.ts.
 * Use across Home, Discover, Challenge Detail, Profile, Settings, and bottom nav.
 */

import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system";

export const GRIIT_COLORS = {
  background: DS_COLORS.background,
  cardBackground: DS_COLORS.surface,
  primaryAccent: DS_COLORS.accent,
  primaryAccentLight: DS_COLORS.accentSoft,
  secondaryGreen: DS_COLORS.success,
  secondaryGreenLight: DS_COLORS.successSoft,
  textPrimary: DS_COLORS.textPrimary,
  textSecondary: DS_COLORS.textSecondary,
  textMuted: DS_COLORS.textMuted,
  warningAmber: DS_COLORS.warning,
  errorRed: DS_COLORS.danger,
  borderLight: DS_COLORS.border,
  white: DS_COLORS.white,
  peachBackground: DS_COLORS.accentSoft,
  peachBorder: DS_COLORS.accent,
  greenLightBg: DS_COLORS.successSoft,
  chipSelectedBg: DS_COLORS.black,
  chipOutlineBorder: DS_COLORS.border,
  overlayDark: "rgba(0,0,0,0.4)",
  overlayModal: "rgba(0,0,0,0.5)",
  challengeHeaderDark: DS_COLORS.challengeHeaderDark,
  challengeHeaderGreen: DS_COLORS.difficultyEasyHeader,
  alertRedBg: DS_COLORS.dangerSoft,
  alertRedBorder: DS_COLORS.alertRedBorder,
} as const;

export const GRIIT_SPACING = {
  screenPadding: DS_SPACING.screenHorizontalAlt,
  cardPadding: DS_SPACING.cardPadding,
  sectionGap: DS_SPACING.sectionGap,
  cardGap: DS_SPACING.cardGap,
  xs: DS_SPACING.xs,
  sm: DS_SPACING.sm,
  md: DS_SPACING.md,
  lg: DS_SPACING.lg,
  xl: DS_SPACING.xxl,
} as const;

export const GRIIT_RADII = {
  card: DS_RADIUS.cardAlt,
  buttonPill: DS_RADIUS.buttonPill,
  chip: 20,
  input: DS_RADIUS.input,
  avatar: 999,
  modalCard: DS_RADIUS.cardAlt,
  contentOverlap: DS_RADIUS.card,
} as const;

export const GRIIT_TYPOGRAPHY = {
  logoSize: DS_TYPOGRAPHY.wordmark.fontSize,
  logoLetterSpacing: DS_TYPOGRAPHY.wordmark.letterSpacing,
  subtitleSize: DS_TYPOGRAPHY.wordmarkSubtitle.fontSize,
  sectionHeader: DS_TYPOGRAPHY.sectionTitle.fontSize,
  sectionHeaderSm: 12,
  sectionHeaderLetterSpacing: 1.5,
  cardTitle: DS_TYPOGRAPHY.cardTitle.fontSize,
  cardBody: DS_TYPOGRAPHY.secondary.fontSize,
  statNumber: DS_TYPOGRAPHY.statValue.fontSize,
  statLabel: DS_TYPOGRAPHY.statLabel.fontSize,
  buttonText: DS_TYPOGRAPHY.button.fontSize,
  tabLabel: DS_TYPOGRAPHY.tabLabel.fontSize,
} as const;

/** System font for wordmark; avoid awkward serif. */
export const GRIIT_FONTS = {
  logoAndChallenge: undefined as string | undefined,
  body: undefined as string | undefined,
} as const;

export const GRIIT_SHADOWS = {
  card: DS_SHADOWS.card,
  button: DS_SHADOWS.button,
  inputFocused: {
    shadowColor: DS_COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  centerButton: DS_SHADOWS.centerButton,
} as const;
