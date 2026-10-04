import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track, trackEvent } from "@/lib/analytics";
import { inlineServerError } from "@/lib/inline-server-error";
import { gatesFor, gateTimeFor } from "@/backend/lib/task-model";
import { windowStateFor } from "@/backend/lib/task-time-gate";
import { getDailyTargetForChallengeTask } from "@/lib/task-progress";
import ActiveChallengeV3 from "@/components/challenge/ActiveChallengeV3";
import DayStickerSheet from "@/components/share/DayStickerSheet";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import {
  challengeDetailTodayCopy,
  challengeEnrollmentDone,
  challengeStickerProofFromTasks,
  othersLeftFromBootstrap,
} from "@/lib/challenge-today-copy";
import { detailLateJoinCard } from "@/lib/late-join";
import {
  RESET_NOTICE,
  activeEnrollmentNeedsRedirect,
  mapDifficulty,
  mapTaskType,
  requirePhotoAsked,
  securedTodayFromKeys,
  unitForTask,
  weekStripFilledForEnrollment,
  type ActiveChallengeTask,
} from "@/lib/active-challenge-ui";
import { dateKeyFromIso } from "@/lib/challenge-end";
import { calendarDayFromStartAt, homeDayTotal } from "@/lib/home-day-total";
import {
  enrollmentWeekDateKeys,
  freezeDetailCopy,
  peopleCardCopy,
  weekdayLetterForDateKey,
  weekSecuredOfDue,
} from "@/lib/g2a-challenge";
import { freezeRecoveryRow } from "@/lib/freeze-recovery";
import { FreezeSheet } from "@/components/home/FreezeSheet";
import { FREEZE_SUCCESS_INVALIDATES } from "@/lib/freeze-sheet";
import { inviteToChallenge } from "@/lib/share";
import { taskDisplayName } from "@/lib/home-proof-card";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";

type TaskRow = {
  id: string;
  title?: string | null;
  task_type?: string | null;
  order_index?: number | null;
  config?: Record<string, unknown> | null;
  require_photo?: boolean | null;
  require_location?: boolean | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
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
  participation_type?: string | null;
  challenge_tasks?: TaskRow[] | null;
};

