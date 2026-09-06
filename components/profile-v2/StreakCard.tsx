import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

export function StreakCard({
  current,
  best,
  note,
}: {
  current: number;
  best: number;
  note: string;
}) {
  const unit = current === 1 ? "day" : "days";
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.micro}>CURRENT STREAK</Text>
        <Text style={styles.best}>BEST · {best} days</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{current}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Text style={styles.note}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_V2_COLOR.ink,
    borderRadius: 24,
    padding: 20,
    shadowColor: PROFILE_V2_COLOR.ink,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  micro: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.4,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  best: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 0.5,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 8 },
  value: {
    fontSize: 54,
    fontWeight: "500",
    letterSpacing: -2.4,
    lineHeight: 52,
    color: PROFILE_V2_COLOR.surface,
  },
  unit: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.mutedOnDark },
  note: { marginTop: 8, fontSize: 13, fontWeight: "400", color: PROFILE_V2_COLOR.mutedOnDark },
});
