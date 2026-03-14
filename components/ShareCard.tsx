import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { BASE_COLORS } from "@/constants/theme";

/** Fixed size for consistent image capture (e.g. 1080x1080 for stories). */
export const SHARE_CARD_WIDTH = 400;
export const SHARE_CARD_HEIGHT = 500;

export interface ShareCardProps {
  streakCount: number;
  challengeName?: string;
  dayLabel?: string;
  tier?: string;
}

/**
 * Shareable progress card for social. Render inside a View with ref for capture via react-native-view-shot.
 */
export function ShareCard({ streakCount, challengeName, dayLabel, tier }: ShareCardProps) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
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
    fontWeight: "800",
    color: DS_COLORS.accent,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: DS_COLORS.textSecondary,
    marginTop: 4,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: "600",
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
    borderRadius: 20,
    marginBottom: 24,
  },
  tierText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  cta: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.accent,
    marginBottom: 8,
  },
  url: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
});
