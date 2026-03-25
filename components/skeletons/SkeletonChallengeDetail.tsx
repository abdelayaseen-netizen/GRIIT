import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { SkeletonBase } from "./SkeletonBase";

export function SkeletonChallengeDetail() {
  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.header}>
        <SkeletonBase width={80} height={22} borderRadius={11} />
        <SkeletonBase width="70%" height={32} borderRadius={6} style={styles.mt12} />
        <View style={styles.chipRow}>
          <SkeletonBase width={90} height={30} borderRadius={15} />
          <SkeletonBase width={90} height={30} borderRadius={15} />
          <SkeletonBase width={70} height={30} borderRadius={15} />
        </View>
      </View>
      <View style={styles.tasks}>
        <SkeletonBase width="100%" height={70} borderRadius={12} />
        <SkeletonBase width="100%" height={70} borderRadius={12} style={styles.taskGap} />
        <SkeletonBase width="100%" height={70} borderRadius={12} style={styles.taskGap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  header: {
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: 60,
    paddingBottom: DS_SPACING.md,
  },
  mt12: { marginTop: 12 },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  tasks: {
    padding: DS_SPACING.cardPadding,
    gap: 10,
  },
  taskGap: { marginTop: 10 },
});