type ActiveChallengeRow = {
  id: string;
  challenge_id: string;
  status?: string | null;
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
  const { profile, stats } = useApp();
  const { user } = useAuth();
  const bootstrap = useHomeBootstrap(user?.id);
  const profileTz = (profile as { timezone?: string | null })?.timezone;
  const todayKey = getTodayDateKey(profileTz);
  const yesterdayKey = getYesterdayDateKey(profileTz);

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
          id, challenge_id, status, current_day, start_at, started_at, created_at,
          challenges (
            id, title, description, duration_days, difficulty, is_hard_mode, participants_count, participation_type,
            challenge_tasks (
              id, title, task_type, order_index, config, require_photo, require_location,
              gate_time_mode, gate_time_start, gate_time_end,
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
    queryKey: ["checkins", "getTodayCheckins", id],
    queryFn: async () => {
      const rows = await trpcQuery(TRPC.checkins.getTodayCheckins, {
        activeChallengeId: id!,
      });
      return (Array.isArray(rows) ? rows : []) as CheckinRow[];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!id || !activeChallenge) return;
    if (!activeEnrollmentNeedsRedirect(activeChallenge.status)) return;
    const cid = activeChallenge.challenge_id;
    if (cid) router.replace(ROUTES.CHALLENGE_ID(cid) as never);
  }, [id, activeChallenge, router]);

  const { data: securedDateKeys = [] } = useQuery({
    queryKey: ["profiles", "getSecuredDateKeys", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
    enabled: !!id && !!user?.id,
    staleTime: 60 * 1000,
  });

  const currentDay =
    typeof activeChallenge?.current_day === "number" && activeChallenge.current_day > 0
      ? activeChallenge.current_day
      : 1;
  const challenge = activeChallenge?.challenges;
  const challengeId = challenge?.id ?? activeChallenge?.challenge_id ?? "";
  const enrollmentDuration =
    challenge?.duration_days && challenge.duration_days > 0 ? challenge.duration_days : 1;
  const durationDays = homeDayTotal(challenge?.duration_days) ?? enrollmentDuration;
  const title = challenge?.title?.trim() || "Challenge";
  const description = challenge?.description?.trim() || undefined;
  const participantsCount =
    typeof challenge?.participants_count === "number" ? challenge.participants_count : 0;
  const participationType =
    challenge?.participation_type === "team"
      ? "team"
      : challenge?.participation_type === "duo"
        ? "duo"
        : "solo";
  const difficulty = mapDifficulty({
    isHardMode: challenge?.is_hard_mode,
    difficulty: challenge?.difficulty,
  });
  const streakDays = (stats as { activeStreak?: number })?.activeStreak ?? 0;
  const startIso =
    activeChallenge?.start_at ?? activeChallenge?.started_at ?? activeChallenge?.created_at ?? null;
  const startDateKey = startIso
    ? dateKeyFromIso(String(startIso), profileTz ?? "UTC")
    : todayKey;
  const weekKeys = useMemo(
    () => enrollmentWeekDateKeys(startDateKey, todayKey),
    [startDateKey, todayKey],
  );
  const keys = Array.isArray(securedDateKeys) ? securedDateKeys : [];
  const securedToday =
    todayKey >= startDateKey && securedTodayFromKeys(keys, todayKey);
  const weekSecured = weekStripFilledForEnrollment({
    securedDateKeys: keys,
    weekDateKeys: weekKeys,
    startDateKey,
    todayKey,
  });
  const todayIndex = Math.max(0, weekKeys.indexOf(todayKey));
  const shownDay = calendarDayFromStartAt(startIso, profileTz ?? "UTC", todayKey, durationDays);

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
    return rawTasks.map((row) => {
      const taskType = mapTaskType(row.task_type);
      const targets = getDailyTargetForChallengeTask(row, currentDay, enrollmentDuration);
      const cin = checkinByTask.get(row.id);
      const cfg = row.config;
      return {
        id: row.id,
        title: taskDisplayName({
          title: row.title,
          type: taskType,
          targetValue: targets.targetValue,
          targetUnit: unitForTask(taskType, cfg),
          durationMinutes: targets.durationMinutes,
          requirePhoto: requirePhotoAsked({
            taskType,
            requirePhoto: row.require_photo,
            config: cfg,
          }),
        }),
        task_type: taskType,
        duration_minutes: targets.durationMinutes ?? undefined,
        target_value: targets.targetValue ?? undefined,
        unit: unitForTask(taskType, cfg),
        require_photo: requirePhotoAsked({
          taskType,
          requirePhoto: row.require_photo,
          config: cfg,
        }),
        gates: gatesFor(row),
        gateTime: gateTimeFor(row),
        windowState: windowStateFor(row, profileTz ?? "UTC"),
        completed_today: Boolean(cin),
        verified: Boolean(cin && proofUrl(cin)),
        proof_photo_url: cin ? proofUrl(cin) : null,
      };
    });
  }, [rawTasks, checkinByTask, currentDay, enrollmentDuration, profileTz]);

  const thisDone = challengeEnrollmentDone(tasks);
  const todayCopy = challengeDetailTodayCopy({
    thisDone,
    daySecured: securedToday,
    others: othersLeftFromBootstrap(
      bootstrap.data?.activeChallenges,
      bootstrap.data?.todayCheckinsForUser,
      id ?? "",
    ),
  });
  const stickerProof = challengeStickerProofFromTasks(
    tasks.map((t) => ({
      completed_today: t.completed_today,
      require_photo: t.require_photo,
      hasCameraProof: Boolean(t.proof_photo_url) || t.verified === true,
      gates: t.gates,
    })),
  );

  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [shareTodayOpen, setShareTodayOpen] = useState(false);
  const [showFreezeSheet, setShowFreezeSheet] = useState(false);
  const [freezeError, setFreezeError] = useState<string | null>(null);
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
    if (!challengeId || !id) return;
    setLeaveConfirmVisible(false);
    try {
      await trpcMutate(TRPC.challenges.leave, { challengeId, activeChallengeId: id });
      try {
        track({ name: "challenge_left", challenge_id: challengeId });
      } catch {
        /* non-fatal */
      }
      const dropLeft = (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r: { id?: string }) => r.id !== id);
      };
      queryClient.setQueriesData({ queryKey: ["challenge", "listMyActive"] }, dropLeft);
      queryClient.setQueriesData({ queryKey: ["discover", "myActive"] }, dropLeft);
      await queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
      await queryClient.invalidateQueries({ queryKey: ["challenge", "listMyActive"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["activeChallenge", id] });
      await queryClient.invalidateQueries({ queryKey: ["discover", "myActive"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles", "getRecord"] });
      await queryClient.invalidateQueries({ queryKey: ["challenge", "endedEnrollment"] });
      router.replace(ROUTES.TABS_HOME as never);
    } catch (err) {
      captureError(err, "ActiveChallengeLeaveChallenge");
      showLeaveError(inlineServerError(err));
    }
  }, [challengeId, id, queryClient, router, showLeaveError, user?.id]);

  const handleShare = useCallback(() => {
    setShareTodayOpen(true);
  }, []);
  const todayProofUri = useMemo(() => {
    for (const row of checkins) {
      const url = proofUrl(row);
      if (url) return url;
    }
    return undefined;
  }, [checkins]);

  const weekMeta = weekSecuredOfDue({
    weekKeys,
    securedDateKeys: keys,
    todayKey,
    startDateKey,
    durationDays,
    todaySecured: securedToday,
  });
  const freezeRemaining = bootstrap.data?.freezeStatus?.remaining ?? 0;
  const idleFreeze = freezeDetailCopy({
    remaining: freezeRemaining,
    lastFreezeUsedAt: bootstrap.data?.freezeStatus?.lastFreezeUsedAt,
    hardMode: difficulty === "hard",
    timeZone: profileTz ?? "UTC",
  });
  const recovery = freezeRecoveryRow({
    hardMode: difficulty === "hard",
    freezesRemaining: freezeRemaining,
    missDateKey: yesterdayKey,
    todayKey,
    securedDateKeys: keys,
    frozenDateKeys: (stats as { frozenDateKeys?: string[] } | null)?.frozenDateKeys,
    timeZone: profileTz ?? "UTC",
  });
  const freezeRow = recovery
    ? {
        title: recovery.title,
        caption: recovery.caption,
        icon: "snowflake" as const,
        actionLabel: recovery.actionLabel,
      }
    : idleFreeze;
  const vis = String((challenge as { visibility?: string | null } | undefined)?.visibility ?? "").toLowerCase();
  const people = peopleCardCopy({
    memberCount: participantsCount,
    privateOrSolo: participationType === "solo" || vis === "private",
    challengeTitle: title,
  });
  const weekDaysOverride = weekKeys.map((key, i) => ({
    letter: weekdayLetterForDateKey(key),
    filled: weekSecured[i] === true,
  }));

  const useFreeze = useMutation({
    mutationKey: ["streaks", "useFreeze", user?.id ?? "", "detail"],
    mutationFn: () =>
      trpcMutate<{ restoredStreak: number; remaining: number }>(TRPC.streaks.useFreeze, {
        dateKeyToFreeze: yesterdayKey,
      }),
    onSuccess: () => {
      setShowFreezeSheet(false);
      setFreezeError(null);
      for (const queryKey of FREEZE_SUCCESS_INVALIDATES) {
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      }
      void queryClient.invalidateQueries({ queryKey: ["profiles", "getSecuredDateKeys"] });
    },
    onError: (err) => {
      captureError(err, "useFreeze.detail");
      setFreezeError(inlineServerError(err));
    },
  });

  const handleInvite = useCallback(() => {
    void inviteToChallenge({ name: title, id: challengeId || title });
  }, [title, challengeId]);

  const handleParticipants = useCallback(() => {
    if (!challengeId) return;
    if (participationType === "team") {
      router.push(ROUTES.CHALLENGE_MEMBERS(challengeId) as never);
      return;
    }
    router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
  }, [challengeId, participationType, router]);

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
          securedToday={securedToday}
          streakDays={streakDays}
          weekSecured={weekSecured}
          todayIndex={todayIndex}
          participantsCount={participantsCount}
          participationType={participationType}
          description={description}
          resetNotice={RESET_NOTICE}
          loading={isLoading && !activeChallenge}
          error={Boolean(error) || (!isLoading && !activeChallenge)}
          refreshing={isRefetching}
          prestartCard={
            startIso && startDateKey > todayKey
              ? detailLateJoinCard(String(startIso), profileTz ?? "UTC")
              : null
          }
          onRefresh={() => void refetch()}
          onBack={goBack}
          onMore={handleLeaveChallenge}
          onRetry={() => void refetch()}
          onTask={openTask}
          onParticipants={handleParticipants}
          onShare={thisDone ? handleShare : undefined}
          showShareToday={todayCopy.showShareToday}
          todayStatus={todayCopy.status}
          todaySub={todayCopy.sub}
          weekLine={weekMeta.line}
          weekDaysOverride={weekDaysOverride}
          freezeRow={freezeRow}
          onUseFreeze={recovery ? () => {
            setFreezeError(null);
            setShowFreezeSheet(true);
          } : undefined}
          people={people}
          onInvite={people.showInvite ? handleInvite : undefined}
        />
        <DayStickerSheet
          visible={shareTodayOpen && thisDone}
          onDismiss={() => setShareTodayOpen(false)}
          username={profile?.username}
          streak={streakDays}
          challenges={
            thisDone && stickerProof
              ? [
                  {
                    id: id ?? title,
                    name: title,
                    day: shownDay,
                    dayTotal: durationDays,
                    photoCount: todayProofUri ? 1 : 0,
                    proof: stickerProof,
                    stickerKind: "challenge",
                  },
                ]
              : []
          }
          preselectedId={id ?? title}
          proofUri={todayProofUri}
        />
        <FreezeSheet
          visible={showFreezeSheet}
          remaining={freezeRemaining}
          lastFreezeUsedAt={bootstrap.data?.freezeStatus?.lastFreezeUsedAt ?? null}
          timeZone={profileTz ?? "UTC"}
          subscriptionStatus={(profile as { subscription_status?: string | null } | null)?.subscription_status}
          submitting={useFreeze.isPending}
          error={freezeError}
          onUseFreeze={() => {
            setFreezeError(null);
            useFreeze.mutate();
          }}
          onRefuse={() => {
            setShowFreezeSheet(false);
            setFreezeError(null);
          }}
          onSeePro={() => {
            setShowFreezeSheet(false);
            setFreezeError(null);
            router.push(ROUTES.PAYWALL as never);
          }}
          onClose={() => {
            setShowFreezeSheet(false);
            setFreezeError(null);
          }}
        />
        <Sheet
          visible={leaveConfirmVisible}
          onDismiss={() => setLeaveConfirmVisible(false)}
          heading={`Leave ${title}?`}
          footer={
            <>
              <Button
                label="Leave"
                destructive
                onPress={() => void confirmLeaveChallenge()}
              />
              <Button
                label="Cancel"
                variant="tertiary"
                onPress={() => setLeaveConfirmVisible(false)}
              />
            </>
          }
        >
          <Text style={styles.sheetBody}>
            It moves to Finished as left on day {shownDay}. Your proofs stay on the record.
          </Text>
        </Sheet>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  sheetBody: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
