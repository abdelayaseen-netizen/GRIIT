import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Trophy, Lock } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { formatShortDate } from "@/lib/date-format";

export type AchievementCategory = "consistency" | "challenge" | "discipline";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlocked: boolean;
  unlockDate?: string | null;
}

export interface AchievementsSectionProps {
  achievements: AchievementItem[];
  loading?: boolean;
}

export default function AchievementsSection({ achievements, loading }: AchievementsSectionProps) {
  const byCategory = achievements.reduce(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    },
    {} as Record<AchievementCategory, AchievementItem[]>
  );
  const order: AchievementCategory[] = ["consistency", "challenge", "discipline"];

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trophy size={18} color={DS_COLORS.textPrimary} />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {order.flatMap((cat) =>
          (byCategory[cat] ?? []).map((a) => (
            <View
              key={a.id}
              style={[styles.badge, a.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}
            >
              <View
                style={[
                  styles.badgeIcon,
                  { backgroundColor: a.unlocked ? DS_COLORS.accent + "18" : DS_COLORS.surfaceMuted },
                ]}
              >
                {a.unlocked ? (
                  <Trophy size={16} color={DS_COLORS.accent} />
                ) : (
                  <Lock size={16} color={DS_COLORS.textMuted} />
                )}
              </View>
              <Text
                style={[styles.badgeTitle, !a.unlocked && styles.badgeTitleLocked]}
                numberOfLines={2}
              >
                {a.title}
              </Text>
              {a.description ? (
                <Text style={styles.badgeDesc} numberOfLines={1}>
                  {a.description}
                </Text>
              ) : null}
              {a.unlocked && a.unlockDate ? (
                <Text style={styles.badgeDate}>
                  {formatShortDate(a.unlockDate)}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: DS_SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.md,
  },
  sectionTitle: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize - 2,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  loadingText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
    gap: DS_SPACING.md,
    flexDirection: "row",
    paddingBottom: DS_SPACING.sm,
  },
  badge: {
    width: 80,
    alignItems: "center",
    paddingBottom: DS_SPACING.sm,
  },
  badgeUnlocked: {},
  badgeLocked: {},
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.sm,
    backgroundColor: DS_COLORS.chipFill,
  },
  badgeTitle: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  badgeTitleLocked: {
    color: DS_COLORS.textMuted,
  },
  badgeDesc: {
    fontSize: DS_TYPOGRAPHY.tabLabel.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  badgeDate: {
    fontSize: 10,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.xs,
  },
});
