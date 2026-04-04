import { StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system"

/**
 * Shared style objects for cards, buttons, section headers, and screen containers.
 * Use these across Home, Discover, Profile, Settings to reduce duplication.
 */
export const sharedStyles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.xl,
    ...DS_SHADOWS.card,
  },
  pillButton: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center" as const,
    ...DS_SHADOWS.button,
  },
  pillButtonText: {
    color: DS_COLORS.white,
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  sectionHeader: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  sectionHeaderSmall: {
    fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
    textTransform: "uppercase" as const,
    letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
});
