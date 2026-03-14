import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, BookOpen, Users, ChevronRight, Flame } from "lucide-react-native";
import * as t from "@/src/theme/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: DS_COLORS.featuredLabelBg, text: DS_COLORS.featuredLabelText },
  Medium: { bg: DS_COLORS.difficultyMediumBg, text: DS_COLORS.difficultyMediumText },
  Hard: { bg: DS_COLORS.difficultyHardBg, text: DS_COLORS.difficultyHardText },
  Extreme: { bg: DS_COLORS.difficultyExtremeBg, text: DS_COLORS.difficultyExtremeText },
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
  onPressIn?: () => void;
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
    onPressIn,
  } = props;
  const { colors: themeColors } = useTheme();
  const diff = DIFF_STYLES[difficulty] ?? DIFF_STYLES.Medium;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: themeColors.card }]}
      onPressIn={onPressIn}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${title}, ${participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={[s.stripe, { backgroundColor: stripeColor }]} />
      <View style={s.content}>
        <View style={s.topRow}>
          <View style={[s.featuredBadge, { backgroundColor: DS_COLORS.accentSoft ?? DS_COLORS.featuredLabelBg }]}>
            <Flame size={12} color={DS_COLORS.accent} />
            <Text style={[s.featuredBadgeText, { color: DS_COLORS.accent }]}>FEATURED</Text>
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
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stripe: {
    width: 4,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    padding: 16,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: DS_COLORS.inputPlaceholder,
    lineHeight: 20,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: DS_COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS.inputPlaceholder,
    maxWidth: 120,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
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
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: DS_COLORS.textMuted,
  },
  activeToday: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.activeTodayText,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
