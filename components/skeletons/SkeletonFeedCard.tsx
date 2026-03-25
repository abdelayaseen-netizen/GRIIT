import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS, DS_SHADOWS } from "@/lib/design-system";
import { SkeletonBase } from "./SkeletonBase";

export function SkeletonFeedCard() {
  return (
    <View style={[styles.card, DS_SHADOWS.cardSubtle]}>
      <View style={styles.header}>
        <SkeletonBase width={38} height={38} borderRadius={19} />
        <View style={styles.headerText}>
          <SkeletonBase width="60%" height={14} borderRadius={4} />
          <SkeletonBase width="40%" height={12} borderRadius={4} style={styles.mt4} />
        </View>
        <SkeletonBase width={30} height={12} borderRadius={4} />
      </View>
      <SkeletonBase width="35%" height={13} borderRadius={4} style={styles.mt8} />
      <SkeletonBase width="100%" height={6} borderRadius={3} style={styles.mt6} />
      <View style={styles.actions}>
        <SkeletonBase width={100} height={34} borderRadius={20} />
        <SkeletonBase width={60} height={34} borderRadius={20} />
        <SkeletonBase width={60} height={34} borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
});
