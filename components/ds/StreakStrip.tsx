import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import WeekStrip, { STRIP_SIZE, type WeekStripDay } from "@/components/ds/WeekStrip";

export function StreakStrip({
  streak,
  days,
  todayIndex,
  status,
  onOpenSheet,
  notice,
  primary,
  band,
}: {
  streak: number;
  days: WeekStripDay[];
  todayIndex: number;
  status: string;
  onOpenSheet: () => void;
  notice?: React.ReactNode;
  primary?: React.ReactNode;
  band?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onOpenSheet}
        accessibilityRole="button"
        accessibilityLabel={`${streak} day streak. Opens the streak calendar.`}
        style={styles.head}
      >
        <Flame size={30} color={DS_V3.color.brand} fill={DS_V3.color.brand} />
        <Text style={styles.num}>{streak}</Text>
        <Text style={styles.word}>day streak</Text>
        <ChevronRight size={20} color={DS_V3.color.textSecondary} />
      </Pressable>
      <WeekStrip days={days} todayIndex={todayIndex} size={STRIP_SIZE.home} onPress={onOpenSheet} />
      {band}
      {notice}
      <Text style={styles.status}>{status}</Text>
      {primary}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.xs, gap: DS_V3.space.md },
  head: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm, minHeight: DS_V3.size.tap },
  num: {
    fontWeight: DS_V3.displayWeight,
    fontSize: DS_V3.numberSize.M,
    lineHeight: 44,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  word: { ...DS_V3.type.secondary, color: DS_V3.color.textPrimary, flex: 1 },
  status: { ...DS_V3.type.body, color: DS_V3.color.textSecondary },
});
