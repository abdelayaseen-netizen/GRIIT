import { StyleSheet } from "react-native";
import { GRIIT_COLORS, GRIIT_RADII, GRIIT_TYPOGRAPHY, GRIIT_SHADOWS } from "./griit-design-tokens";

/**
 * Shared style objects for cards, buttons, section headers, and screen containers.
 * Use these across Home, Discover, Profile, Settings to reduce duplication.
 */
export const sharedStyles = StyleSheet.create({
  card: {
    backgroundColor: GRIIT_COLORS.cardBackground,
    borderRadius: GRIIT_RADII.card,
    padding: 18,
    ...GRIIT_SHADOWS.card,
  },
  pillButton: {
    backgroundColor: GRIIT_COLORS.primaryAccent,
    borderRadius: GRIIT_RADII.buttonPill,
    paddingVertical: 16,
    alignItems: "center" as const,
    ...GRIIT_SHADOWS.button,
  },
  pillButtonText: {
    color: GRIIT_COLORS.white,
    fontSize: 17,
    fontWeight: "700" as const,
  },
  sectionHeader: {
    fontSize: GRIIT_TYPOGRAPHY.sectionHeader,
    fontWeight: "700" as const,
    color: GRIIT_COLORS.textPrimary,
  },
  sectionHeaderSmall: {
    fontSize: GRIIT_TYPOGRAPHY.sectionHeaderSm,
    fontWeight: "700" as const,
    color: GRIIT_COLORS.textPrimary,
    textTransform: "uppercase" as const,
    letterSpacing: GRIIT_TYPOGRAPHY.sectionHeaderLetterSpacing,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: GRIIT_COLORS.background,
  },
});
