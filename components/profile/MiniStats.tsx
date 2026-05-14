import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type MiniStatsProps = {
  bestStreak: number;
  activeCount: number;
  completedCount: number;
  onTapActive: () => void;
  onTapCompleted: () => void;
};

export function MiniStats({
  bestStreak,
  activeCount,
  completedCount,
  onTapActive,
  onTapCompleted,
}: MiniStatsProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.card, styles.cardStatic]} accessible accessibilityLabel={`Best streak, ${bestStreak} ${bestStreak === 1 ? "day" : "days"}`}>
        <Text style={styles.num}>{bestStreak}</Text>
        <Text style={styles.lbl}>Best streak</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open active challenges, ${activeCount} in progress`}
        onPress={onTapActive}
        style={styles.cardPress}
      >
        <View style={styles.dotAccent} accessibilityElementsHidden />
        <Text style={styles.num}>{activeCount}</Text>
        <Text style={styles.lbl}>Active</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open completed challenges, ${completedCount} finished`}
        onPress={onTapCompleted}
        style={styles.cardPress}
      >
        <View style={styles.dotAccent} accessibilityElementsHidden />
        <Text style={styles.num}>{completedCount}</Text>
        <Text style={styles.lbl}>Completed</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.md,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: DS_COLORS.BG_CARD,
    paddingVertical: 11,
    paddingHorizontal: 8,
    minHeight: 64,
    justifyContent: "center",
  },
  cardStatic: {
    position: "relative",
  },
  cardPress: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: DS_COLORS.BG_CARD,
    paddingVertical: 11,
    paddingHorizontal: 8,
    minHeight: 64,
    justifyContent: "center",
    position: "relative",
  },
  dotAccent: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 5,
    height: 5,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.ACCENT,
  },
  num: { fontSize: 18, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  lbl: { marginTop: 2, fontSize: 11, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY },
});
