import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track, trackEvent } from "@/lib/analytics";
import { inlineServerError } from "@/lib/inline-server-error";
import { shareChallenge } from "@/lib/share";
import { getDailyTargetForChallengeTask } from "@/lib/task-progress";
import ActiveChallengeV3 from "@/components/challenge/ActiveChallengeV3";
import {
  RESET_NOTICE,
  mapDifficulty,
  mapTaskType,
  requirePhotoAsked,
  unitForTask,
  type ActiveChallengeTask,
} from "@/lib/active-challenge-ui";
import { displayDay } from "@/lib/challenge-day";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { invalidateToday, useToday } from "@/hooks/useToday";
import { weekStrip } from "@/lib/today-derive";
import { EMPTY_TODAY } from "@/lib/today-state";

type TaskRow = {
  id: string;
  title?: string | null;
  task_type?: string | null;
  order_index?: number | null;
  config?: Record<string, unknown> | null;
  require_photo?: boolean | null;
  min_duration_minutes?: number | null;
  target_mode?: string | null;
  start_value?: number | null;
  start_duration_minutes?: number | null;
};

type ChallengeRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  duration_days?: number | null;
  difficulty?: string | null;
  is_hard_mode?: boolean | null;
  participants_count?: number | null;
  challenge_tasks?: TaskRow[] | null;
};

type ActiveChallengeRow = {
  id: string;
  challenge_id: string;
  current_day?: number | null;
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  challenges?: ChallengeRow | null;
};

type CheckinRow = {
  task_id: string;
  status: string;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
};

function proofUrl(row: CheckinRow): string | null {
  const u = row.photo_url || row.proof_url || row.completion_image_url;
  return typeof u === "string" && u.trim() ? u.trim() : null;
}

