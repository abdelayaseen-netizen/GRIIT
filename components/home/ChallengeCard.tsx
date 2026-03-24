import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ChevronRight, Circle, CheckCircle2, Users, Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";
import { prefetchChallengeById } from "@/lib/prefetch-queries";

export interface TodayTaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface ChallengeCardProps {
  challengeId: string;
  challengeName: string;
  todayTaskProgress: string;
  todayTasks: TodayTaskItem[];
  onOpenChallenge?: () => void;
  participationType?: string;
  runStatus?: string;
  teamSize?: number;
  sharedGoalTarget?: number;
  sharedGoalUnit?: string;
  sharedGoalTotal?: number;
}

export default function ChallengeCard({
  challengeId,
  challengeName,
  todayTaskProgress,
  todayTasks,
  onOpenChallenge,
  participationType,
  runStatus: _runStatus,
  teamSize,
  sharedGoalTarget,
  sharedGoalUnit,
  sharedGoalTotal,
}: ChallengeCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isTeam = participationType === "team";
  const isSharedGoal = participationType === "shared_goal";

  const handlePressIn = useCallback(() => {
    void prefetchChallengeById(queryClient, challengeId);
  }, [challengeId, queryClient]);

  const handleOpen = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenChallenge?.();
    router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.challengeName} numberOfLines={1}>
          {challengeName}
        </Text>
        <Text style={styles.progressBadge}>{todayTaskProgress}</Text>
      </View>
      {(isTeam || isSharedGoal) && (
        <View style={styles.badgeRow}>
          {isTeam && (
            <View style={styles.typeBadge}>
              <Users size={12} color={DS_COLORS.accent} />
              <Text style={styles.typeBadgeText}>Team{teamSize != null ? ` · ${teamSize} people` : ""}</Text>
            </View>
          )}
          {isSharedGoal && (
            <View style={styles.typeBadge}>
              <Target size={12} color={DS_COLORS.accent} />
              <Text style={styles.typeBadgeText}>
                Shared Goal
                {sharedGoalTarget != null && sharedGoalUnit
                  ? ` · ${sharedGoalTotal ?? 0}/${sharedGoalTarget} ${sharedGoalUnit}`
                  : ""}
              </Text>
            </View>
          )}
        </View>
      )}
      {todayTasks.length > 0 && (
        <View style={styles.taskList}>
          {todayTasks.slice(0, 5).map((task) => (
            <View key={task.id} style={styles.taskRow}>
              {task.completed ? (
                <CheckCircle2 size={18} color={DS_COLORS.success} fill={DS_COLORS.success} strokeWidth={0} />
              ) : (
                <Circle size={18} color={DS_COLORS.border} strokeWidth={2} />
              )}
              <Text
                style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>
          ))}
          {todayTasks.length > 5 && (
            <Text style={styles.moreTasks}>+{todayTasks.length - 5} more</Text>
          )}
        </View>
      )}
      <TouchableOpacity
        style={styles.openButton}
        onPressIn={handlePressIn}
        onPress={handleOpen}
        activeOpacity={0.85}
        testID={`open-challenge-${challengeId}`}
        accessibilityRole="button"
        accessibilityLabel={`Open ${challengeName} challenge`}
      >
        <Text style={styles.openButtonText}>Open Challenge</Text>
        <ChevronRight size={16} color={DS_COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.button,
    padding: DS_SPACING.lg,
    marginBottom: DS_SPACING.md,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.md,
  },
  challengeName: {
    fontSize: DS_TYPOGRAPHY.body.fontSize + 1,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  progressBadge: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.accent,
    marginLeft: DS_SPACING.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.xs,
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: DS_SPACING.xs,
    borderRadius: DS_SPACING.sm,
    backgroundColor: DS_COLORS.accentSoft,
  },
  typeBadgeText: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.accent,
  },
  taskList: {
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.md,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  taskTitle: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  taskTitleCompleted: {
    color: DS_COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  moreTasks: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.xs,
    paddingVertical: 10,
  },
  openButtonText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600",
    color: DS_COLORS.accent,
  },
});
