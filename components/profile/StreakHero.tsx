import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Flame, Share2 } from "lucide-react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type StreakHeroProps = {
  streakDays: number;
  bestStreak: number;
  nextBadgeIn: number | null;
  onShare: () => void;
};

const SHARE_PILL_BG = "rgba(255,255,255,0.22)";
const FLAME_SQUARE_BG = "rgba(255,255,255,0.22)";

function formatNextBadgeMessage(nextBadgeIn: number | null): string | null {
  if (nextBadgeIn === null) return null;
  if (nextBadgeIn === 1) return "1 day to your first week badge";
  return `${nextBadgeIn} days to your next badge`;
}

export function StreakHero({ streakDays, bestStreak, nextBadgeIn, onShare }: StreakHeroProps) {
  const nextBadgeMessage = streakDays > 0 ? formatNextBadgeMessage(nextBadgeIn) : null;
  const showBestLine = streakDays > 0 && bestStreak > 0;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share my streak"
        onPress={onShare}
        style={styles.sharePill}
        hitSlop={10}
      >
        <Share2 size={18} color={DS_COLORS.WHITE} strokeWidth={2} />
      </Pressable>

      <View style={styles.bodyRow}>
        <View style={styles.copyCol}>
          {streakDays === 0 ? (
            <Text style={styles.zeroHeadline}>Start your streak today</Text>
          ) : (
            <>
              <Text style={styles.streakNumeral}>{streakDays}</Text>
              <Text style={styles.dayStreakLabel}>day streak</Text>
              {nextBadgeMessage !== null ? <Text style={styles.progressLine}>{nextBadgeMessage}</Text> : null}
              {showBestLine ? (
                <Text style={styles.bestLine}>
                  Best · {bestStreak}
                  {bestStreak === 1 ? " day" : " days"}
                </Text>
              ) : null}
            </>
          )}
        </View>

        <View
          style={styles.flameSquare}
          accessibilityRole="image"
          accessibilityLabel="Streak flame illustration"
        >
          {streakDays === 0 ? (
            <Flame size={34} color={DS_COLORS.WHITE} fill="transparent" strokeWidth={2} />
          ) : (
            <Flame size={34} color={DS_COLORS.WHITE} fill={DS_COLORS.WHITE} strokeWidth={0} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: DS_COLORS.ACCENT,
    borderRadius: DS_RADIUS.LG,
    padding: 14,
    marginBottom: DS_SPACING.md,
    position: "relative",
    overflow: "hidden",
  },
  sharePill: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
    backgroundColor: SHARE_PILL_BG,
    borderRadius: DS_RADIUS.PILL,
    paddingHorizontal: DS_SPACING.sm + 4,
    paddingVertical: DS_SPACING.xs + 4,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: DS_SPACING.md,
    paddingRight: 56,
  },
  copyCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  streakNumeral: {
    fontSize: 54,
    fontWeight: "500",
    color: DS_COLORS.WHITE,
    letterSpacing: -0.5,
  },
  zeroHeadline: {
    fontSize: 22,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
    lineHeight: 28,
  },
  dayStreakLabel: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.WHITE,
    textTransform: "lowercase",
  },
  progressLine: {
    marginTop: DS_SPACING.sm,
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.WHITE,
    lineHeight: 20,
    opacity: 0.92,
  },
  bestLine: {
    marginTop: DS_SPACING.xs + 2,
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.WHITE,
    opacity: 0.82,
    lineHeight: 16,
  },
  flameSquare: {
    width: 52,
    height: 52,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: FLAME_SQUARE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
});
