import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"
import { shareProfile } from "@/lib/share";
import { captureError } from "@/lib/sentry";

export interface ShareDisciplineCardProps {
  name: string;
  disciplineScore: number;
  currentStreak: number;
  tier: string;
  onShare?: () => void;
}

export default function ShareDisciplineCard({
  name,
  disciplineScore,
  currentStreak,
  tier,
  onShare,
}: ShareDisciplineCardProps) {
  const handleShare = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await shareProfile({
        username: name,
        streak: currentStreak,
        totalDaysSecured: disciplineScore,
        tier,
      });
      onShare?.();
    } catch (e) {
      captureError(e, "ShareDisciplineCard");
      // User cancelled or failed
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.preview}>
        <Text style={styles.previewName}>{name}</Text>
        <Text style={styles.previewTier}>{tier} Tier</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Days secured</Text>
          <Text style={styles.previewValue}>{disciplineScore}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Current streak</Text>
          <Text style={styles.previewValue}>{currentStreak} days</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Share profile"
      >
        <Share2 size={18} color={DS_COLORS.white} />
        <Text style={styles.shareButtonText}>Share profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  preview: {
    marginBottom: DS_SPACING.lg,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
    backgroundColor: DS_COLORS.background,
    borderRadius: DS_RADIUS.input / 2,
  },
  previewName: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  previewTier: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: DS_SPACING.sm,
  },
  previewLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textMuted,
  },
  previewValue: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    backgroundColor: DS_COLORS.accent,
    paddingVertical: DS_SPACING.lg,
    borderRadius: DS_RADIUS.button,
  },
  shareButtonText: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.white,
  },
});
