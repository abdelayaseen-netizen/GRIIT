import React, { useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "@/components/ds/Screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { refreshHomeBootstrap } from "@/lib/home-bootstrap-refresh";
import { useReconcileStreakIfNeeded } from "@/lib/use-reconcile-streak";
import { ROUTES } from "@/lib/routes";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import { HomeV3 } from "@/components/home/HomeV3";
import { StarterTodayRow } from "@/components/home/StarterTodayRow";
import { SaveStreakSheet } from "@/components/home/SaveStreakSheet";
import { shouldShowSaveStreak } from "@/lib/save-streak-prompt";
import { conceptLine, type ConceptKind } from "@/lib/concept-once";
import { FREEZE } from "@/lib/copy";
import { earliestEnrollmentStart, firstNameFromAuth, firstWeekDay, greeting, homeScreenDate } from "@/lib/greeting";
import { firstWeekStripDays } from "@/lib/week-strip-days";
import { useTaskCompleteFlash } from "@/components/task-v2/TaskCompleteToast";
import { currentTaskToast, publishTaskToast, setToastAction, subscribeTaskToast } from "@/lib/task-complete-toast";
import LiveFeedSection from "@/components/LiveFeedSection";
import ScreenChrome from "@/components/ds/ScreenChrome";
import DayStickerSheet from "@/components/share/DayStickerSheet";
import { selectHomeProofCard, taskDisplayName } from "@/lib/home-proof-card";
import {
  mergeOptimisticCheckins,
  optimisticSaveError,
  optimisticTaskDones,
  runOptimisticRetry,
  subscribeOptimisticHome,
} from "@/lib/optimistic-home";
import {
  closeTimeLabel,
  pickStartTask,
  startCtaLabel,
  remainingWindowsClosed,
  todayDay2Hero,
  todayFirstDayLine,
  windowClosesBanner,
} from "@/lib/g2a-home";
import { queuedHomeRows } from "@/lib/home-starts-tomorrow";
import { dateKeyFromIso, shownChallengeDay } from "@/lib/home-day-total";
import { completedTaskIds } from "@/lib/today-completion";
import { enrollmentStarted, requiredTasks } from "@/lib/today-counts";
import { hasCameraProof, mapDifficulty } from "@/lib/active-challenge-ui";
import { stravaVerifiedBy } from "@/lib/strava-verify";
import { StreakSheet } from "@/components/home/StreakSheet";
import { freezeRefillDateLabel } from "@/lib/freeze-sheet";
import { canOfferYesterdayFreeze, weekdayLongForDateKey } from "@/lib/freeze-recovery";
import { activeChallengesAreHard } from "@/lib/secured-since";
import { proofPhotoUrlFromCheckIn } from "@/backend/lib/proof-predicate";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { buildWeekStripDays } from "@/lib/week-strip-days";
import { type StreakHeroV4Task } from "@/components/home/StreakHeroV4";
import { resolveDisplayedStreak, resolveHomeStatsReady, resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { DS_V3 } from "@/lib/design-system";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import {
  EMPTY_SECURED_HEADER,
  securedSinceLine,
  type ProofsHeader,
} from "@/lib/secured-since";
import {
  HOME_FEED_SCOPE_KEY,
  defaultHomeFeedScope,
  pickHomeInviteChallenge,
  showHomeInviteCard,
  type HomeFeedScope,
} from "@/lib/g2b-home";
import { countActiveEnrollments } from "@/lib/free-challenge-limit";
import { FreezeSheet } from "@/components/home/FreezeSheet";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import {
  daysFromSource,
  streakFromDays,
  weekStripDaysUi,
  weekStripFromDays,
  type DaySource,
} from "@/lib/day-state";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { inlineServerError } from "@/lib/inline-server-error";
import { FREEZE_SUCCESS_INVALIDATES } from "@/lib/freeze-sheet";
import { getTodayDateKey, getYesterdayDateKey, getCurrentWeekDateKeys } from "@/lib/date-utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track, trackUsage } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import {
  EMPTY_HOME_STARTER_BODY,
  EMPTY_HOME_STARTER_CHALLENGE_ID,
  EMPTY_HOME_STARTER_CTA,
  EMPTY_HOME_STARTER_TITLE,
} from "@/lib/empty-home-starter";
import { ensureAnonymousSession } from "@/lib/anon-auth";
import type { JoinWithFirstTask } from "@/lib/open-first-task";
import { firstTaskHrefAfterJoin } from "@/lib/enrich-join-first-task";
import Button from "@/components/ds/Button";
import { computeHomeState } from "@/lib/home-state";
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
  morningAfterYesterdayWasDue,
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
    difficulty?: string | null;
    is_hard_mode?: boolean | null;
    challenge_tasks?: TaskRow[];
  };
};

