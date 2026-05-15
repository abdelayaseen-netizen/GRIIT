/**
 * Create-flow layout styles (migrated from lib/theme/createFlowStyles.ts, Phase 2).
 * Value-preserving: resolves through DS_* per approved mapping table only.
 */

import { StyleSheet } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

export const createFlowStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  screenPadding: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingBottom: DS_SPACING.xxxl,
  },
  section: {
    marginBottom: DS_SPACING.xxl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: DS_SPACING.md,
    textTransform: "uppercase",
  },
  settingsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.lg,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.lg,
  },
  fieldGroup: {
    marginBottom: DS_SPACING.lg,
  },
  allowedPill: {
    marginTop: DS_SPACING.md,
    backgroundColor: DS_COLORS.successSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.button,
  },
  allowedPillText: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.success,
  },
  hardPill: {
    marginTop: DS_SPACING.md,
    backgroundColor: DS_COLORS.dangerSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.button,
  },
  hardPillText: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.danger,
  },
});
