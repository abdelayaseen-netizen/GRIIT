import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { useReconcileStreakIfNeeded } from "@/lib/use-reconcile-streak";
import { ROUTES } from "@/lib/routes";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import LiveFeedSection from "@/components/LiveFeedSection";
import { HomeV3, greetingTitle } from "@/components/home/HomeV3";
import { selectHomeProofCard } from "@/lib/home-proof-card";
import { hasCameraProof } from "@/lib/active-challenge-ui";
import { proofPhotoUrlFromCheckIn } from "@/backend/lib/proof-predicate";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { type StreakHeroV4Task } from "@/components/home/StreakHeroV4";
import { homeStreakLine, resolveDisplayedStreak, resolveHomeStatsReady, resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { DS_V3 } from "@/lib/design-system";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useFeedToggle } from "@/store/feedToggleStore";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { getTodayDateKey, getYesterdayDateKey, getCurrentWeekDateKeys } from "@/lib/date-utils";
import { displayDay } from "@/lib/challenge-day";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";
import { JeopardyModal } from "@/components/home/JeopardyModal";
import { nextProfileV2Badge } from "@/lib/profile-v2-badges";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

type TaskRow = {
  id: string;
  title?: string;
  type?: string;
  required?: boolean;
  duration_minutes?: number | null;
  require_photo?: boolean;
  gates?: import("@/backend/lib/task-model").TaskGate[];
  gateTime?: import("@/backend/lib/task-model").GateTime | null;
  windowState?: import("@/backend/lib/task-time-gate").WindowState;
  minutesLeft?: number | null;
  config?: { required?: boolean } & Record<string, unknown>;
};
type ActiveRow = {
  id: string;
  challenge_id: string;
  current_day?: number;
  challenges?: {
    id?: string;
    title?: string;
    duration_days?: number;
    challenge_tasks?: TaskRow[];
  };
};

