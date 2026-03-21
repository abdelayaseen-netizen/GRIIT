import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

/** GRIIT Design DNA — cream bg, charcoal text, burnt orange accent, dark CTA. Colors from DS only. */
export const ONBOARDING_COLORS = {
  background: DS_COLORS.ONBOARDING_BG_PAGE,
  backgroundSecondary: DS_COLORS.ONBOARDING_BG_SECONDARY,
  backgroundTertiary: DS_COLORS.WHITE,
  surface: DS_COLORS.WHITE,
  surfaceElevated: DS_COLORS.WHITE,

  accent: DS_COLORS.PRESSED_ORANGE,
  accentLight: DS_COLORS.ONBOARDING_ACCENT_LIGHT,
  accentMuted: "rgba(210, 115, 74, 0.15)",
  accentBorder: "rgba(210, 115, 74, 0.3)",

  textPrimary: DS_COLORS.CHALLENGE_HEADER_DARK,
  textSecondary: DS_COLORS.ONBOARDING_TEXT_SECONDARY,
  textTertiary: DS_COLORS.ONBOARDING_TEXT_TERTIARY,
  textOnAccent: DS_COLORS.WHITE,

  success: DS_COLORS.ONBOARDING_SUCCESS,
  successMuted: "rgba(45, 122, 79, 0.15)",
  warning: DS_COLORS.ONBOARDING_WARNING,

  border: DS_COLORS.ONBOARDING_BORDER,
  borderActive: DS_COLORS.CHALLENGE_HEADER_DARK,
  commitmentButtonBg: DS_COLORS.ONBOARDING_COMMITMENT_BTN,

  DISABLED_BG: DS_COLORS.ONBOARDING_BORDER,
  WHITE: DS_COLORS.WHITE,
} as const;

export const ONBOARDING_TYPOGRAPHY = {
  heroSize: 36,
  heroLineHeight: 40,
  heroWeight: "800" as const,
  heroLetterSpacing: -1.5,

  headingSize: 28,
  headingLineHeight: 34,
  headingWeight: "700" as const,
  headingLetterSpacing: -0.8,

  subheadingSize: 18,
  subheadingLineHeight: 26,
  subheadingWeight: "600" as const,

  bodySize: 16,
  bodyLineHeight: 24,
  bodyWeight: "400" as const,

  smallSize: 14,
  smallLineHeight: 20,

  captionSize: 12,
  captionLineHeight: 16,

  fontFamily: "System",
} as const;

export const ONBOARDING_SPACING = {
  screenPadding: DS_SPACING.XL,
  sectionGap: DS_SPACING.XXL,
  cardGap: DS_SPACING.MD,
  elementGap: DS_SPACING.BASE,
  buttonHeight: DS_MEASURES.CTA_HEIGHT,
  buttonRadius: DS_RADIUS.card,
  cardRadius: DS_RADIUS.card,
  chipRadius: DS_RADIUS.input,
  progressDotSize: DS_SPACING.SM,
  progressDotGap: DS_SPACING.SM,
} as const;

export const GOAL_OPTIONS = [
  {
    id: "physical_toughness" as const,
    emoji: "💪",
    title: "Physical toughness",
    subtitle: "Push your body to the limit",
  },
  {
    id: "mental_discipline" as const,
    emoji: "🧠",
    title: "Mental discipline",
    subtitle: "Build an unbreakable mind",
  },
  {
    id: "daily_habits" as const,
    emoji: "⚡",
    title: "Daily habits",
    subtitle: "Stack habits that stick",
  },
  {
    id: "reading_learning" as const,
    emoji: "📖",
    title: "Reading & learning",
    subtitle: "Feed your mind every day",
  },
  {
    id: "cold_exposure" as const,
    emoji: "🧊",
    title: "Cold exposure",
    subtitle: "Embrace the discomfort",
  },
  {
    id: "no_excuses" as const,
    emoji: "🔥",
    title: "No excuses",
    subtitle: "All of the above",
  },
] as const;

export const INTENSITY_OPTIONS = [
  {
    id: "beginner" as const,
    title: "Building up",
    subtitle: "I'm starting my discipline journey",
    emoji: "🌱",
    description: "2-3 tasks per day, forgiving streak rules",
  },
  {
    id: "intermediate" as const,
    title: "I push myself",
    subtitle: "I already have some discipline",
    emoji: "⚡",
    description: "4-5 tasks per day, standard challenges",
  },
  {
    id: "extreme" as const,
    title: "No mercy",
    subtitle: "I want the hardest challenges",
    emoji: "🔥",
    description: "75 Hard, extreme protocols, zero rest days",
  },
] as const;
