import { StyleSheet } from "react-native";
import { GRIIT_COLORS, GRIIT_RADII, GRIIT_TYPOGRAPHY } from "./griit-design-tokens";

/**
 * Shared style objects for cards, buttons, section headers, and screen containers.
 * Use these across Home, Discover, Profile, Settings to reduce duplication.
 */
export const sharedStyles = StyleSheet.create({
  card: {
    backgroundColor: GRIIT_COLORS.cardBackground,
    borderRadius: GRIIT_RADII.card,
    borderWidth: 1,
    borderColor: GRIIT_COLORS.borderLight,
    padding: 16,
  },
  pillButton: {
    backgroundColor: GRIIT_COLORS.primaryAccent,
    borderRadius: GRIIT_RADII.buttonPill,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  pillButtonText: {
    color: "#FFFFFF",
    fontSize: GRIIT_TYPOGRAPHY.buttonText,
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