function durationMinutesFromTask(t: TaskRow): number | undefined {
  if (typeof t.duration_minutes === "number" && t.duration_minutes > 0) return t.duration_minutes;
  const fromCfg = t.config?.duration_minutes;
  if (typeof fromCfg === "number" && fromCfg > 0) return fromCfg;
  return undefined;
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile: contextProfile } = useApp();
  const [showFreezeModal, setShowFreezeModal] = React.useState(false);
  const [showJeopardyModal, setShowJeopardyModal] = React.useState(false);

  const feedScope = useFeedToggle((s) => s.scope);
  const setFeedScope = useFeedToggle((s) => s.setScope);
  const initFeedToggle = useFeedToggle((s) => s.initIfFirstRun);

  const bootstrap = useHomeBootstrap(isGuest ? undefined : user?.id);
  const profile = (bootstrap.data?.profile ?? contextProfile) as typeof contextProfile;
  const freezeStatus = bootstrap.data?.freezeStatus ?? null;
  const followCounts = bootstrap.data?.followCounts ?? null;
  const statsFailed = bootstrap.data?.failed.includes("stats") === true;
  const securedDateKeys = useMemo(
    () => (Array.isArray(bootstrap.data?.securedDateKeys) ? bootstrap.data.securedDateKeys : []),
    [bootstrap.data?.securedDateKeys],
  );

  React.useEffect(() => {
    initFeedToggle(followCounts?.following ?? 0);
  }, [followCounts?.following, initFeedToggle]);

  useReconcileStreakIfNeeded({
    enabled: !isGuest && !!user?.id,
    ready: bootstrap.isSuccess,
    userId: user?.id,
    stats: bootstrap.data?.stats ?? stats ?? null,
    securedDateKeys: bootstrap.data?.securedDateKeys ?? null,
  });

  const heroTasks: StreakHeroV4Task[] = useMemo(() => {
    const activeList = (Array.isArray(bootstrap.data?.activeChallenges)
      ? bootstrap.data.activeChallenges
      : []) as ActiveRow[];
    const checkins = (Array.isArray(bootstrap.data?.todayCheckinsForUser)
      ? bootstrap.data.todayCheckinsForUser
      : []) as {
      active_challenge_id?: string;
      task_id?: string;
      status?: string;
      verification_status?: string | null;
      verified?: boolean | null;
      photo_url?: string | null;
      proof_url?: string | null;
      completion_image_url?: string | null;
      proof_photo_url?: string | null;
    }[];
    const flat: StreakHeroV4Task[] = [];

    for (const ac of activeList) {
      const tasks = ac.challenges?.challenge_tasks ?? [];
      const required = tasks.filter((t) => {
        const cfg = t.config as { required?: boolean } | undefined;
        return (cfg?.required ?? true) === true;
      });
      const doneRows = checkins.filter(
        (c) => c.active_challenge_id === ac.id && c.status === "completed",
      );
      const doneSet = new Set(doneRows.map((c) => c.task_id));
      const proofByTask = new Map(
        doneRows.map((c) => [
          String(c.task_id),
          hasCameraProof({
            verified: c.verified === true,
            proof_photo_url: c.proof_photo_url ?? proofPhotoUrlFromCheckIn(c),
          }),
        ]),
      );
      const challengeName = ac.challenges?.title ?? "Challenge";
      const currentDay = ac.current_day ?? 1;
      const durationDays = ac.challenges?.duration_days ?? 14;
      const challengeSecuredToday =
        required.length > 0 && required.every((t) => doneSet.has(t.id));

      for (const t of required) {
        const tType = String(t.type ?? "manual").toLowerCase();
        flat.push({
          id: t.id,
          name: t.title ?? t.type ?? "Task",
          description: challengeName,
          proofType: tType.includes("photo") ? "photo" : "text",
          done: doneSet.has(t.id),
          activeChallengeId: ac.id,
          challengeId: ac.challenge_id,
          challengeName,
          currentDay,
          challengeSecuredToday,
          durationDays,
          taskType: tType,
          taskConfig: buildTaskConfigParam(t as unknown as Record<string, unknown>),
          durationMinutes: durationMinutesFromTask(t),
          requirePhoto:
            t.require_photo === true ||
            t.config?.photo_required === true ||
            t.config?.require_photo_proof === true ||
            t.config?.require_photo === true,
          type: t.type,
          gates: t.gates,
          gateTime: t.gateTime ?? null,
          windowState: t.windowState ?? null,
          minutesLeft: t.minutesLeft ?? null,
          hasCameraProof: proofByTask.get(t.id) === true,
        });
      }
    }
    return flat;
  }, [bootstrap.data?.activeChallenges, bootstrap.data?.todayCheckinsForUser]);

  const resolvedStats = statsFailed ? null : (bootstrap.data?.stats ?? stats);
  const statsReady = resolveHomeStatsReady({
    queryFetched: bootstrap.isFetched,
    queryData: bootstrap.data?.stats,
    contextStats: statsFailed ? null : stats,
    statsFailed,
  });
  const streak = resolveDisplayedStreak(statsReady, resolvedStats?.activeStreak);

  const homeTimeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );

  const todaySecured = useMemo(
    () => homeSecuredToday(securedDateKeys, getTodayDateKey(homeTimeZone)),
    [securedDateKeys, homeTimeZone]
  );

  const heroMetrics = useMemo(() => {
    const totalTasksToday = heroTasks.length;
    const tasksDoneToday = heroTasks.filter((t) => t.done).length;
    const tasksRemaining = Math.max(0, totalTasksToday - tasksDoneToday);
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const minutesRemaining = Math.floor(
      (midnight.getTime() - now.getTime()) / 60000,
    );
    return { totalTasksToday, tasksDoneToday, tasksRemaining, minutesRemaining };
  }, [heroTasks]);

  const homeState = useMemo(
    () =>
      computeHomeState({
        streak: streak ?? 0,
        tasksRemaining: heroMetrics.tasksRemaining,
        minutesToMidnight: heroMetrics.minutesRemaining,
      }),
    [streak, heroMetrics.tasksRemaining, heroMetrics.minutesRemaining],
  );

  const lastHomeStateFiredRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!FLAGS.PR3_HOME_STATE_ANALYTICS) return;
    if (streak == null) return;
    if (lastHomeStateFiredRef.current === homeState) return;
    lastHomeStateFiredRef.current = homeState;
    track({ name: "home_state_viewed", state: homeState, streak });
  }, [homeState, streak]);

  const showCelebration = useCelebrationStore((s) => s.show);

  // Week strip — Mon→Sun in profile IANA, else device IANA.
  // getTodayDateKey(undefined) is UTC: Friday 10:23pm ET highlights Saturday.
  const weekDateKeys = useMemo(() => getCurrentWeekDateKeys(homeTimeZone), [homeTimeZone]);

  const todayWeekIndex = useMemo(() => {
    const todayKey = getTodayDateKey(homeTimeZone);
    const idx = weekDateKeys.indexOf(todayKey);
    return idx >= 0 ? idx : 0;
  }, [weekDateKeys, homeTimeZone]);

  const weekSecuredByIndex = useMemo(() => {
    const set = new Set(securedDateKeys);
    return weekDateKeys.map((key, i) => set.has(key) || (todaySecured && i === todayWeekIndex));
  }, [weekDateKeys, securedDateKeys, todaySecured, todayWeekIndex]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (!profile || streak == null || streak <= 0) return;
    const keys = [...securedDateKeys].sort();
    if (keys.length === 0) return;
    const lastKey = keys[keys.length - 1]!;
    const today = getTodayDateKey(homeTimeZone);
    const yesterday = getYesterdayDateKey(homeTimeZone);
    const missedWindow = lastKey !== today && lastKey !== yesterday;
    if (missedWindow) {
      setShowFreezeModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- profile identity covered via profile?.username
  }, [isGuest, user?.id, profile?.username, streak, securedDateKeys]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (streak == null) return;
    void scheduleStreakReminder(streak);
  }, [isGuest, user?.id, streak]);

  // Jeopardy modal — show once per calendar day when streak is at risk.
  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (homeState !== 'streak_at_risk') return;
    const todayKey = getTodayDateKey(homeTimeZone);
    const storageKey = `griit_jeopardy_${todayKey}`;
    AsyncStorage.getItem(storageKey).then((shown) => {
      if (shown) return;
      void AsyncStorage.setItem(storageKey, 'true');
      setShowJeopardyModal(true);
    }).catch(() => {
      // non-fatal — show the modal anyway
      setShowJeopardyModal(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- homeState covers all inputs
  }, [isGuest, user?.id, homeState]);

  const refetchBootstrap = bootstrap.refetch;
  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      void refetchBootstrap();
    }, [isGuest, user?.id, refetchBootstrap]),
  );

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      let cancelled = false;
      const run = async () => {
        const n = streak;
        if (n == null || !STREAK_MILESTONES.some((m) => m === n)) return;
        const key = `griit_milestone_${n}`;
        const shown = await AsyncStorage.getItem(key);
        if (cancelled || shown) return;
        await AsyncStorage.setItem(key, "true");
        showCelebration({
          title: `${n}-day streak!`,
          subtitle: "You're building something real.",
          type: "streak",
        });
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [isGuest, user?.id, streak, showCelebration]),
  );

  const refresh = useCallback(async () => {
    await Promise.all([refetchBootstrap(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [refetchBootstrap, refetchAll, queryClient]);

  // ────────────── handlers ──────────────

  const onPressTask = useCallback(
    (task: StreakHeroV4Task) => {
      router.push(
        `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}&activeChallengeId=${encodeURIComponent(task.activeChallengeId)}&taskType=${encodeURIComponent(task.taskType)}&taskName=${encodeURIComponent(task.name)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(task.taskConfig)}&challengeName=${encodeURIComponent(task.challengeName)}&currentDay=${String(displayDay(task.currentDay, task.challengeSecuredToday))}&durationDays=${String(task.durationDays)}` as never,
      );
    },
    [router],
  );

  const onPressPrimaryCTA = useCallback(() => {
    if (heroTasks.length === 0) {
      track({ name: 'discover_challenge_tapped' });
      router.push(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (heroMetrics.tasksRemaining > 0) {
      const next = heroTasks.find((t) => !t.done);
      if (next) {
        track({ name: 'task_completed' });
        onPressTask(next);
      }
      return;
    }
    // tasksRemaining === 0 and on home — no-op; "Come back tomorrow" is shown.
  }, [heroTasks, heroMetrics.tasksRemaining, onPressTask, router]);

  const onPressBell = useCallback(() => {
    router.push(`${ROUTES.ACTIVITY}?tab=notifications` as never);
  }, [router]);

  // Jeopardy modal handlers
  const onJeopardyFinish = useCallback(() => {
    setShowJeopardyModal(false);
    // Navigate to the first incomplete task
    const next = heroTasks.find((t) => !t.done);
    if (next) onPressTask(next);
    else router.push(ROUTES.TABS_DISCOVER as never);
  }, [heroTasks, onPressTask, router]);

  const onJeopardyFreeze = useCallback(() => {
    setShowJeopardyModal(false);
    setShowFreezeModal(true);
  }, []);

  const onJeopardyDismiss = useCallback(() => {
    setShowJeopardyModal(false);
  }, []);

  const nextBadge = useMemo(() => {
    const mark = nextProfileV2Badge({
      bestStreak: resolvedStats?.longestStreak ?? streak ?? 0,
      verifiedDays: resolvedStats?.totalDaysSecured ?? 0,
    });
    if (!mark) return { name: "First badge", progress: 1 };
    return { name: mark.name, progress: mark.progress };
  }, [resolvedStats?.longestStreak, resolvedStats?.totalDaysSecured, streak]);

  const firstProofEver =
    !statsFailed &&
    (resolvedStats?.totalDaysSecured ?? 0) === 0 &&
    securedDateKeys.length === 0;

  const proof = useMemo(
    () =>
      selectHomeProofCard({
        tasks: heroTasks,
        tasksDoneToday: heroMetrics.tasksDoneToday,
        totalTasksToday: heroMetrics.totalTasksToday,
        firstProofEver,
        targetStreak: profile?.target_streak ?? null,
        securedToday: todaySecured,
      }),
    [heroTasks, heroMetrics.tasksDoneToday, heroMetrics.totalTasksToday, firstProofEver, profile?.target_streak, todaySecured],
  );

  // ────────────── render ──────────────

  const guestKeyExtractor = useCallback((item: { key: string }) => item.key, []);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <FlashList
          data={[{ key: "guest-home" }]}
          keyExtractor={guestKeyExtractor}
          renderItem={() => (
            <View style={s.guestWrap}>
              <Text style={s.guestTitle}>GRIIT</Text>
              <Text style={s.guestBody}>
                Sign in to start your discipline streak and see what your friends are doing.
              </Text>
            </View>
          )}
          contentContainerStyle={s.guestList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={s.container}>
        <LiveFeedSection
          onRefresh={refresh}
          scope={feedScope}
          onScopeChange={setFeedScope}
          hideHeaderToggle
          activeChallengesCount={
            Array.isArray(bootstrap.data?.activeChallenges)
              ? bootstrap.data.activeChallenges.length
              : 0
          }
          viewerTargetStreak={profile?.target_streak ?? null}
          ListHeaderComponent={
            <HomeV3
              title={greetingTitle(profile ?? {})}
              streak={streak}
              streakLine={homeStreakLine(streak, todaySecured)}
              proof={proof}
              weekFilled={weekSecuredByIndex}
              todayIndex={todayWeekIndex}
              fillToday={todaySecured}
              feedScope={feedScope}
              onChangeFeedScope={setFeedScope}
              onPressBell={onPressBell}
              onPressProof={onPressPrimaryCTA}
              onPressTask={(id) => {
                const next = heroTasks.find((h) => h.id === id);
                if (!next || next.windowState === "closed") return;
                onPressTask(next);
              }}
              freezesLeft={freezeStatus?.remaining ?? 0}
              badgeName={nextBadge.name}
              badgePct={Math.round(nextBadge.progress * 100)}
              loading={bootstrap.isPending && !bootstrap.data}
            />
          }
        />
        <StreakFreezeModal
          visible={showFreezeModal}
          streakCount={streak ?? 0}
          freezesRemaining={profile?.streak_freezes_remaining ?? 1}
          onUseFreeze={() => setShowFreezeModal(false)}
          onLetReset={() => setShowFreezeModal(false)}
        />
        <JeopardyModal
          visible={showJeopardyModal}
          streak={streak ?? 0}
          minutesRemaining={heroMetrics.minutesRemaining}
          freezesAvailable={freezeStatus?.remaining ?? 0}
          onPressFinish={onJeopardyFinish}
          onPressFreeze={onJeopardyFreeze}
          onDismiss={onJeopardyDismiss}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_V3.color.canvas },
  guestWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  guestList: { paddingBottom: DS_V3.space.xs * 24 },
  guestTitle: {
    fontSize: DS_V3.type.display.fontSize,
    lineHeight: DS_V3.type.display.lineHeight,
    fontWeight: DS_V3.type.display.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  guestBody: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
