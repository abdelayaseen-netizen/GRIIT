import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

/** Fixed size for consistent image capture (e.g. 1080x1080 for stories). */
export const SHARE_CARD_WIDTH = 400;
export const SHARE_CARD_HEIGHT = 500;

export type ShareCardType = "progress" | "completion" | "milestone";

export interface ShareCardProps {
  type?: ShareCardType;
  streakCount: number;
  challengeName?: string;
  dayLabel?: string;
  tier?: string;
  /** For type 'completion': total days in the challenge. */
  totalDays?: number;
  /** For type 'milestone': e.g. "7-Day Streak", "30-Day Legend". */
  milestoneName?: string;
}

/**
 * Shareable progress card for social. Render inside a View with ref for capture via react-native-view-shot.
 */
function ShareCardInner({
  type = "progress",
  streakCount,
  challengeName,
  dayLabel,
  tier,
  totalDays,
  milestoneName,
}: ShareCardProps) {
  if (type === "completion") {
    return (
      <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
        <Text style={[styles.wordmark, styles.completionBadge]}>CHALLENGE COMPLETE</Text>
        {challengeName ? <Text style={styles.challengeNameCompletion} numberOfLines={2}>{challengeName}</Text> : null}
        <View style={styles.streakWrap}>
          <Text style={styles.streakNumber}>{totalDays ?? streakCount}</Text>
          <Text style={styles.streakLabel}>days secured</Text>
        </View>
        <View style={styles.streakWrap}>
          <Text style={[styles.streakNumber, { fontSize: 36 }]}>{streakCount}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        {tier ? (
          <View style={[styles.tierBadge, { backgroundColor: DS_COLORS.accent }]}>
            <Text style={styles.tierText}>{tier}</Text>
          </View>
        ) : null}
        <Text style={styles.cta}>Join me on GRIIT</Text>
        <Text style={styles.url}>griit.app</Text>
      </View>
    );
  }
  if (type === "milestone") {
    return (
      <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
        <Text style={styles.wordmark}>GRIIT</Text>
        <Text style={[styles.challengeName, { marginBottom: 16 }]}>{milestoneName ?? `${streakCount}-Day Streak`}</Text>
        <View style={styles.streakWrap}>
          <Text style={styles.streakNumber}>{streakCount}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <Text style={styles.cta}>Join me on GRIIT</Text>
        <Text style={styles.url}>griit.app</Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
      <Text style={styles.wordmark}>GRIIT</Text>
      <View style={styles.streakWrap}>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
      {challengeName ? <Text style={styles.challengeName} numberOfLines={2}>{challengeName}</Text> : null}
      {dayLabel ? <Text style={styles.dayLabel}>{dayLabel}</Text> : null}
      {tier ? (
        <View style={[styles.tierBadge, { backgroundColor: DS_COLORS.accent }]}>
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      ) : null}
      <Text style={styles.cta}>Join me on GRIIT</Text>
      <Text style={styles.url}>griit.app</Text>
    </View>
  );
}

export const ShareCard = React.memo(ShareCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.BG_PRIMARY,
    borderRadius: DS_RADIUS.XL,
    padding: 32,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 28,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD,
    color: DS_COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 24,
  },
  streakWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD,
    color: DS_COLORS.accent,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textSecondary,
    marginTop: 4,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 15,
    color: DS_COLORS.textSecondary,
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.XL,
    marginBottom: 24,
  },
  tierText: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.WHITE,
  },
  cta: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.accent,
    marginBottom: 8,
  },
  url: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
  completionBadge: {
    fontSize: 16,
    letterSpacing: 2,
    color: DS_COLORS.success,
  },
  challengeNameCompletion: {
    fontSize: 22,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
});
