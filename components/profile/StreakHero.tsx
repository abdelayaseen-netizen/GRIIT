import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Flame, Share2, ChevronRight } from "lucide-react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

export type StreakHeroProps = {
  streakDays: number;
  bestStreak: number;
  nextBadgeIn: number | null;
  onShare: () => void;
  /** Optional zero-state CTA tap (e.g. opens Discover). When omitted, the slim card renders without arrow affordance. */
  onPressZeroCta?: () => void;
};

const SHARE_PILL_BG = "rgba(255,255,255,0.22)";
const FLAME_SQUARE_BG = "rgba(255,255,255,0.22)";

function formatNextBadgeMessage(nextBadgeIn: number | null): string | null {
  if (nextBadgeIn === null) return null;
  if (nextBadgeIn === 1) return "1 day to your first week badge";
  return `${nextBadgeIn} days to your next badge`;
}

export function StreakHero({
  streakDays,
  bestStreak,
  nextBadgeIn,
  onShare,
  onPressZeroCta,
}: StreakHeroProps) {
  if (streakDays === 0) {
    const Wrap = onPressZeroCta ? Pressable : View;
    return (
      <Wrap
        accessibilityRole={onPressZeroCta ? "button" : undefined}
        accessibilityLabel={onPressZeroCta ? "Start your streak by joining a challenge" : undefined}
        onPress={onPressZeroCta}
        style={styles.slimWrap}
      >
        <View style={styles.slimIcon}>
          <Flame size={20} color={DS_COLORS.ACCENT} fill="transparent" strokeWidth={2} />
        </View>
        <View style={styles.slimCopy}>
          <Text style={styles.slimTitle}>Start your streak</Text>
          <Text style={styles.slimSub}>Join a challenge to begin Day 1.</Text>
        </View>
        {onPressZeroCta ? (
          <ChevronRight
            size={18}
            color={DS_COLORS.TEXT_PRIMARY}
            strokeWidth={2}
            accessibilityElementsHidden
          />
        ) : null}
      </Wrap>
    );
  }

  const nextBadgeMessage = formatNextBadgeMessage(nextBadgeIn);
  const showBestLine = bestStreak > 0;

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
          <Text style={styles.streakNumeral}>{streakDays}</Text>
          <Text style={styles.dayStreakLabel}>day streak</Text>
          {nextBadgeMessage !== null ? (
            <Text style={styles.progressLine}>{nextBadgeMessage}</Text>
          ) : null}
          {showBestLine ? (
            <Text style={styles.bestLine}>
              Best · {bestStreak}
              {bestStreak === 1 ? " day" : " days"}
            </Text>
          ) : null}
        </View>

        <View
          style={styles.flameSquare}
          accessibilityRole="image"
          accessibilityLabel="Streak flame illustration"
        >
          <Flame size={34} color={DS_COLORS.WHITE} fill={DS_COLORS.WHITE} strokeWidth={0} />
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
  slimWrap: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    marginBottom: DS_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
  },
  slimIcon: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  slimCopy: {
    flex: 1,
    minWidth: 0,
  },
  slimTitle: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  slimSub: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
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
