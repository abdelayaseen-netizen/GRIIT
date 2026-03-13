/**
 * GRIIT Part 3 — Design tokens (single source of truth).
 * Use these across Home, Discover, Challenge Detail, Profile, Settings, and bottom nav.
 */

export const GRIIT_COLORS = {
  background: "#F9F6F1",
  cardBackground: "#FFFFFF",
  primaryAccent: "#E8733A",
  primaryAccentLight: "#FFF0E8",
  secondaryGreen: "#2E7D32",
  secondaryGreenLight: "#E8F5E9",
  textPrimary: "#1A1A2E",
  textSecondary: "#8A8A8A",
  textMuted: "#B0B0B0",
  warningAmber: "#F5A623",
  errorRed: "#D32F2F",
  borderLight: "#E0E0E0",
  white: "#FFFFFF",
  peachBackground: "#FFF0E8",
  peachBorder: "#E8733A",
  greenLightBg: "#E8F5E9",
  chipSelectedBg: "#1A1A2E",
  chipOutlineBorder: "#D0D0D0",
  overlayDark: "rgba(0,0,0,0.4)",
  overlayModal: "rgba(0,0,0,0.5)",
  challengeHeaderDark: "#1A1A2E",
  challengeHeaderGreen: "#1B5E20",
  alertRedBg: "#FDECEA",
  alertRedBorder: "#F8D7DA",
} as const;

export const GRIIT_SPACING = {
  screenPadding: 20,
  cardPadding: 18,
  sectionGap: 28,
  cardGap: 14,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const GRIIT_RADII = {
  card: 16,
  buttonPill: 28,
  chip: 20,
  input: 14,
  avatar: 999,
  modalCard: 20,
  contentOverlap: 24,
} as const;

export const GRIIT_TYPOGRAPHY = {
  logoSize: 32,
  logoLetterSpacing: 8,
  subtitleSize: 13,
  sectionHeader: 18,
  sectionHeaderSm: 12,
  sectionHeaderLetterSpacing: 1.5,
  cardTitle: 16,
  cardBody: 14,
  statNumber: 28,
  statLabel: 12,
  buttonText: 15,
  tabLabel: 10,
} as const;

/** Serif font for GRIIT logo and challenge names. Fallback to system serif. */
export const GRIIT_FONTS = {
  logoAndChallenge: "Georgia",
  body: undefined as string | undefined, // system default
} as const;

export const GRIIT_SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: "#E8733A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFocused: {
    shadowColor: "#E8733A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  centerButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;
