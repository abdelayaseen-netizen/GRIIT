import React from "react";
import { View, StyleSheet } from "react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
import { SkeletonBase } from "./SkeletonBase";

export const SkeletonHeroCard = React.memo(function SkeletonHeroCard() {
  return (
    <View style={styles.card}>
      <SkeletonBase width={120} height={18} borderRadius={9} />
      <SkeletonBase width="85%" height={28} borderRadius={6} style={styles.mt12} />
      <SkeletonBase width="60%" height={28} borderRadius={6} style={styles.mt6} />
      <SkeletonBase width="100%" height={14} borderRadius={4} style={styles.mt12} />
      <SkeletonBase width="80%" height={14} borderRadius={4} style={styles.mt4} />
      <SkeletonBase width="50%" height={13} borderRadius={4} style={styles.mt12} />
      <SkeletonBase width="100%" height={48} borderRadius={24} style={styles.mt14} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surfaceAlt,
    borderRadius: DS_RADIUS.XL,
    padding: 20,
    marginBottom: 16,
  },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt12: { marginTop: 12 },
  mt14: { marginTop: 14 },
});
