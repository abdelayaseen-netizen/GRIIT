import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayState } from "@/lib/profile-v2-record";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

export function ChallengeRow({
  name,
  dayLabel,
  meta,
  days,
  onPress,
}: {
  name: string;
  dayLabel: string;
  meta: string;
  days: DayState[];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${dayLabel}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.day}>{dayLabel}</Text>
      </View>
      <View style={styles.bar}>
        {days.map((s, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              s === "verified" && styles.segV,
              s === "missed" && styles.segM,
              s === "today" && styles.segT,
              s === "future" && styles.segF,
            ]}
          />
        ))}
      </View>
      <Text style={styles.meta}>{meta}</Text>
    </Pressable>
  );
}

export function CompletedRow({
  name,
  value,
  onPress,
}: {
  name: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${value}`}
      style={styles.done}
    >
      <Text style={styles.doneName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.doneVal}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 8,
  },
  pressed: { opacity: 0.88 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: "400", letterSpacing: -0.2, color: PROFILE_V2_COLOR.ink },
  day: { fontSize: 16, fontWeight: "400", letterSpacing: -0.2, color: PROFILE_V2_COLOR.ink },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
  },
  seg: { flex: 1, height: 6 },
  segV: { backgroundColor: PROFILE_V2_COLOR.orange },
  segM: { backgroundColor: PROFILE_V2_COLOR.missed },
  segT: { backgroundColor: PROFILE_V2_COLOR.todayBar },
  segF: { backgroundColor: PROFILE_V2_COLOR.track },
  meta: { fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
  done: {
    backgroundColor: PROFILE_V2_COLOR.sunken,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doneName: { flex: 1, fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  doneVal: { fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.muted },
});
