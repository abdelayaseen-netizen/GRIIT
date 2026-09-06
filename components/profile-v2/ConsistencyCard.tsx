import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { DueDayStrip } from "./DueDayStrip";
import { WeeklyBars } from "./WeeklyBars";

export function ConsistencyCard({
  consistency,
  weekStartLabel,
  onOpenDetail,
}: {
  consistency: ProfileRecord["consistency"];
  weekStartLabel: string;
  onOpenDetail: () => void;
}) {
  const [window, setWindow] = useState<"30d" | "6mo">("30d");
  const lockedIn = consistency.verdict === "Locked in";

  return (
    <Pressable
      onPress={onOpenDetail}
      accessibilityRole="button"
      accessibilityLabel="See the full consistency record"
      style={styles.card}
    >
      <View style={styles.titleRow}>
        <Text style={styles.micro}>CONSISTENCY</Text>
        {consistency.showWindowControl ? (
          <View style={styles.windows}>
            {(["30d", "6mo"] as const).map((id) => {
              const on = window === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setWindow(id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={id === "30d" ? "30 days" : "6 months"}
                  style={[styles.winBtn, on && styles.winBtnOn]}
                >
                  <Text style={[styles.winTxt, on && styles.winTxtOn]}>
                    {id === "30d" ? "30 days" : "6 months"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={styles.rateRow}>
        <Text style={styles.rate}>{consistency.rate}</Text>
        {consistency.verdict ? (
          <Text style={[styles.verdict, lockedIn && styles.verdictHot]}>
            {consistency.verdict}
          </Text>
        ) : null}
      </View>
      <Text style={styles.line}>{consistency.line}</Text>

      {window === "30d" ? (
        <View style={styles.plot}>
          <DueDayStrip strip={consistency.strip} />
        </View>
      ) : (
        <WeeklyBars
          weeks={consistency.weeks}
          average={consistency.weeklyAverage}
          startLabel={weekStartLabel}
        />
      )}

      <Pressable
        onPress={onOpenDetail}
        accessibilityRole="button"
        accessibilityLabel="See the full record"
        style={styles.footerBtn}
      >
        <Text style={styles.footerTxt}>See the full record</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 22,
    padding: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  micro: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.4,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  windows: { flexDirection: "row", gap: 6 },
  winBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: PROFILE_V2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  winBtnOn: {
    backgroundColor: PROFILE_V2_COLOR.ink,
    borderColor: PROFILE_V2_COLOR.ink,
  },
  winTxt: { fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.muted },
  winTxtOn: { color: PROFILE_V2_COLOR.surface },
  rateRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 8 },
  rate: {
    fontSize: 40,
    fontWeight: "500",
    letterSpacing: -1.6,
    color: PROFILE_V2_COLOR.ink,
  },
  verdict: { fontSize: 17, fontWeight: "400", color: PROFILE_V2_COLOR.body },
  verdictHot: { color: PROFILE_V2_COLOR.orange },
  line: { marginTop: 6, fontSize: 13, lineHeight: 19, color: PROFILE_V2_COLOR.body },
  plot: { marginTop: 14 },
  footerBtn: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  footerTxt: { fontSize: 14, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
});
