import { DS_V3, DS_MEASURES, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export function CreateFlowHeader(p: {
  title: string;
  onCancel: () => void;
  rightLabel?: string;
  onRight?: () => void;
  rightDisabled?: boolean;
  /** "soft" = accentOrangeSoft bg + orange text (e.g. modal Add); "primary" = filled orange (default) */
  rightButtonVariant?: "primary" | "soft";
  /** When true, right button uses borderRadius 20, paddingH 20 (pill style for Edit Task Save) */
  rightButtonPill?: boolean;
  /** Override cancel button a11y (e.g. "Cancel editing task") */
  accessibilityCancelLabel?: string;
  /** Override right button a11y (e.g. "Save task") */
  accessibilityRightLabel?: string;
}) {
  const variant = p.rightButtonVariant ?? "primary";
  const isSoft = variant === "soft";
  const isPill = p.rightButtonPill === true;
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={p.onCancel} style={styles.left} accessibilityLabel={p.accessibilityCancelLabel ?? "Cancel"} accessibilityRole="button">
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={[styles.title, isPill && styles.titleEditTask]}>{p.title}</Text>
      {p.rightLabel != null && p.onRight != null ? (
        <TouchableOpacity
          onPress={p.onRight}
          disabled={p.rightDisabled}
          style={[
            styles.rightBtn,
            isSoft && styles.rightBtnSoft,
            isPill && styles.rightBtnPill,
            p.rightDisabled && styles.rightBtnDisabled,
          ]}
          accessibilityLabel={p.accessibilityRightLabel ?? p.rightLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: p.rightDisabled }}
        >
          <Text style={[styles.rightText, isSoft && styles.rightTextSoft]}>
            {p.rightLabel}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.left} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: DS_MEASURES.HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: DS_V3.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: DS_V3.color.border,
  },
  left: { minWidth: 64 },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_V3.color.brand,
  },
  title: {
    fontSize: 20,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_V3.color.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  titleEditTask: { fontSize: 18, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  rightBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: DS_RADIUS.LG,
    backgroundColor: DS_V3.color.brand,
    minWidth: 60,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnPill: {
    borderRadius: DS_RADIUS.XL,
    paddingHorizontal: 20,
    height: 40,
  },
  rightBtnSoft: {
    backgroundColor: DS_V3.color.brandTint,
  },
  rightBtnDisabled: { opacity: 0.5 },
  rightText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_V3.color.textPrimary,
  },
  rightTextSoft: {
    color: DS_V3.color.brand,
  },
});
