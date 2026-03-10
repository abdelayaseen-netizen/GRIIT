import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ChevronRight, Circle, CheckCircle2, Users, Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import Colors from "@/constants/colors";

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
  runStatus,
  teamSize,
  sharedGoalTarget,
  sharedGoalUnit,
  sharedGoalTotal,
}: ChallengeCardProps) {
  const router = useRouter();
  const isTeam = participationType === "team";
  const isSharedGoal = participationType === "shared_goal";

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
              <Users size={12} color={Colors.accent} />
              <Text style={styles.typeBadgeText}>Team{teamSize != null ? ` · ${teamSize} people` : ""}</Text>
            </View>
          )}
          {isSharedGoal && (
            <View style={styles.typeBadge}>
              <Target size={12} color={Colors.accent} />
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
                <CheckCircle2 size={18} color={Colors.streak.shield} fill={Colors.streak.shield} strokeWidth={0} />
              ) : (
                <Circle size={18} color={Colors.border} strokeWidth={2} />
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
        onPress={handleOpen}
        activeOpacity={0.85}
        testID={`open-challenge-${challengeId}`}
      >
        <Text style={styles.openButtonText}>Open Challenge</Text>
        <ChevronRight size={16} color={Colors.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  challengeName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    flex: 1,
  },
  progressBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent,
  },
  taskList: {
    gap: 8,
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskTitle: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  taskTitleCompleted: {
    color: Colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  moreTasks: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  openButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.accent,
  },
});
