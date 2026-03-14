import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Calendar, BookOpen, Users } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

const COMPACT_LEFT_BORDER_COLORS = ["#8B5CF6", "#3B82F6", "#14B8A6", "#F97316", "#EC4899"];
const MUTED_TEXT = "#7A7A6D";
const DIFF_DOT_COLORS: Record<string, string> = {
  Easy: "#16A34A",
  Medium: "#CA8A04",
  Hard: "#DC2626",
  Extreme: "#991B1B",
};

function ChallengeRowCardInner(props: {
  title: string;
  description: string;
  stripeColor: string;
  durationLabel: string;
  taskCount: number;
  participantsCount: number;
  statusDotColor?: string;
  onPress: () => void;
  onPressIn?: () => void;
  participationType?: string;
  teamSize?: number;
  sharedGoalTarget?: number;
  sharedGoalUnit?: string;
  index?: number;
  difficulty?: string;
}) {
  const {
    title,
    description,
    durationLabel,
    taskCount,
    participantsCount,
    onPress,
    onPressIn,
    index = 0,
    difficulty = "medium",
  } = props;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const leftBorderColor = COMPACT_LEFT_BORDER_COLORS[index % 5];
  const dotColor = DIFF_DOT_COLORS[difficulty] ?? DIFF_DOT_COLORS.Medium;
  const { colors: themeColors } = useTheme();
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: themeColors.card, borderLeftColor: leftBorderColor }]}
      onPressIn={onPressIn}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${title}, ${participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <View style={[s.difficultyDot, { backgroundColor: dotColor }]} />
        </View>
        <Text style={s.desc} numberOfLines={1}>{description}</Text>
        <View style={s.meta}>
          <View style={s.metaLeft}>
            <Calendar size={12} color={MUTED_TEXT} />
            <Text style={s.metaLeftText}>{durationLabel} · {taskCount} tasks</Text>
          </View>
          <Text style={s.metaRight}>{formatCount(participantsCount)} joined</Text>
        </View>
      </View>
      <View style={s.arrowWrap}>
        <ChevronRight size={16} color={MUTED_TEXT} />
      </View>
    </TouchableOpacity>
  );
}

export const ChallengeRowCard = React.memo(ChallengeRowCardInner);

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3A2E",
    flex: 1,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  desc: {
    fontSize: 13,
    color: MUTED_TEXT,
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLeftText: {
    fontSize: 12,
    fontWeight: "400",
    color: MUTED_TEXT,
  },
  metaRight: {
    fontSize: 12,
    fontWeight: "400",
    color: MUTED_TEXT,
  },
  arrowWrap: {
    paddingRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
