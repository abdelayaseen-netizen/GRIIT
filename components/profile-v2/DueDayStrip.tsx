import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { cellWidth, type DayState } from "@/lib/profile-v2-record";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

export function DueDayStrip({ strip }: { strip: DayState[] }) {
  const [inner, setInner] = useState(298);
  if (strip.length === 0) return null;
  const w = cellWidth(strip.length, inner);
  return (
    <View>
      <View
        style={styles.row}
        onLayout={(e) => {
          const next = Math.round(e.nativeEvent.layout.width);
          if (next > 0 && next !== inner) setInner(next);
        }}
      >
        {strip.map((state, i) => (
          <View
            key={`${state}-${i}`}
            style={[
              styles.cell,
              { width: w },
              state === "verified" && styles.verified,
              state === "missed" && styles.missed,
              state === "today" && styles.today,
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Legend swatch={styles.verified} label="Verified" />
        <Legend swatch={styles.missed} label="Missed" />
        <Legend swatch={styles.today} label="Today" />
      </View>
    </View>
  );
}

function Legend({ swatch, label }: { swatch: object; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, swatch]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
    height: 26,
  },
  cell: {
    height: 26,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  verified: {
    backgroundColor: PROFILE_V2_COLOR.orange,
    borderColor: PROFILE_V2_COLOR.orange,
  },
  missed: {
    backgroundColor: PROFILE_V2_COLOR.sunken,
    borderColor: PROFILE_V2_COLOR.missed,
  },
  today: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderColor: PROFILE_V2_COLOR.orange,
    borderStyle: "dashed",
  },
  legend: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2, borderWidth: 1.5 },
  legendText: { fontSize: 11, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
});