export default function ActiveChallengeDetailScreen() {
  const { activeChallengeId } = useLocalSearchParams<{ activeChallengeId: string }>();
  const id =
    typeof activeChallengeId === "string"
      ? activeChallengeId
      : Array.isArray(activeChallengeId)
        ? activeChallengeId[0]
        : undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { stats } = useApp();
  const { user } = useAuth();
  const todayQuery = useToday();
  const todayState = todayQuery.data ?? EMPTY_TODAY;
  const enrollment = todayState.enrollments.find((e) => e.active_challenge_id === id);
  const enrollmentSecured = enrollment?.secured_today === true;
  const userSecured = todayState.secured;
  const week = weekStrip(todayState);

  const {
    data: activeChallenge,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeChallenge", id],
    queryFn: async (): Promise<ActiveChallengeRow | null> => {
      const { data, error: err } = await supabase
        .from("active_challenges")
        .select(
          `
          id, challenge_id, current_day, start_at, started_at, created_at,
          challenges (
            id, title, description, duration_days, difficulty, is_hard_mode, participants_count,
            challenge_tasks (
              id, title, task_type, order_index, config, require_photo,
              min_duration_minutes, target_mode, start_value, start_duration_minutes
            )
          )
        `
        )
        .eq("id", id!)
        .single();
      if (err) throw err;
      if (!data) return null;
      const row = data as unknown as ActiveChallengeRow & { challenges?: ChallengeRow | ChallengeRow[] | null };
      const ch = row.challenges;
      return {
        ...row,
        challenges: Array.isArray(ch) ? (ch[0] ?? null) : (ch ?? null),
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: checkins = [] } = useQuery({
    queryKey: ["check_ins", "today", id, todayState.date_key || "UTC"],
    queryFn: async () => {
      const dateKey = todayState.date_key;
      const { data, error: err } = await supabase
        .from("check_ins")
        .select("task_id, status, photo_url, proof_url, completion_image_url")
        .eq("active_challenge_id", id!)
        .eq("date_key", dateKey);
      if (err) throw err;
      return (data ?? []) as CheckinRow[];
    },
    enabled: !!id && Boolean(todayState.date_key),
    staleTime: 5 * 60 * 1000,
  });

  const currentDay =
    typeof enrollment?.current_day === "number" && enrollment.current_day > 0
      ? enrollment.current_day
      : typeof activeChallenge?.current_day === "number" && activeChallenge.current_day > 0
        ? activeChallenge.current_day
        : 1;
  const challenge = activeChallenge?.challenges;
  const challengeId = challenge?.id ?? activeChallenge?.challenge_id ?? "";
  const durationDays =
    challenge?.duration_days && challenge.duration_days > 0 ? challenge.duration_days : 1;
  const title = challenge?.title?.trim() || "Challenge";
  const description = challenge?.description?.trim() || undefined;
  const participantsCount =
    typeof challenge?.participants_count === "number" ? challenge.participants_count : 0;
  const difficulty = mapDifficulty({
    isHardMode: challenge?.is_hard_mode,
    difficulty: challenge?.difficulty,
  });
  const streakDays = todayState.streak || (stats as { activeStreak?: number })?.activeStreak || 0;
  const shownDay = displayDay(currentDay, enrollmentSecured);

  const taskSkippedTracked = useRef(false);
  useEffect(() => {
    if (!activeChallenge || taskSkippedTracked.current) return;
    const joinedAt = new Date(
      activeChallenge.started_at ?? activeChallenge.start_at ?? activeChallenge.created_at ?? 0
    );
    if (Number.isNaN(joinedAt.getTime())) return;
    const daysSinceJoin = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
    const dbDay = currentDay;
    if (daysSinceJoin > dbDay) {
      taskSkippedTracked.current = true;
      try {
        trackEvent("task_skipped", {
          challenge_id: challengeId || activeChallenge.challenge_id,
          missed_days: Math.max(0, daysSinceJoin - dbDay),
        });
      } catch {
        /* non-fatal */
      }
    }
  }, [activeChallenge, currentDay, challengeId]);

  const checkinByTask = useMemo(() => {
    const map = new Map<string, CheckinRow>();
    for (const c of checkins) {
      if (c.status === "completed") map.set(c.task_id, c);
    }
    return map;
  }, [checkins]);

  const rawTasks = useMemo(() => {
    const raw = challenge?.challenge_tasks ?? [];
    return [...raw].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [challenge?.challenge_tasks]);

  const tasks: ActiveChallengeTask[] = useMemo(() => {
    const doneById = new Map((enrollment?.tasks ?? []).map((t) => [t.id, t.done]));
    return rawTasks.map((row) => {
      const taskType = mapTaskType(row.task_type);
      const targets = getDailyTargetForChallengeTask(row, currentDay, durationDays);
      const cin = checkinByTask.get(row.id);
      const cfg = row.config;
      return {
        id: row.id,
        title: (row.title ?? "").trim() || "Task",
        task_type: taskType,
        duration_minutes: targets.durationMinutes ?? undefined,
        target_value: targets.targetValue ?? undefined,
        unit: unitForTask(taskType, cfg),
        require_photo: requirePhotoAsked({
          taskType,
          requirePhoto: row.require_photo,
          config: cfg,
        }),
        completed_today: doneById.get(row.id) ?? Boolean(cin),
        verified: Boolean(cin && proofUrl(cin)),
        proof_photo_url: cin ? proofUrl(cin) : null,
      };
    });
  }, [rawTasks, checkinByTask, currentDay, durationDays, enrollment?.tasks]);

  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const { error: leaveError, showError: showLeaveError, clearError: clearLeaveError } =
    useInlineError();

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const openTask = useCallback(
    (task: ActiveChallengeTask) => {
      if (!id) return;
      const row = rawTasks.find((t) => t.id === task.id);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push({
        pathname: ROUTES.TASK_COMPLETE,
        params: {
          taskId: task.id,
          activeChallengeId: id,
          taskType: row?.task_type ?? task.task_type,
          taskName: task.title,
          taskDescription: "",
          taskConfig: buildTaskConfigParam((row ?? task) as unknown as Record<string, unknown>),
          currentDay: String(shownDay),
          durationDays: String(durationDays),
          challengeName: title,
        },
      } as never);
    },
    [id, rawTasks, router, shownDay, durationDays, title]
  );

  const handleLeaveChallenge = useCallback(() => {
    if (!challengeId) return;
    clearLeaveError();
    setLeaveConfirmVisible(true);
  }, [challengeId, clearLeaveError]);

  const confirmLeaveChallenge = useCallback(async () => {
    if (!challengeId) return;
    setLeaveConfirmVisible(false);
    try {
      await trpcMutate(TRPC.challenges.leave, { challengeId });
      try {
        track({ name: "challenge_left", challenge_id: challengeId });
      } catch {
        /* non-fatal */
      }
      await queryClient.invalidateQueries({ queryKey: ["home"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      await invalidateToday(queryClient);
      router.replace(ROUTES.TABS_HOME as never);
    } catch (err) {
      captureError(err, "ActiveChallengeLeaveChallenge");
      showLeaveError(inlineServerError(err));
    }
  }, [challengeId, queryClient, router, showLeaveError, user?.id]);

  const handleShare = useCallback(() => {
    if (!challengeId) return;
    void shareChallenge({
      name: title,
      duration: durationDays,
      id: challengeId,
      tasksPerDay: tasks.length,
    });
  }, [challengeId, title, durationDays, tasks.length]);

  const handleParticipants = useCallback(() => {
    if (!challengeId) return;
    router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
  }, [challengeId, router]);

  if (!id) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActiveChallengeV3
          title="Challenge"
          durationDays={1}
          currentDay={1}
          difficulty="standard"
          tasks={[]}
          securedToday={false}
          streakDays={0}
          weekSecured={[false, false, false, false, false, false, false]}
          todayIndex={0}
          participantsCount={0}
          error
          onBack={goBack}
          onRetry={goBack}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        {leaveError ? <InlineError message={leaveError} onDismiss={clearLeaveError} /> : null}
        <ActiveChallengeV3
          title={title}
          durationDays={durationDays}
          currentDay={shownDay}
          difficulty={difficulty}
          tasks={tasks}
          securedToday={userSecured}
          streakDays={streakDays}
          weekSecured={week.secured}
          todayIndex={week.todayIndex}
          participantsCount={participantsCount}
          description={description}
          resetNotice={RESET_NOTICE}
          loading={isLoading && !activeChallenge}
          error={Boolean(error) || (!isLoading && !activeChallenge)}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onBack={goBack}
          onMore={handleLeaveChallenge}
          onRetry={() => void refetch()}
          onTask={openTask}
          onParticipants={handleParticipants}
          onShare={handleShare}
        />
        <ConfirmDialog
          visible={leaveConfirmVisible}
          title={`Leave ${title}?`}
          message="Your progress in this challenge will be lost. You'll need to rejoin to start again."
          confirmLabel="Leave"
          destructive
          onCancel={() => setLeaveConfirmVisible(false)}
          onConfirm={() => void confirmLeaveChallenge()}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
});
