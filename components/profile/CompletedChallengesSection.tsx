import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award, ChevronRight } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"
import { formatShortDate } from "@/lib/date-utils";

export interface CompletedChallengeItem {
  id: string;
  challengeId: string;
  challengeName: string;
  completedAt: string;
}

export interface CompletedChallengesSectionProps {
  challenges: CompletedChallengeItem[];
  loading?: boolean;
}

export default React.memo(function CompletedChallengesSection({
  challenges,
  loading,
}: CompletedChallengesSectionProps) {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Award size={18} color={DS_COLORS.textPrimary} />
          <Text style={styles.title}>Challenge History</Text>
        </View>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Award size={18} color={DS_COLORS.textPrimary} />
          <Text style={styles.title}>Challenge History</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completed challenges yet.</Text>
          <Text style={styles.emptySub}>Complete your first challenge to see your history here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Award size={18} color={DS_COLORS.textPrimary} />
        <Text style={styles.title}>Challenge History</Text>
      </View>
      <View style={styles.list}>
        {challenges.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.challengeName} numberOfLines={1}>
                {c.challengeName}
              </Text>
              <Text style={styles.completedAt}>
                Completed {formatShortDate(c.completedAt)}
              </Text>
            </View>
            <ChevronRight size={18} color={DS_COLORS.textMuted} />
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: DS_SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.md,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize - 2,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  loading: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
  },
  empty: {
    backgroundColor: DS_COLORS.surface,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    padding: DS_SPACING.xxl,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    alignItems: "center",
  },
  emptyText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
  },
  emptySub: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
  },
  list: {
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: DS_SPACING.lg,
    borderBottomWidth: DS_BORDERS.width,
    borderBottomColor: DS_COLORS.border,
  },
  rowContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
  },
  completedAt: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
});
