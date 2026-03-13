import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

export interface TierProgressBarProps {
  currentPoints: number;
  pointsRequiredForNextTier: number;
  currentTier: string;
  nextTier: string | null;
}

export default function TierProgressBar({
  currentPoints,
  pointsRequiredForNextTier,
  currentTier,
  nextTier,
}: TierProgressBarProps) {
  const pts = Number(currentPoints) || 0;
  const req = Number(pointsRequiredForNextTier) || 0;
  const totalForNext = nextTier ? pts + req : pts;
  const progress = nextTier && totalForNext > 0 ? Math.min(1, pts / totalForNext) : 1;

  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Flame size={14} color={DS_COLORS.white} />
        <Text style={styles.pillText}>{currentTier}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.ptsText}>
        {nextTier && pointsRequiredForNextTier > 0
          ? `${pointsRequiredForNextTier} points to ${nextTier}`
          : "Max tier"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: DS_SPACING.sm,
    alignSelf: "flex-start",
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: 6,
    borderRadius: DS_RADIUS.input,
    backgroundColor: DS_COLORS.black,
  },
  pillText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  track: {
    height: 6,
    backgroundColor: DS_COLORS.borderAlt,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: DS_COLORS.black,
    borderRadius: 3,
  },
  ptsText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
  },
});
