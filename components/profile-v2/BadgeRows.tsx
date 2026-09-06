import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { badgeRowsFromProgress } from "@/lib/profile-v2-badges";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

type BadgeRow = ReturnType<typeof badgeRowsFromProgress>[number];

export function BadgeRows({ rows }: { rows: BadgeRow[] }) {
  return (
    <View style={styles.list}>
      {rows.map((b) => (
        <View key={b.name} style={[styles.row, b.earned ? styles.earned : styles.locked]}>
          <View style={styles.head}>
            <Text style={styles.name}>{b.name}</Text>
            <Text style={[styles.state, b.earned && styles.stateOn]}>{b.state}</Text>
          </View>
          <Text style={styles.rule}>{b.rule}</Text>
          {b.earned ? null : (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(b.progress * 100)}%` }]} />
            </View>
          )}
        </View>
      ))}
      <Text style={styles.foot}>
        Five marks, each earned by verified days only. Nothing here can be bought or awarded.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  earned: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderColor: PROFILE_V2_COLOR.border,
  },
  locked: {
    backgroundColor: "transparent",
    borderColor: PROFILE_V2_COLOR.track,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8 },
  name: { fontSize: 15, fontWeight: "400", letterSpacing: -0.2, color: PROFILE_V2_COLOR.ink },
  state: { fontSize: 11, fontWeight: "400", letterSpacing: 0.6, color: PROFILE_V2_COLOR.mutedLight },
  stateOn: { color: PROFILE_V2_COLOR.orange },
  rule: { fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: PROFILE_V2_COLOR.track,
    overflow: "hidden",
  },
  fill: { height: 4, backgroundColor: PROFILE_V2_COLOR.chevron },
  foot: { marginTop: 4, fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
});
