import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
import { SkeletonBase } from "./SkeletonBase";

export const SkeletonHomeChallengeCard = React.memo(function SkeletonHomeChallengeCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonBase width={44} height={44} borderRadius={12} />
        <View style={styles.headerText}>
          <SkeletonBase width="70%" height={15} borderRadius={4} />
          <SkeletonBase width="40%" height={12} borderRadius={4} style={styles.mt4} />
        </View>
        <SkeletonBase width={50} height={20} borderRadius={10} />
      </View>
      <SkeletonBase width="100%" height={4} borderRadius={2} style={styles.mt10} />
      <View style={styles.taskRow}>
        <SkeletonBase width={24} height={24} borderRadius={12} />
        <SkeletonBase width="60%" height={13} borderRadius={4} />
        <SkeletonBase width={50} height={28} borderRadius={14} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.card,
    borderRadius: DS_RADIUS.LG,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 10,
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: DS_RADIUS.MD,
  },
  mt4: { marginTop: 4 },
  mt10: { marginTop: 10 },
});
