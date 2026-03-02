import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/src/theme/colors";
import { radius } from "@/src/theme/radius";

const HEIGHT = 6;

type ProgressBarProps = {
  progress: number; // 0..1
  style?: object;
};

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
