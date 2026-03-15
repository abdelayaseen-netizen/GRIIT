import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Calendar } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

const MUTED_TEXT = DS_COLORS.textSecondary;
const DIFF_DOT_COLORS: Record<string, string> = {
  Easy: DS_COLORS.success,
  Medium: "#F5A623",
  Hard: DS_COLORS.accent,
  Extreme: DS_COLORS.danger,
};
const DIFF_BORDER_COLORS: Record<string, string> = {
  Easy: DS_COLORS.success,
  Medium: "#F5A623",
  Hard: DS_COLORS.accent,
  Extreme: DS_COLORS.danger,
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
    difficulty = "medium",
  } = props;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const leftBorderColor = props.stripeColor ?? DIFF_BORDER_COLORS[difficulty] ?? DS_COLORS.accent;
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
          <View style={[s.difficultyDot, { backgroundColor: dotColor }]} accessibilityLabel={`Difficulty: ${difficulty}`} />
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
        <ChevronRight size={18} color={DS_COLORS.textSecondary} />
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
    alignSelf: "center",
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
