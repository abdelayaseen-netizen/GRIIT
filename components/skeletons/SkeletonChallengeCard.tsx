import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS } from "@/lib/design-system";
import { SkeletonBase } from "./SkeletonBase";

export function SkeletonChallengeCard() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SkeletonBase width={44} height={44} borderRadius={12} />
        <SkeletonBase width={50} height={20} borderRadius={10} />
      </View>
      <SkeletonBase width="80%" height={16} borderRadius={4} style={styles.mt10} />
      <SkeletonBase width="100%" height={13} borderRadius={4} style={styles.mt6} />
      <SkeletonBase width="65%" height={13} borderRadius={4} style={styles.mt4} />
      <View style={styles.footer}>
        <SkeletonBase width="40%" height={13} borderRadius={4} />
        <SkeletonBase width={60} height={32} borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt10: { marginTop: 10 },
});
