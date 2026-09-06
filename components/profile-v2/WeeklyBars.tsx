import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

const PLOT = 92;

export function WeeklyBars({
  weeks,
  average,
  startLabel,
}: {
  weeks: Array<number | null>;
  average: number;
  startLabel: string;
}) {
  const avgPct = Math.round(average * 100);
  const dashBottom = Math.round(average * PLOT);
  return (
    <View>
      <View style={styles.plot}>
        <View style={styles.baseline} />
        {weeks.map((rate, i) => {
          const h = rate == null ? 3 : Math.max(4, Math.round(rate * PLOT));
          return (
            <View
              key={i}
              style={[
                styles.bar,
                { height: h },
                rate == null ? styles.stub : styles.fill,
              ]}
            />
          );
        })}
        <View style={[styles.dash, { bottom: dashBottom }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>{startLabel}</Text>
        <Text style={styles.meta}>Dashed line · your average {avgPct}%</Text>
      </View>
      <Text style={styles.note}>
        One bar per week, verified ÷ due. Blank weeks had no challenge running.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    height: PLOT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    marginTop: 8,
  },
  baseline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: PROFILE_V2_COLOR.sunken,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  fill: { backgroundColor: PROFILE_V2_COLOR.orange },
  stub: { backgroundColor: PROFILE_V2_COLOR.sunken },
  dash: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: PROFILE_V2_COLOR.mutedLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  meta: { fontSize: 11, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
  note: { marginTop: 6, fontSize: 11, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
});
