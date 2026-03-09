import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, measures } from "@/src/theme/tokens";

export function CreateFlowHeader(p: {
  title: string;
  onCancel: () => void;
  rightLabel?: string;
  onRight?: () => void;
  rightDisabled?: boolean;
  /** "soft" = accentOrangeSoft bg + orange text (e.g. modal Add); "primary" = filled orange (default) */
  rightButtonVariant?: "primary" | "soft";
}) {
  const variant = p.rightButtonVariant ?? "primary";
  const isSoft = variant === "soft";
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={p.onCancel} style={styles.left}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{p.title}</Text>
      {p.rightLabel != null && p.onRight != null ? (
        <TouchableOpacity
          onPress={p.onRight}
          disabled={p.rightDisabled}
          style={[
            styles.rightBtn,
            isSoft && styles.rightBtnSoft,
            p.rightDisabled && styles.rightBtnDisabled,
          ]}
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
    height: measures.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: { minWidth: 64 },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.accentOrangeCreate,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  rightBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.accentOrangeCreate,
    minWidth: 60,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnSoft: {
    backgroundColor: colors.accentOrangeSoft,
  },
  rightBtnDisabled: { opacity: 0.5 },
  rightText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  rightTextSoft: {
    color: colors.accentOrangeCreate,
  },
});
