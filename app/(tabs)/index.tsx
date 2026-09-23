import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { useReconcileStreakIfNeeded } from "@/lib/use-reconcile-streak";
import { ROUTES } from "@/lib/routes";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import LiveFeedSection from "@/components/LiveFeedSection";
import { HomeV3, greetingTitle } from "@/components/home/HomeV3";
import { selectHomeProofCard, taskDisplayName } from "@/lib/home-proof-card";
import { dateKeyFromIso } from "@/lib/home-day-total";
import { hasCameraProof } from "@/lib/active-challenge-ui";
import { proofPhotoUrlFromCheckIn } from "@/backend/lib/proof-predicate";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { buildWeekStripDays } from "@/lib/week-strip-days";
import { type StreakHeroV4Task } from "@/components/home/StreakHeroV4";
import { resolveDisplayedStreak, resolveHomeStatsReady, resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { DS_V3 } from "@/lib/design-system";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import { useFeedToggle } from "@/store/feedToggleStore";
import { FreezeSheet } from "@/components/home/FreezeSheet";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { consistencyFromDayArray, consistencyLine } from "@/lib/consistency";
import { countActiveEnrollments } from "@/lib/free-challenge-limit";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { inlineServerError } from "@/lib/inline-server-error";
import { FREEZE_SUCCESS_INVALIDATES } from "@/lib/freeze-sheet";
import { getTodayDateKey, getYesterdayDateKey, getCurrentWeekDateKeys } from "@/lib/date-utils";
import { displayDay } from "@/lib/challenge-day";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";
import { JeopardyModal } from "@/components/home/JeopardyModal";
import { nextProfileV2Badge } from "@/lib/profile-v2-badges";
import {
  MISS_ACK_STORAGE_KEY,
  missAckPayload,
  missAckStorageKey,
  morningAfterCost,
  morningAfterCushion,
  morningAfterFreezeCaption,
  morningAfterKeepsLostStreak,
  morningAfterVariant,
  morningAfterVisible,
} from "@/lib/morning-after";
import {
  parseTodaySectionChoice,
  serializeTodaySectionChoice,
  todaySectionCollapseKey,
} from "@/lib/today-section-collapse";
import type { StatsFromApi } from "@/types";

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
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile: contextProfile } = useApp();
  const [showFreezeSheet, setShowFreezeSheet] = React.useState(false);
  const [freezeError, setFreezeError] = React.useState<string | null>(null);
  const [showJeopardyModal, setShowJeopardyModal] = React.useState(false);
  const [missAckDateKey, setMissAckDateKey] = React.useState<string | null | undefined>(undefined);
  const [freezeSpent, setFreezeSpent] = React.useState(false);
  const [sectionChoices, setSectionChoices] = React.useState<Record<string, boolean>>({});

  const feedScope = useFeedToggle((s) => s.scope);
  const setFeedScope = useFeedToggle((s) => s.setScope);
  const initFeedToggle = useFeedToggle((s) => s.initIfFirstRun);

  const bootstrap = useHomeBootstrap(isGuest ? undefined : user?.id);
  const recordQuery = useQuery({
    queryKey: ["profiles", "getRecord", user?.id ?? ""],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord) as Promise<{
        consistency: {
          verifiedClosed: number;
          closedDueDays: number;
          dueToday: boolean;
          dueDayKeys: string[];
        };
      }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
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

  const homeTimeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );
  const yesterdayKey = useMemo(() => getYesterdayDateKey(homeTimeZone), [homeTimeZone]);
  const todayKey = useMemo(() => getTodayDateKey(homeTimeZone), [homeTimeZone]);

  const recon = useReconcileStreakIfNeeded({
    enabled: !isGuest && !!user?.id,
    ready: bootstrap.isSuccess,
    userId: user?.id,
    stats: bootstrap.data?.stats ?? stats ?? null,
    securedDateKeys: bootstrap.data?.securedDateKeys ?? null,
    yesterdayKey,
  });

  React.useEffect(() => {
    if (!user?.id) {
      setMissAckDateKey(null);
      return;
    }
    const scopedKey = missAckStorageKey(user.id);
    void (async () => {
      await AsyncStorage.removeItem(MISS_ACK_STORAGE_KEY);
      const value = await AsyncStorage.getItem(scopedKey);
      setMissAckDateKey(value);
    })();
  }, [user?.id]);

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
      const startIso = ac.start_at ?? ac.started_at ?? ac.created_at ?? "";
      const startDateKey = startIso ? dateKeyFromIso(String(startIso), homeTimeZone) : todayKey;
      const challengeSecuredToday =
        required.length > 0 && required.every((t) => doneSet.has(t.id));

      for (const t of required) {
        const tType = String(t.type ?? "manual").toLowerCase();
        flat.push({
          id: t.id,
          name: taskDisplayName({ title: t.title, type: tType }),
          startDateKey,
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
  }, [bootstrap.data?.activeChallenges, bootstrap.data?.todayCheckinsForUser, homeTimeZone, todayKey]);

  const resolvedStats = statsFailed ? null : (bootstrap.data?.stats ?? stats);
  const statsReady = resolveHomeStatsReady({
    queryFetched: bootstrap.isFetched,
    queryData: bootstrap.data?.stats,
    contextStats: statsFailed ? null : stats,
    statsFailed,
  });
  const streak = resolveDisplayedStreak(statsReady, resolvedStats?.activeStreak);

  const todaySecured = useMemo(
    () => homeSecuredToday(securedDateKeys, getTodayDateKey(homeTimeZone)),
    [securedDateKeys, homeTimeZone]
  );

  const morningAfter = useMemo(() => {
    if (freezeSpent || missAckDateKey === undefined || recon.result == null) return null;
    const statsRow = resolvedStats as StatsFromApi | null;
    const lostStreak = recon.result.lostStreak;
    const variant = morningAfterVariant({
      lastStandUsed: Boolean(
        recon.result.lastStandUsedThisSession || statsRow?.lastStandUsedThisSession,
      ),
      reset: Boolean(recon.result.streak_broken || statsRow?.streakLostNoLastStand),
      freezeRemaining: freezeStatus?.remaining ?? 0,
      lostStreak,
    });
    const keepLost = morningAfterKeepsLostStreak(lostStreak, missAckDateKey, yesterdayKey);
    if (
      !keepLost &&
      (!morningAfterVisible(variant, missAckDateKey, yesterdayKey) || variant == null)
    ) {
      return null;
    }
    if (variant == null) return null;
    return {
      cost: morningAfterCost(
        recon.result.done ?? 0,
        recon.result.total ?? 0,
        recon.result.missedTaskNames ?? [],
      ),
      cushion: morningAfterCushion(variant, {
        longest: statsRow?.longestStreak ?? 0,
        lastStandsLeft: recon.result.lastStandsAvailable ?? statsRow?.lastStandsAvailable ?? 0,
        previousStreak: recon.result.previous_streak ?? lostStreak,
        todaySecured,
      }),
      freezeCaption: variant === "freeze" ? morningAfterFreezeCaption(freezeStatus?.remaining ?? 0) : null,
      onDismiss: () => {
        if (!user?.id) return;
        const ack = missAckPayload(user.id, yesterdayKey);
        setMissAckDateKey(ack.value);
        void AsyncStorage.setItem(ack.key, ack.value);
      },
      onUseFreeze: variant === "freeze" ? () => {
        setFreezeError(null);
        setShowFreezeSheet(true);
      } : undefined,
    };
  }, [freezeSpent, freezeStatus?.remaining, missAckDateKey, recon.result, resolvedStats, user?.id, yesterdayKey, todaySecured]);

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

  // Week strip — Mon→Sun in profile IANA, else device IANA.
  // getTodayDateKey(undefined) is UTC: Friday 10:23pm ET highlights Saturday.
  const weekDateKeys = useMemo(() => getCurrentWeekDateKeys(homeTimeZone), [homeTimeZone]);

  const todayWeekIndex = useMemo(() => {
    const todayKey = getTodayDateKey(homeTimeZone);
    const idx = weekDateKeys.indexOf(todayKey);
    return idx >= 0 ? idx : 0;
  }, [weekDateKeys, homeTimeZone]);

  const weekStates = useMemo(() => {
    const statsRow = resolvedStats as StatsFromApi | null;
    return buildWeekStripDays(weekDateKeys, {
      securedDateKeys,
      frozenDateKeys: statsRow?.frozenDateKeys ?? [],
      lastStandDateKeys: statsRow?.lastStandDateKeys ?? [],
      todayKey: weekDateKeys[todayWeekIndex] ?? "",
      todaySecured,
    }).map((d) => d.state);
  }, [weekDateKeys, securedDateKeys, todaySecured, todayWeekIndex, resolvedStats]);

  const useFreeze = useMutation({
    mutationKey: ["streaks", "useFreeze", user?.id ?? ""],
    mutationFn: () =>
      trpcMutate<{ restoredStreak: number; remaining: number }>(TRPC.streaks.useFreeze, {
        dateKeyToFreeze: yesterdayKey,
      }),
    onSuccess: () => {
      setFreezeSpent(true);
      setShowFreezeSheet(false);
      setFreezeError(null);
      if (user?.id) {
        const ack = missAckPayload(user.id, yesterdayKey);
        setMissAckDateKey(ack.value);
        void AsyncStorage.setItem(ack.key, ack.value);
      }
      for (const queryKey of FREEZE_SUCCESS_INVALIDATES) {
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      }
    },
    onError: (err) => {
      captureError(err, "useFreeze");
      setFreezeError(inlineServerError(err));
    },
  });

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
        todayKey,
      }),
    [heroTasks, heroMetrics.tasksDoneToday, heroMetrics.totalTasksToday, firstProofEver, profile?.target_streak, todaySecured, todayKey],
  );

  const sectionIds = useMemo(() => proof.sections.map((s) => s.id).join("|"), [proof.sections]);

  React.useEffect(() => {
    if (!user?.id) {
      setSectionChoices({});
      return;
    }
    const ids = sectionIds ? sectionIds.split("|").filter(Boolean) : [];
    void (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          const raw = await AsyncStorage.getItem(todaySectionCollapseKey(user.id, id, todayKey));
          return [id, parseTodaySectionChoice(raw)] as const;
        }),
      );
      const next: Record<string, boolean> = {};
      for (const [id, stored] of entries) {
        if (stored === true || stored === false) next[id] = stored;
      }
      setSectionChoices(next);
    })();
  }, [user?.id, todayKey, sectionIds]);

  const onToggleSection = useCallback(
    (sectionId: string, expanded: boolean) => {
      setSectionChoices((prev) => ({ ...prev, [sectionId]: expanded }));
      if (!user?.id) return;
      void AsyncStorage.setItem(
        todaySectionCollapseKey(user.id, sectionId, todayKey),
        serializeTodaySectionChoice(expanded),
      );
    },
    [user?.id, todayKey],
  );

  const onPressChallenge = useCallback(
    (challengeId: string) => {
      router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
    },
    [router],
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
          contentContainerStyle={[s.guestList, { paddingBottom: tabBarContentPad(insets.bottom) }]}
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
          activeChallengesCount={countActiveEnrollments(
            (Array.isArray(bootstrap.data?.activeChallenges)
              ? bootstrap.data.activeChallenges
              : []) as { status?: string }[],
          )}
          viewerTargetStreak={profile?.target_streak ?? null}
          ListHeaderComponent={
            <HomeV3
              title={greetingTitle(profile ?? {})}
              streak={streak}
              streakLine={consistencyLine(
                consistencyFromDayArray({
                  dueDayKeys: recordQuery.data?.consistency.dueDayKeys ?? [],
                  securedDateKeys,
                  todayKey,
                }),
              )}
              morningAfter={morningAfter}
              proof={proof}
              weekStates={weekStates}
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
              onPressChallenge={onPressChallenge}
              sectionChoices={sectionChoices}
              onToggleSection={onToggleSection}
              freezesLeft={freezeStatus?.remaining ?? 0}
              badgeName={nextBadge.name}
              badgePct={Math.round(nextBadge.progress * 100)}
              loading={bootstrap.isPending && !bootstrap.data}
            />
          }
        />
        <FreezeSheet
          visible={showFreezeSheet}
          remaining={freezeStatus?.remaining ?? 0}
          restoredStreakDays={recon.result?.lostStreak}
          lastFreezeUsedAt={freezeStatus?.lastFreezeUsedAt ?? null}
          timeZone={homeTimeZone}
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
            if (!user?.id) return;
            const ack = missAckPayload(user.id, yesterdayKey);
            setMissAckDateKey(ack.value);
            void AsyncStorage.setItem(ack.key, ack.value);
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
  guestList: {},
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
