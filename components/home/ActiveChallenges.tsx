import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import ChallengeCard, { TodayTaskItem } from "./ChallengeCard";
import EmptyChallengesCard from "./EmptyChallengesCard";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import type { TodayCheckinForUser } from "@/types";
import { captureError } from "@/lib/sentry";

interface TaskFromApi {
  id: string;
  title?: string | null;
  type?: string;
  required?: boolean;
}

interface ActiveChallengeItem {
  id: string;
  challenge_id: string;
  challenges: {
    id: string;
    title?: string | null;
    challenge_tasks?: TaskFromApi[];
  } | null;
}

function getRequiredTasks(tasks: TaskFromApi[] | null | undefined): TaskFromApi[] {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => t.required !== false);
}

export interface ChallengeWithProgress {
  activeChallengeId: string;
  challengeId: string;
  challengeName: string;
  todayTaskProgress: string;
  todayTasks: TodayTaskItem[];
  currentDay?: number;
  durationDays?: number;
  participationType?: string;
  runStatus?: string;
  teamSize?: number;
  sharedGoalTarget?: number;
  sharedGoalUnit?: string;
  sharedGoalTotal?: number;
}

interface ActiveChallengesProps {
  /** If provided, use this data instead of fetching (e.g. from parent home page). */
  challengesWithProgress?: ChallengeWithProgress[] | null;
  /** When using controlled data, parent can trigger refetch (e.g. refreshKey). */
  refreshKey?: number;
}

export default function ActiveChallenges({ challengesWithProgress: controlledList, refreshKey }: ActiveChallengesProps = {}) {
  const [activeList, setActiveList] = useState<ActiveChallengeItem[] | null>(null);
  const [todayCheckins, setTodayCheckins] = useState<TodayCheckinForUser[]>([]);
  const [isLoading, setIsLoading] = useState(controlledList == null);

  useEffect(() => {
    if (controlledList != null) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [list, checkins] = await Promise.all([
          trpcQuery(TRPC.challenges.listMyActive) as Promise<ActiveChallengeItem[] | null>,
          trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<TodayCheckinForUser[]>,
        ]);
        if (!cancelled) {
          setActiveList(Array.isArray(list) ? list : []);
          setTodayCheckins(Array.isArray(checkins) ? checkins : []);
        }
      } catch (err) {
        captureError(err, "ActiveChallengesLoad");
        console.error("[ActiveChallenges] load failed:", err);
        if (!cancelled) setActiveList([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [controlledList, refreshKey]);

  const checkinsByAcId = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const c of todayCheckins) {
      const acId = c.active_challenge_id;
      let setForAc = map[acId];
      if (!setForAc) {
        setForAc = new Set();
        map[acId] = setForAc;
      }
      if (c.status === "completed") setForAc.add(c.task_id);
    }
    return map;
  }, [todayCheckins]);

  const challengesWithProgress = useMemo(() => {
    if (controlledList != null) return controlledList;
    const list = activeList ?? [];
    return list.map((ac) => {
      const challenge = ac.challenges;
      const tasks = challenge?.challenge_tasks ?? [];
      const required = getRequiredTasks(tasks);
      const completedSet = checkinsByAcId[ac.id] ?? new Set();
      const todayTasks: TodayTaskItem[] = required.map((t) => ({
        id: t.id,
        title: t.title ?? t.type ?? "Task",
        completed: completedSet.has(t.id),
      }));
      const completedCount = todayTasks.filter((t) => t.completed).length;
      const total = required.length;
      const progressStr = total > 0 ? `${completedCount}/${total}` : "0/0";
      const participationType = (challenge as { participation_type?: string } | null)?.participation_type;
      const runStatus = (challenge as { run_status?: string } | null)?.run_status;
      const teamSize = (challenge as { team_size?: number } | null)?.team_size;
      const sharedGoalTarget = (challenge as { shared_goal_target?: number } | null)?.shared_goal_target;
      const sharedGoalUnit = (challenge as { shared_goal_unit?: string } | null)?.shared_goal_unit;
      return {
        activeChallengeId: ac.id,
        challengeId: challenge?.id ?? ac.challenge_id,
        challengeName: challenge?.title ?? "Challenge",
        todayTaskProgress: progressStr,
        todayTasks,
        participationType,
        runStatus,
        teamSize,
        sharedGoalTarget,
        sharedGoalUnit,
        sharedGoalTotal: undefined,
      };
    });
  }, [controlledList, activeList, checkinsByAcId]);

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active challenges</Text>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={DS_COLORS.accent} />
        </View>
      </View>
    );
  }

  if (challengesWithProgress.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active challenges</Text>
        <EmptyChallengesCard />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active challenges</Text>
      {challengesWithProgress.map((item) => (
        <ChallengeCard
          key={item.activeChallengeId}
          challengeId={item.challengeId}
          challengeName={item.challengeName}
          todayTaskProgress={item.todayTaskProgress}
          todayTasks={item.todayTasks}
          participationType={item.participationType}
          runStatus={item.runStatus}
          teamSize={item.teamSize}
          sharedGoalTarget={item.sharedGoalTarget}
          sharedGoalUnit={item.sharedGoalUnit}
          sharedGoalTotal={item.sharedGoalTotal}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: DS_SPACING.xl,
  },
  sectionTitle: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize - 2,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.md,
  },
  loadingWrap: {
    paddingVertical: DS_SPACING.xxl,
    alignItems: "center",
  },
});
