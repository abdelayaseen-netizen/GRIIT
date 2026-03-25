import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { SkeletonBase } from "./SkeletonBase";

export function SkeletonProfile() {
  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.avatarBlock}>
        <SkeletonBase width={80} height={80} borderRadius={40} />
        <SkeletonBase width={140} height={18} borderRadius={4} style={styles.mt12} />
        <SkeletonBase width={100} height={14} borderRadius={4} style={styles.mt8} />
      </View>
      <View style={styles.statsRow}>
        <SkeletonBase width="23%" height={60} borderRadius={12} />
        <SkeletonBase width="23%" height={60} borderRadius={12} />
        <SkeletonBase width="23%" height={60} borderRadius={12} />
        <SkeletonBase width="23%" height={60} borderRadius={12} />
      </View>
      <SkeletonBase width="100%" height={80} borderRadius={12} style={styles.mt20} />
      <SkeletonBase width="100%" height={80} borderRadius={12} style={styles.mt10} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: 24,
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  avatarBlock: {
    alignItems: "center",
    paddingTop: 16,
    gap: 12,
  },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mt12: { marginTop: 12 },
  mt20: { marginTop: 20 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    justifyContent: "space-between",
  },
});
