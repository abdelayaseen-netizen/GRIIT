/**
 * Centralized create-flow layout and wrapper styles.
 * Use tokens only; no hardcoded colors/radii.
 */

import { DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";
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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
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
    borderRadius: DS_RADIUS.button,
  },
  allowedPillText: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: colors.accentGreen,
  },
  hardPill: {
    marginTop: spacing.gridS,
    backgroundColor: colors.accentRedSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.button,
  },
  hardPillText: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: colors.accentRed,
  },
});
