import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, BookOpen, Users, ChevronRight } from "lucide-react-native";
import * as t from "@/src/theme/tokens";
import { useTheme } from "@/contexts/ThemeContext";

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: t.colors.badgeGreenBg, text: t.colors.badgeGreenText },
  Medium: { bg: t.colors.badgeYellowGreenBg, text: t.colors.badgeYellowGreenText },
  Hard: { bg: t.colors.badgeOrangeBg, text: t.colors.badgeOrangeText },
  Extreme: { bg: t.colors.badgeRedBg, text: t.colors.badgeRedText },
};

function ChallengeCardFeaturedInner(props: {
  title: string;
  description: string;
  difficulty: string;
  stripeColor: string;
  tasksPreview: { icon: string; label: string }[];
  durationLabel: string;
  taskCount: number;
  participantsCount: number;
  activeTodayCount: number;
  onPress: () => void;
}) {
  const {
    title,
    description,
    difficulty,
    stripeColor,
    tasksPreview,
    durationLabel,
    taskCount,
    participantsCount,
    activeTodayCount,
    onPress,
  } = props;
  const { colors: themeColors } = useTheme();
  const diff = DIFF_STYLES[difficulty] ?? DIFF_STYLES.Medium;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: themeColors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${title}, ${participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={[s.stripe, { backgroundColor: stripeColor }]} />
      <View style={s.content}>
        <View style={s.topRow}>
          <View style={[s.featuredBadge, { backgroundColor: "#FFF5F0" }]}>
            <Text style={[s.featuredBadgeText, { color: t.colors.accentOrange }]}>🔥 FEATURED</Text>
          </View>
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        <Text style={s.desc} numberOfLines={2}>{description}</Text>
        <View style={s.chipsRow}>
          {tasksPreview.slice(0, 3).map((task, i) => (
            <View key={i} style={s.taskChip}>
              <Text style={s.taskChipText} numberOfLines={1}>{task.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.metaRow}>
          <View style={s.metaLeft}>
            <View style={s.metaItem}>
              <Calendar size={t.iconSizes.cardMeta} color={t.colors.textSecondary} />
              <Text style={s.metaText}>{durationLabel}</Text>
            </View>
            <View style={s.metaDot} />
            <View style={s.metaItem}>
              <BookOpen size={t.iconSizes.cardMeta} color={t.colors.textSecondary} />
              <Text style={s.metaText}>{taskCount} tasks</Text>
            </View>
            {participantsCount > 0 && (
              <>
                <View style={s.metaDot} />
                <View style={s.metaItem}>
                  <Users size={t.iconSizes.cardMeta} color={t.colors.textSecondary} />
                  <Text style={s.metaText}>{formatCount(participantsCount)}</Text>
                </View>
              </>
            )}
            {activeTodayCount > 0 && (
              <>
                <View style={s.metaDot} />
                <Text style={s.activeToday}>{formatCount(activeTodayCount)} active today</Text>
              </>
            )}
          </View>
          <View style={s.arrowWrap}>
            <ChevronRight size={t.iconSizes.arrowButton + 2} color={t.colors.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ChallengeCardFeatured = React.memo(ChallengeCardFeaturedInner);

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.cardLarge,
    overflow: "hidden",
    ...t.borders.card,
    ...t.shadows.card,
  },
  stripe: {
    width: t.measures.stripeWidth,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    padding: t.spacing.cardPadding,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffText: {
    fontSize: t.typography.badgeLabel.fontSize,
    fontWeight: t.typography.badgeLabel.fontWeight,
  },
  title: {
    fontSize: t.typography.cardTitleLarge.fontSize,
    fontWeight: t.typography.cardTitleLarge.fontWeight,
    color: t.colors.textPrimary,
    marginBottom: 6,
  },
  desc: {
    fontSize: t.typography.cardDescription.fontSize,
    color: t.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: t.colors.textSecondary,
    maxWidth: 120,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: t.typography.metaRow.fontSize,
    fontWeight: t.typography.metaRow.fontWeight,
    color: t.colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: t.colors.textSecondary,
  },
  activeToday: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D8B4E",
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.colors.chipFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
