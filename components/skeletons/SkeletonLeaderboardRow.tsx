import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS } from "@/lib/design-system";
import { SkeletonBase } from "./SkeletonBase";

export function SkeletonLeaderboardRow() {
  return (
    <View style={styles.row}>
      <SkeletonBase width={24} height={16} borderRadius={4} />
      <SkeletonBase width={40} height={40} borderRadius={20} />
      <View style={styles.nameBlock}>
        <SkeletonBase width="70%" height={14} borderRadius={4} />
        <SkeletonBase width="50%" height={12} borderRadius={4} style={styles.mt4} />
      </View>
      <SkeletonBase width={36} height={16} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: DS_COLORS.card,
    marginBottom: 6,
    borderRadius: 14,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  mt4: { marginTop: 4 },
});
