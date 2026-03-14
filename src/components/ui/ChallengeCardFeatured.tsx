import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, BookOpen, Users, ChevronRight, Flame } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

const ACCENT_ORANGE = "#D2734A";
const MUTED_TEXT = "#7A7A6D";
const ACTIVE_TODAY_GREEN = "#16A34A";
const TASK_PILL_BG = "#F3F4F6";

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#DCFCE7", text: "#16A34A" },
  Medium: { bg: "#FEF9C3", text: "#CA8A04" },
  Hard: { bg: "#FEE2E2", text: "#DC2626" },
  Extreme: { bg: "#FEE2E2", text: "#991B1B" },
};

function getTaskEmoji(icon: string): string {
  const map: Record<string, string> = {
    timer: "⏱",
    photo: "📸",
    journal: "📝",
    run: "🏃",
    checkin: "📍",
    manual: "✓",
  };
  return map[icon] ?? "•";
}

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
      <View style={s.stripe} />
      <View style={s.content}>
        <View style={s.topRow}>
          <View style={s.featuredBadge}>
            <Flame size={12} color={ACCENT_ORANGE} />
            <Text style={s.featuredBadgeText}>FEATURED</Text>
          </View>
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        <Text style={s.desc} numberOfLines={1}>{description}</Text>
        <View style={s.chipsRow}>
          {tasksPreview.slice(0, 3).map((task, i) => (
            <View key={i} style={s.taskChip}>
              <Text style={s.taskChipText} numberOfLines={1}>{getTaskEmoji(task.icon)} {task.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.metaRow}>
          <View style={s.metaLeft}>
            <Calendar size={12} color={MUTED_TEXT} />
            <Text style={s.metaText}>{durationLabel}</Text>
            <Text style={s.metaDot}>·</Text>
            <BookOpen size={12} color={MUTED_TEXT} />
            <Text style={s.metaText}>{taskCount} tasks</Text>
            <Text style={s.metaDot}>·</Text>
            <Users size={12} color={MUTED_TEXT} />
            <Text style={s.metaText}>{formatCount(participantsCount)}</Text>
            {activeTodayCount > 0 && (
              <>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.activeToday}>{formatCount(activeTodayCount)} active today</Text>
              </>
            )}
          </View>
          <Text style={s.chevron}>&gt;</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stripe: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: ACCENT_ORANGE,
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
    borderRadius: 999,
    backgroundColor: "#FFF7ED",
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: ACCENT_ORANGE,
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
    color: "#2D3A2E",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: MUTED_TEXT,
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
    backgroundColor: TASK_PILL_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED_TEXT,
    maxWidth: 120,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "400",
    color: MUTED_TEXT,
  },
  metaDot: {
    fontSize: 12,
    color: MUTED_TEXT,
    marginHorizontal: 2,
  },
  activeToday: {
    fontSize: 13,
    fontWeight: "700",
    color: ACTIVE_TODAY_GREEN,
  },
  chevron: {
    fontSize: 16,
    fontWeight: "600",
    color: MUTED_TEXT,
  },
});
