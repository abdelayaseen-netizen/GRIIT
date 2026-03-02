/**
 * Centralized create-flow layout and wrapper styles.
 * Use tokens only; no hardcoded colors/radii.
 */

import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "./tokens";

export const createFlowStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  screenPadding: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.gridXL,
  },
  section: {
    marginBottom: spacing.gridL,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: spacing.gridS,
    textTransform: "uppercase",
  },
  settingsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.cardCreate,
    padding: spacing.screenHorizontal,
    marginBottom: spacing.gridM,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.gridM,
  },
  fieldGroup: {
    marginBottom: spacing.gridM,
  },
  allowedPill: {
    marginTop: spacing.gridS,
    backgroundColor: colors.accentGreenSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  allowedPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  hardPill: {
    marginTop: spacing.gridS,
    backgroundColor: colors.accentRedSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  hardPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentRed,
  },
});
