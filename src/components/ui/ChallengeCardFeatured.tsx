import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, BookOpen, Users, ChevronRight } from "lucide-react-native";
import * as t from "@/src/theme/tokens";
import { useTheme } from "@/contexts/ThemeContext";

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#EAF5F0", text: "#2F7A52" },
  Medium: { bg: "#FFF0E8", text: "#C85A20" },
  Hard: { bg: "#FFEAEA", text: "#C83030" },
  Extreme: { bg: "#FFE5E5", text: "#AA1111" },
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
          <View style={[s.featuredBadge, { backgroundColor: "#EAF5F0" }]}>
            <Text style={[s.featuredBadgeText, { color: "#2F7A52" }]}>FEATURED</Text>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E5DE",
    shadowColor: "#000",
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
    color: "#1A1A1A",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: "#888884",
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
    backgroundColor: "#F0EDE6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888884",
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
    color: "#AAAAAA",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#AAAAAA",
  },
  activeToday: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2F7A52",
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0EDE6",
    alignItems: "center",
    justifyContent: "center",
  },
});
