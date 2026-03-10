import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import Colors from "@/constants/colors";

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
        <Flame size={14} color="#fff" />
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
    marginHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  track: {
    height: 6,
    backgroundColor: "#F0EDE8",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 3,
  },
  ptsText: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 8,
  },
});