function durationMinutesFromTask(t: TaskRow): number | undefined {
  if (typeof t.duration_minutes === "number" && t.duration_minutes > 0) return t.duration_minutes;
  const fromCfg = t.config?.duration_minutes;
  if (typeof fromCfg === "number" && fromCfg > 0) return fromCfg;
  return undefined;
}

/** Build 90 04.7: a bootstrap this recent is not fetched again on Home focus. */
const HOME_FOCUS_FRESH_MS = 10_000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile: contextProfile, completeTask } = useApp();
  const [showFreezeSheet, setShowFreezeSheet] = React.useState(false);
  const [conceptSeen, setConceptSeen] = React.useState<ReadonlySet<ConceptKind>>(new Set());
  const [conceptBanner, setConceptBanner] = React.useState<string | null>(null);
  // null until the flags are read, so a cold start cannot flash the sheet before the
  // stored "Later" is known (06.6).
  const [saveDismissed, setSaveDismissed] = React.useState<{ first: boolean; second: boolean } | null>(null);
  const [postGate, setPostGate] = React.useState(false);
  const [starterBusy, setStarterBusy] = React.useState(false);
  const [optimisticRev, setOptimisticRev] = React.useState(0);
  useEffect(() => subscribeOptimisticHome(() => setOptimisticRev((n) => n + 1)), []);
  const focus = useLocalSearchParams<{ focus?: string }>().focus;
  useEffect(() => {
    if (focus === "freeze") setShowFreezeSheet(true);
  }, [focus]);

  useEffect(() => {
    void AsyncStorage.getItem("griit.concept.seen").then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as ConceptKind[];
        if (Array.isArray(parsed)) setConceptSeen(new Set(parsed));
      } catch {
        /* ignore a bad flag */
      }
    });
    void Promise.all([
      AsyncStorage.getItem("griit.saveStreak.dismissedFirst"),
      AsyncStorage.getItem("griit.saveStreak.dismissedSecond"),
    ]).then(([first, second]) => {
      setSaveDismissed({ first: first === "1", second: second === "1" });
    });
  }, []);

  const markConcept = useCallback((kind: ConceptKind) => {
    setConceptSeen((prev) => {
      if (prev.has(kind)) return prev;
      const next = new Set(prev);
      next.add(kind);
      void AsyncStorage.setItem("griit.concept.seen", JSON.stringify([...next]));
      return next;
    });
  }, []);
  const [showStreakSheet, setShowStreakSheet] = React.useState(false);
  const [taskToastUp, setTaskToastUp] = React.useState(false);
  React.useEffect(
    () =>
      subscribeTaskToast((toast) => {
        setTaskToastUp(toast != null);
        if (toast) setShowStreakSheet(false);
      }),
    [],
  );
  const [streakHeld, setStreakHeld] = React.useState(false);
  const [freezeError, setFreezeError] = React.useState<string | null>(null);
  const [missAckDateKey, setMissAckDateKey] = React.useState<string | null | undefined>(undefined);
  const [freezeSpent, setFreezeSpent] = React.useState(false);
  const [sectionChoices, setSectionChoices] = React.useState<Record<string, boolean>>({});
  const [shareTodayOpen, setShareTodayOpen] = React.useState(false);
  const highlightTaskId = useTaskCompleteFlash();

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
        timezone?: string;
        todayKey?: string;
        daySource?: DaySource;
        header?: ProofsHeader;
        earliestStartKey?: string | null;
      }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  const [storedFeedScope, setStoredFeedScope] = React.useState<HomeFeedScope | null>(null);
  const profile = (bootstrap.data?.profile ?? contextProfile) as typeof contextProfile;
  const freezeStatus = bootstrap.data?.freezeStatus ?? null;
  const statsFailed = bootstrap.data?.failed.includes("stats") === true;
  const securedDateKeys = useMemo(
    () => (Array.isArray(bootstrap.data?.securedDateKeys) ? bootstrap.data.securedDateKeys : []),
    [bootstrap.data?.securedDateKeys],
  );

  const homeTimeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );
  const yesterdayKey = useMemo(() => getYesterdayDateKey(homeTimeZone), [homeTimeZone]);
  const todayKey = useMemo(() => getTodayDateKey(homeTimeZone), [homeTimeZone]);

  React.useEffect(() => {
    if (!user?.id) {
      setStoredFeedScope(null);
      return;
    }
    void AsyncStorage.getItem(HOME_FEED_SCOPE_KEY(user.id)).then((raw) => {
      if (raw === "following" || raw === "everyone") setStoredFeedScope(raw);
    });
  }, [user?.id]);

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
    const serverCheckins = (Array.isArray(bootstrap.data?.todayCheckinsForUser)
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
      proof_source?: string | null;
    }[];
    const checkins = mergeOptimisticCheckins(serverCheckins, optimisticRev >= 0 ? optimisticTaskDones() : []);
    const flat: StreakHeroV4Task[] = [];

    for (const ac of activeList) {
      // 05.4: same "started" and "required" rules as todayTaskCounts, so Home and Profile agree.
      if (!enrollmentStarted(ac, todayKey, homeTimeZone)) continue;
      const required = requiredTasks(ac.challenges?.challenge_tasks ?? []);
      const doneRows = checkins.filter(
        (c) => c.active_challenge_id === ac.id && c.status === "completed",
      );
      const doneSet = completedTaskIds(checkins, ac.id);
      const proofByTask = new Map(
        doneRows.map((c) => [
          String(c.task_id),
          hasCameraProof({
            verified: c.verified === true,
            proof_photo_url: c.proof_photo_url ?? proofPhotoUrlFromCheckIn(c),
          }),
        ]),
      );
      // 09.3: a Strava-verified completion says "Verified by Strava" in place of "Self-reported".
      const verifiedByTask = new Map(doneRows.map((c) => [String(c.task_id), stravaVerifiedBy(c)]));
      const challengeName = ac.challenges?.title ?? "Challenge";
      const durationDays = ac.challenges?.duration_days ?? 14;
      const startIso = ac.start_at ?? ac.started_at ?? ac.created_at ?? "";
      const startDateKey = startIso ? dateKeyFromIso(String(startIso), homeTimeZone) : todayKey;
      if (startDateKey > todayKey) continue;
      const challengeSecuredToday =
        required.length > 0 && required.every((t) => doneSet.has(t.id));
      const currentDay = shownChallengeDay(startIso || null, homeTimeZone, todayKey, durationDays);

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
          verifiedBy: verifiedByTask.get(t.id) ?? null,
        });
      }
    }
    return flat;
  }, [bootstrap.data?.activeChallenges, bootstrap.data?.todayCheckinsForUser, homeTimeZone, todayKey, optimisticRev]);

  const resolvedStats = statsFailed ? null : (bootstrap.data?.stats ?? stats);
  const offerYesterdayFreeze = useMemo(() => {
    const activeList = (Array.isArray(bootstrap.data?.activeChallenges)
      ? bootstrap.data.activeChallenges
      : []) as ActiveRow[];
    const hardOnly =
      activeList.length > 0 &&
      activeList.every(
        (row) =>
          mapDifficulty({
            isHardMode: row.challenges?.is_hard_mode,
            difficulty: row.challenges?.difficulty,
          }) === "hard",
      );
    return canOfferYesterdayFreeze({
      hardMode: hardOnly,
      freezesRemaining: freezeStatus?.remaining ?? 0,
      missDateKey: yesterdayKey,
      todayKey,
      securedDateKeys,
      frozenDateKeys: (resolvedStats as StatsFromApi | null)?.frozenDateKeys ?? [],
    });
  }, [
    bootstrap.data?.activeChallenges,
    freezeStatus?.remaining,
    resolvedStats,
    securedDateKeys,
    todayKey,
    yesterdayKey,
  ]);
  const statsReady = resolveHomeStatsReady({
    queryFetched: bootstrap.isFetched,
    queryData: bootstrap.data?.stats,
    contextStats: statsFailed ? null : stats,
    statsFailed,
  });
  const uDays = useMemo(
    () =>
      daysFromSource(recordQuery.data?.daySource, homeTimeZone, {
        todayKey: recordQuery.data?.todayKey,
      }),
    [recordQuery.data?.daySource, recordQuery.data?.todayKey, homeTimeZone],
  );
  const streakFromArray = uDays.length ? streakFromDays(uDays) : null;
  const streak =
    streakFromArray ?? resolveDisplayedStreak(statsReady, resolvedStats?.activeStreak);
  const dueDayKeys = recordQuery.data?.consistency?.dueDayKeys ?? [];
  const header = recordQuery.data?.header ?? EMPTY_SECURED_HEADER;
  const streakLine = securedSinceLine(header);
  const feedScope = defaultHomeFeedScope(
    bootstrap.data?.followCounts?.following ?? 0,
    storedFeedScope,
  );
  const onFeedScopeChange = useCallback(
    (next: HomeFeedScope) => {
      setStoredFeedScope(next);
      if (!user?.id) return;
      void AsyncStorage.setItem(HOME_FEED_SCOPE_KEY(user.id), next);
    },
    [user?.id],
  );

  const todaySecured = useMemo(
    () => homeSecuredToday(securedDateKeys, getTodayDateKey(homeTimeZone)),
    [securedDateKeys, homeTimeZone]
  );

  useEffect(() => {
    if (!todaySecured) return;
    const line = conceptLine("secured", conceptSeen);
    if (!line) return;
    setConceptBanner(line);
    markConcept("secured");
  }, [todaySecured, conceptSeen, markConcept]);

  const morningAfter = useMemo(() => {
    if (freezeSpent || missAckDateKey === undefined || recon.result == null) return null;
    const statsRow = resolvedStats as StatsFromApi | null;
    const lostStreak = recon.result.lostStreak;
    const yesterdayDue = morningAfterYesterdayWasDue(
      yesterdayKey,
      dueDayKeys,
      recon.result.total ?? 0,
    );
    if (!yesterdayDue && !morningAfterKeepsLostStreak(lostStreak, missAckDateKey, yesterdayKey)) {
      return null;
    }
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
  }, [dueDayKeys, freezeSpent, freezeStatus?.remaining, missAckDateKey, recon.result, resolvedStats, user?.id, yesterdayKey, todaySecured]);

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
    if (uDays.length) {
      return weekStripDaysUi(weekStripFromDays(uDays, homeTimeZone, recordQuery.data?.todayKey)).map(
        (d) => d.state,
      );
    }
    const statsRow = resolvedStats as StatsFromApi | null;
    return buildWeekStripDays(weekDateKeys, {
      securedDateKeys,
      frozenDateKeys: statsRow?.frozenDateKeys ?? [],
      lastStandDateKeys: statsRow?.lastStandDateKeys ?? [],
      todayKey: weekDateKeys[todayWeekIndex] ?? "",
      todaySecured,
    }).map((d) => d.state);
  }, [uDays, homeTimeZone, recordQuery.data?.todayKey, weekDateKeys, securedDateKeys, todaySecured, todayWeekIndex, resolvedStats]);

  const homeStrip = useMemo(() => {
    const starts = heroTasks
      .map((task) => task.startDateKey)
      .filter((key): key is string => typeof key === "string" && key <= todayKey);
    const earliest = earliestEnrollmentStart([
      recordQuery.data?.earliestStartKey,
      ...starts,
    ]);
    const day = firstWeekDay(todayKey, earliest);
    const statsRow = resolvedStats as StatsFromApi | null;
    if (day && earliest) {
      const days = firstWeekStripDays(earliest, {
        securedDateKeys,
        frozenDateKeys: statsRow?.frozenDateKeys ?? [],
        lastStandDateKeys: statsRow?.lastStandDateKeys ?? [],
        todayKey,
        todaySecured,
      });
      return {
        day,
        letters: days.map((d) => d.letter),
        states: days.map((d) => d.state),
        todayIndex: day - 1,
      };
    }
    return {
      day: null as number | null,
      letters: undefined as string[] | undefined,
      states: weekStates.map((state, i) => {
        const key = weekDateKeys[i];
        return earliest && key && key < earliest && state === "missed" ? ("before" as const) : state;
      }),
      todayIndex: todayWeekIndex,
    };
  }, [heroTasks, todayKey, resolvedStats, securedDateKeys, todaySecured, weekStates, weekDateKeys, todayWeekIndex, recordQuery.data?.earliestStartKey]);

  const useFreeze = useMutation({
    mutationKey: ["streaks", "useFreeze", user?.id ?? ""],
    mutationFn: () =>
      trpcMutate<{ restoredStreak: number; remaining: number }>(TRPC.streaks.useFreeze, {
        dateKeyToFreeze: yesterdayKey,
      }),
      onSuccess: (data) => {
      // 06.7: the result shows every time; the definition joins it the first time.
      const line = conceptLine("freeze", conceptSeen);
      const result = FREEZE.result(data?.restoredStreak ?? 0, data?.remaining ?? 0);
      setConceptBanner(line ? `${line} ${result}` : result);
      if (line) markConcept("freeze");
      trackUsage("freeze_used");
      setFreezeSpent(true);
      setStreakHeld(true);
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

  const refetchBootstrap = bootstrap.refetch;
  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      // Build 90 04.7: join a fetch in flight (a finish just started one) instead of restarting it,
      // and skip it when the payload is seconds old (coming back from Day secured or the post).
      void refreshHomeBootstrap(queryClient, { freshAfter: Date.now() - HOME_FOCUS_FRESH_MS });
    }, [isGuest, user?.id, queryClient]),
  );

  // Build 90 06.6: Home stays mounted under a pushed route and its Modal would open over
  // Day secured. The save sheet only shows while Home itself is the screen on top.
  const [homeFocused, setHomeFocused] = React.useState(false);
  useFocusEffect(
    useCallback(() => {
      setHomeFocused(true);
      return () => setHomeFocused(false);
    }, []),
  );

  const refresh = useCallback(async () => {
    await Promise.all([refetchBootstrap(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [refetchBootstrap, refetchAll, queryClient]);

  const onStartStarter = useCallback(async () => {
    if (starterBusy) return;
    setStarterBusy(true);
    try {
      const anon = await ensureAnonymousSession();
      if (anon.kind !== "ok") return;
      const result = (await trpcMutate(TRPC.challenges.join, {
        challengeId: EMPTY_HOME_STARTER_CHALLENGE_ID,
      })) as JoinWithFirstTask;
      const href = await firstTaskHrefAfterJoin(result, EMPTY_HOME_STARTER_CHALLENGE_ID, "home");
      await refresh();
      if (href) router.replace(href as never);
      else router.replace(ROUTES.TABS_HOME as never);
    } catch (err) {
      captureError(err, "HomeStarterJoin");
    } finally {
      setStarterBusy(false);
    }
  }, [starterBusy, refresh, router]);

  // ────────────── handlers ──────────────

  const onCheckOff = useCallback(
    (taskId: string) => {
      const task = heroTasks.find((row) => row.id === taskId);
      if (!task || task.done) return;
      void (async () => {
        const result = await completeTask({
          activeChallengeId: task.activeChallengeId,
          taskId: task.id,
        });
        const completionId = result?.completionId;
        setToastAction(() => {
          if (!completionId) return;
          void supabase.from("check_ins").delete().eq("id", completionId).then(() => {
            void refresh();
          });
        });
        const selfLine = conceptLine("self", conceptSeen);
        if (selfLine) markConcept("self");
        publishTaskToast({
          taskId: task.id,
          title: "Saved.",
          body: selfLine ?? "Self-reported.",
          photoUri: null,
          cameraSeal: false,
          actionLabel: "Undo",
          lifeMs: 5000,
          challengeName: task.challengeName,
          taskName: task.name,
        });
        void refresh();
      })();
    },
    [heroTasks, completeTask, refresh, conceptSeen, markConcept],
  );

  const onPressTask = useCallback(
    (task: StreakHeroV4Task) => {
      router.push(
        `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}&activeChallengeId=${encodeURIComponent(task.activeChallengeId)}&taskType=${encodeURIComponent(task.taskType)}&taskName=${encodeURIComponent(task.name)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(task.taskConfig)}&challengeName=${encodeURIComponent(task.challengeName)}&currentDay=${String(task.currentDay)}&durationDays=${String(task.durationDays)}&originTab=home` as never,
      );
    },
    [router],
  );

  const startTask = useMemo(
    () =>
      pickStartTask(
        heroTasks.map((t) => ({
          id: t.id,
          name: t.name,
          minutesLeft: t.minutesLeft,
          gateTime: t.gateTime,
          done: t.done,
          closed: t.windowState === "closed",
          challengeName: t.challengeName,
          currentDay: t.currentDay,
          durationDays: t.durationDays,
        })),
      ),
    [heroTasks],
  );

  const onPressPrimaryCTA = useCallback(() => {
    if (heroTasks.length === 0) {
      track({ name: 'discover_challenge_tapped' });
      router.push(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (heroMetrics.tasksRemaining > 0) {
      const next = startTask
        ? heroTasks.find((t) => t.id === startTask.id)
        : heroTasks.find((t) => !t.done);
      if (next) {
        track({ name: 'task_completed' });
        onPressTask(next);
      }
      return;
    }
  }, [heroTasks, heroMetrics.tasksRemaining, onPressTask, router, startTask]);

  const firstProofEver =
    !statsFailed &&
    (resolvedStats?.totalDaysSecured ?? 0) === 0 &&
    securedDateKeys.length === 0;
  const inviteTarget = pickHomeInviteChallenge(
    (Array.isArray(bootstrap.data?.activeChallenges) ? bootstrap.data.activeChallenges : []) as {
      challenge_id?: string | null;
      challenges?: { id?: string | null; title?: string | null; participants_count?: number | null } | null;
    }[],
  );
  const showInvite = showHomeInviteCard({
    soleMember: inviteTarget?.soleMember === true,
    firstDaySecured: !firstProofEver,
  });

  const proof = useMemo(
    () =>
      selectHomeProofCard({
        tasks: heroTasks,
        tasksDoneToday: heroMetrics.tasksDoneToday,
        totalTasksToday: heroMetrics.totalTasksToday,
        firstProofEver,
        targetStreak: profile?.target_streak ?? null,
        securedToday: todaySecured,
        securedDateKeys,
        profileTimeZone: (profile as { timezone?: string | null } | null)?.timezone,
        now: new Date(),
        todayKey,
      }),
    [heroTasks, heroMetrics.tasksDoneToday, heroMetrics.totalTasksToday, firstProofEver, profile?.target_streak, todaySecured, todayKey, securedDateKeys, profile],
  );

  const startsTomorrow = useMemo(
    () =>
      queuedHomeRows(
        bootstrap.data?.queuedChallenges as
          | { id?: string; challenge_id?: string; challenges?: { id?: string; title?: string | null } | null }[]
          | undefined,
      ),
    [bootstrap.data?.queuedChallenges],
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
      <ScreenChrome>
      <Screen style={s.container} edges={["left", "right"]}>
        <FlashList
          data={[{ key: "guest-home" }]}
          keyExtractor={guestKeyExtractor}
          renderItem={() => (
            <View style={[s.guestWrap, { paddingTop: insets.top + DS_V3.space.section }]}>
              <Text style={s.guestTitle}>GRIIT</Text>
              {FLAGS.STARTER_TASK_ENABLED ? (
                <View testID="home-starter-card">
                  <Text style={s.guestBody}>{EMPTY_HOME_STARTER_TITLE}</Text>
                  <Text style={s.guestBody}>{EMPTY_HOME_STARTER_BODY}</Text>
                  <Button
                    label={EMPTY_HOME_STARTER_CTA}
                    onPress={() => void onStartStarter()}
                    submitting={starterBusy}
                    testID="home-starter-start"
                  />
                </View>
              ) : (
                <Text style={s.guestBody}>
                  Sign in to start your discipline streak and see what your friends are doing.
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={[s.guestList, { paddingBottom: tabBarContentPad(insets.bottom) }]}
          showsVerticalScrollIndicator={false}
        />
      </Screen>
      </ScreenChrome>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenChrome>
      <Screen style={s.container} edges={["left", "right"]}>
        <LiveFeedSection
          onRefresh={refresh}
          scope={feedScope}
          onScopeChange={onFeedScopeChange}
          activeChallengesCount={countActiveEnrollments(
            (Array.isArray(bootstrap.data?.activeChallenges)
              ? bootstrap.data.activeChallenges
              : []) as { status?: string }[],
          )}
          viewerTargetStreak={bootstrap.data?.profile?.target_streak ?? null}
          inviteChallenge={inviteTarget ? { id: inviteTarget.id, name: inviteTarget.name } : null}
          showInvite={showInvite}
          ListHeaderComponent={
            <View>
            {conceptBanner ? (
              <Text style={s.concept} accessibilityRole="text">{conceptBanner}</Text>
            ) : null}
            <StarterTodayRow
              challengeTitle={inviteTarget?.name ?? null}
              durationDays={null}
              onChanged={refresh}
            />
            <HomeV3
              title={greeting(
                new Date(),
                profile?.display_name,
                profile?.username ?? "",
                homeTimeZone,
                firstNameFromAuth(user),
              )}
              dateLine={homeScreenDate(new Date(), homeTimeZone)}
              streak={streak}
              streakToKeep={recon.result?.lostStreak ?? null}
              streakLine={streakLine}
              morningAfter={morningAfter}
              proof={proof}
              startsTomorrow={startsTomorrow}
              weekStates={homeStrip.states}
              weekLetters={homeStrip.letters}
              todayIndex={homeStrip.todayIndex}
              firstWeekDay={homeStrip.day}
              fillToday={todaySecured}
              daySecured={todaySecured}
              onFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
              onCreateChallenge={() => router.push(ROUTES.TABS_CREATE as never)}
              onStartStarter={() => void onStartStarter()}
              starterBusy={starterBusy}
              onPressStreak={() => {
                if (currentTaskToast()) return;
                setFreezeError(null);
                setStreakHeld(false);
                setShowStreakSheet(true);
              }}
              onPressProof={onPressPrimaryCTA}
              onPressTask={(id) => {
                const next = heroTasks.find((h) => h.id === id);
                if (!next || next.done) return;
                onPressTask(next);
              }}
              onCheckOff={onCheckOff}
              onPressChallenge={onPressChallenge}
              onPressShareToday={() => {
                if (user?.is_anonymous) {
                  setPostGate(true);
                  return;
                }
                setShareTodayOpen(true);
              }}
              sectionChoices={sectionChoices}
              onToggleSection={onToggleSection}
              freezesLeft={freezeStatus?.remaining ?? 0}
              noDaysOff={activeChallengesAreHard(
                (Array.isArray(bootstrap.data?.activeChallenges)
                  ? bootstrap.data.activeChallenges
                  : []) as Parameters<typeof activeChallengesAreHard>[0],
              )}
              highlightTaskId={highlightTaskId}
              loading={bootstrap.isPending && !bootstrap.data}
              firstDayLine={
                !todaySecured && proof.sections.some((s) => s.day === 1)
                  ? todayFirstDayLine(proof.totalCount)
                  : null
              }
              day2Hero={
                !todaySecured &&
                proof.sections.some((s) => s.day >= 2) &&
                typeof streak === "number"
                  ? todayDay2Hero(
                      streak,
                      remainingWindowsClosed(proof.sections.flatMap((s) => s.rows)),
                    )
                  : null
              }
              windowBanner={
                startTask && closeTimeLabel(startTask.gateTime)
                  ? windowClosesBanner(startTask.name, closeTimeLabel(startTask.gateTime))
                  : null
              }
              startLabel={
                !todaySecured && startTask ? startCtaLabel(startTask.name) : null
              }
              bestStreak={resolvedStats?.longestStreak ?? streak}
              nextTask={
                !todaySecured && startTask ? { id: startTask.id, title: startTask.name } : null
              }
              showFirstProofSlot={firstProofEver && !todaySecured}
              saveFailed={optimisticSaveError() != null}
              onRetrySave={runOptimisticRetry}
            />
            </View>
          }
        />
        <SaveStreakSheet
          visible={homeFocused && saveDismissed != null && shouldShowSaveStreak({
            isAnonymous: user?.is_anonymous === true,
            firstTaskDone: heroMetrics.tasksDoneToday > 0 || todaySecured,
            securedDays: resolvedStats?.totalDaysSecured ?? 0,
            aboutToPostPublic: postGate,
            dismissedAfterFirst: saveDismissed.first,
            dismissedAfterSecond: saveDismissed.second,
          })}
          onLater={() => {
            setPostGate(false);
            if ((resolvedStats?.totalDaysSecured ?? 0) >= 2) {
              setSaveDismissed((prev) => ({ first: prev?.first ?? false, second: true }));
              void AsyncStorage.setItem("griit.saveStreak.dismissedSecond", "1");
              return;
            }
            setSaveDismissed((prev) => ({ first: true, second: prev?.second ?? false }));
            void AsyncStorage.setItem("griit.saveStreak.dismissedFirst", "1");
          }}
          onSaved={() => setPostGate(false)}
        />
        <DayStickerSheet
          visible={shareTodayOpen}
          onDismiss={() => setShareTodayOpen(false)}
          challenges={proof.shareTodayChallenges}
          username={profile?.username}
          streak={streak ?? undefined}
          longestStreak={resolvedStats?.longestStreak}
          activeLine={proof.shareTodayChallenges.map((c) => c.name).join(" · ")}
          todayKey={todayKey}
          securedDateKeys={securedDateKeys}
          frozenDateKeys={(resolvedStats as { frozenDateKeys?: string[] } | null)?.frozenDateKeys ?? []}
        />
        <StreakSheet
          visible={showStreakSheet && !taskToastUp}
          held={streakHeld}
          weekday={weekdayLongForDateKey(yesterdayKey, homeTimeZone)}
          streak={streak ?? 0}
          done={proof.doneCount}
          total={proof.totalCount}
          missed={(recon.result?.missedTaskNames ?? []).join(", ")}
          freezesLeft={freezeStatus?.remaining ?? 0}
          freezeCap={freezeStatus?.limit}
          refill={freezeRefillDateLabel(freezeStatus?.lastFreezeUsedAt ?? null, homeTimeZone)}
          week={["M", "T", "W", "T", "F", "S", "S"].map((letter, i) => ({
            letter,
            filled: weekStates[i] === "secured" || weekStates[i] === "frozen",
            state: weekStates[i],
          }))}
          todayIndex={todayWeekIndex}
          offerFreeze={offerYesterdayFreeze}
          submitting={useFreeze.isPending}
          error={freezeError}
          onUse={() => {
            setFreezeError(null);
            useFreeze.mutate();
          }}
          onNotNow={() => {
            setShowStreakSheet(false);
            setFreezeError(null);
          }}
          onDone={() => {
            setShowStreakSheet(false);
            setStreakHeld(false);
          }}
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
      </Screen>
      </ScreenChrome>
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
  concept: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
    color: "#F5F3EE",
  },
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
