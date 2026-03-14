import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Users, Target } from "lucide-react-native";
import * as t from "@/src/theme/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

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
}) {
  const {
    title,
    description,
    stripeColor,
    durationLabel,
    taskCount,
    participantsCount,
    statusDotColor,
    onPress,
    onPressIn,
    participationType,
    teamSize,
    sharedGoalTarget,
    sharedGoalUnit,
  } = props;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const isTeam = participationType === "team";
  const isSharedGoal = participationType === "shared_goal";
  const badgeLabel = isTeam && teamSize != null ? `Team · ${teamSize} people` : isSharedGoal && sharedGoalTarget != null && sharedGoalUnit ? `Shared Goal · ${sharedGoalTarget} ${sharedGoalUnit}` : null;
  const { colors: themeColors } = useTheme();
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
        <View style={s.header}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {statusDotColor != null && (
            <View style={[s.statusDot, { backgroundColor: statusDotColor }]} />
          )}
        </View>
        {badgeLabel && (
          <View style={s.badgeRow}>
            {isTeam ? <Users size={11} color={t.colors.textSecondary} /> : <Target size={11} color={t.colors.textSecondary} />}
            <Text style={s.badgeText}>{badgeLabel}</Text>
          </View>
        )}
        <Text style={s.desc} numberOfLines={1}>{description}</Text>
        <View style={s.meta}>
          <Text style={s.metaLeft}>
            {durationLabel} • {taskCount} tasks
          </Text>
          {participantsCount > 0 && (
            <Text style={s.metaRight}>{formatCount(participantsCount)} joined</Text>
          )}
        </View>
      </View>
      <View style={s.arrowWrap}>
        <ChevronRight size={t.iconSizes.arrowButton + 2} color={t.colors.textSecondary} />
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: t.colors.textSecondary,
  },
  desc: {
    fontSize: 14,
    color: DS_COLORS.inputPlaceholder,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  metaLeft: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.textMuted,
  },
  metaRight: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.textMuted,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
