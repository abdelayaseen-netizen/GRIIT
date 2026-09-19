import { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from './AuthContext';
import { trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { HOME_BOOTSTRAP_QUERY_KEY, homeBootstrapQueryKey } from '@/lib/home-bootstrap-key';
import { useHomeBootstrap } from '@/lib/use-home-bootstrap';
import { getTodayDateKey } from '@/lib/date-utils';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { useAppChallengeMutations } from '@/hooks/useAppChallengeMutations';
import { AnalyticsBootstrap } from '@/components/AnalyticsBootstrap';
import { setSubscriptionState } from '@/lib/premium';
import { initSubscription, clearSubscription, checkPremiumStatus, getCustomerInfo, addSubscriptionChangeListener, ENTITLEMENT_ID } from '@/lib/subscription';
import { identify, resetAnalytics, trackEvent } from '@/lib/analytics';
import { setSentryUser, captureError } from '@/lib/sentry';
import { getDeviceIanaTimeZone } from '@/lib/iana-timezone';
import type { ProfileFromApi, StatsFromApi, ActiveChallengeFromApi, TodayCheckinForUser, ChallengeTaskFromApi } from '@/types';
import type { ServerVerificationRow } from '@/lib/verifying-proof';

type AppContextValue = {
  profile: ProfileFromApi | null;
  profileLoading: boolean;
  profileMissing: boolean;
  autoCreateError: string | null;
  stats: StatsFromApi | null;
  activeChallenge: ActiveChallengeFromApi | null;
  challenge: Record<string, unknown> | null;
  todayCheckins: TodayCheckinForUser[];
  todayDateLocal: string;
  computeProgress: { verifiedCount: number; totalRequired: number; progress: number };
  canSecureDay: boolean;
  completeTask: (params: {
    activeChallengeId: string;
    taskId: string;
    value?: number;
    noteText?: string;
    proofUrl?: string;
    photo_url?: string;
    heart_rate_avg?: number;
    heart_rate_peak?: number;
    location_latitude?: number;
    location_longitude?: number;
    timer_seconds_on_screen?: number;
    clocked_in_at?: string;
    task_mode?: "full" | "minimum";
    proof_payload_json?: { capturedAt: string; captured_in_app: boolean };
    distance_km?: number;
    duration_min?: number;
    entry_mode?: "hand" | "timer";
    workout_kind?: string;
    floor_min?: number | null;
    shareChoicePending?: boolean;
  }) => Promise<{
    firstTaskOfDay?: boolean;
    completionId?: string;
    verification?: { rows: ServerVerificationRow[] };
    requiredRemaining: number;
    dayAlreadySecured?: boolean;
    streakDays?: number;
    challengeDay?: number;
    challengeLength?: number;
    challengeName?: string;
    verificationKind?: "live_photo" | "timer" | "gps" | "word_count" | "self_report";
    dayProofs?: { eventId: string | null; imageUrl: string | null }[];
  } | void>;
  secureDay: (activeChallengeId: string) => Promise<{
    success?: boolean;
    alreadySecured?: boolean;
    newStreakCount: number;
    lastStandEarned?: boolean;
    challengeDay?: number;
    challengeCompleted?: boolean;
    challengeId?: string;
    challengeName?: string;
    totalDays?: number;
    streak?: number;
    secured?: boolean;
    challenge_done?: boolean;
    remaining_challenges?: number;
  }>;
  isLoading: boolean;
  isError: boolean;
  initialFetchDone: boolean;
  refetchAll: () => Promise<void>;
  refetchTodayCheckins: () => Promise<void>;
  challenges: unknown[];
  getChallengeRoom: (challengeId: string) => unknown;
  getChatMessages: (roomId: string) => unknown[];
  sendChatMessage: (params: Record<string, unknown>) => Promise<void>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  isChallengeMember: (challengeId: string) => boolean;
  currentUser: { id: string; name: string; avatarUrl: string };
  activeUserChallenge: { currentDayIndex: number } | null;
  chatRoomSettings: Record<string, { muteRoom: boolean; mentionsOnly: boolean }>;
  updateChatRoomSettings: (roomId: string, settings: Record<string, unknown>) => Promise<void>;
  currentChallenge: { tasks: ChallengeTaskFromApi[] } | null;
  verifyTask: (taskId: string, verificationData: unknown, task: unknown) => { success: boolean; failureReason: string | undefined };
  getTaskStateForTemplate: (taskId: string) => unknown;
  isPremium: boolean;
  refreshPremiumStatus: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [autoCreateError] = useState<string | null>(null);
  const bootstrap = useHomeBootstrap(user?.id);

  const failed = bootstrap.data?.failed ?? [];
  const profile = user?.id
    ? ((bootstrap.data?.profile as ProfileFromApi | null | undefined) ?? null)
    : null;
  const stats = user?.id
    ? ((bootstrap.data?.stats as StatsFromApi | null | undefined) ?? null)
    : null;
  const activeChallenge = user?.id
    ? ((bootstrap.data?.activeChallenge as ActiveChallengeFromApi | null | undefined) ?? null)
    : null;
  const bootstrapTodayCheckins = Array.isArray(bootstrap.data?.todayCheckins)
    ? (bootstrap.data.todayCheckins as TodayCheckinForUser[])
    : [];
  const [optimisticCheckins, setTodayCheckins] = useState<TodayCheckinForUser[] | null>(null);
  const todayCheckins = optimisticCheckins ?? bootstrapTodayCheckins;
  const setTodayCheckinsForMutations = useCallback<Dispatch<SetStateAction<TodayCheckinForUser[]>>>(
    (action) => {
      setTodayCheckins((prev) => {
        const base = prev ?? bootstrapTodayCheckins;
        return typeof action === "function" ? action(base) : action;
      });
    },
    [bootstrapTodayCheckins]
  );

  const [isPremium, setIsPremium] = useState(false);
  const prevPremiumForAnalytics = useRef<boolean | null>(null);
  /** Prevents repeated self-heal updates for the same device zone in one session. */
  const timezoneHealForDeviceRef = useRef<string | null>(null);
  const subscriptionInitedForUser = useRef<string | null>(null);

  const [hardTimeout, setHardTimeout] = useState(false);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setHardTimeout(true), 15000);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    setTodayCheckins(null);
  }, [bootstrap.dataUpdatedAt]);

  useEffect(() => {
    if (!user?.id) {
      setSubscriptionState(null, null);
      clearSubscription();
      resetAnalytics();
      timezoneHealForDeviceRef.current = null;
      subscriptionInitedForUser.current = null;
      setTodayCheckins(null);
      setIsPremium(false);
      prevPremiumForAnalytics.current = null;
      return;
    }
    if (!profile) return;
    const subStatus = profile.subscription_status;
    const subExpiry = profile.subscription_expiry;
    setSubscriptionState(subStatus ?? undefined, subExpiry ?? undefined);
    setIsPremium(subStatus === "premium" || subStatus === "trial");
    if (subscriptionInitedForUser.current !== user.id) {
      subscriptionInitedForUser.current = user.id;
      initSubscription(user.id).catch((err) => {
        captureError(err, "AppContext.initSubscription");
      });
    }
  }, [user?.id, profile]);

  const refetchBootstrap = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...HOME_BOOTSTRAP_QUERY_KEY] });
    if (user?.id) {
      await queryClient.refetchQueries({ queryKey: homeBootstrapQueryKey(user.id) });
    }
  }, [queryClient, user?.id]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    await refetchBootstrap();
  }, [user?.id, refetchBootstrap]);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    await refetchBootstrap();
  }, [user?.id, refetchBootstrap]);

  const fetchActiveChallenge = useCallback(async (): Promise<ActiveChallengeFromApi | null> => {
    if (!user?.id) return null;
    await refetchBootstrap();
    const cached = queryClient.getQueryData(homeBootstrapQueryKey(user.id));
    return (
      ((cached as { activeChallenge?: ActiveChallengeFromApi | null } | undefined)?.activeChallenge ??
        null)
    );
  }, [user?.id, refetchBootstrap, queryClient]);

  const fetchTodayCheckins = useCallback(async (_activeChallengeId: string) => {
    await refetchBootstrap();
    setTodayCheckins(null);
  }, [refetchBootstrap]);

  const resolvedProfile = profile;
  const profileTimezone = (resolvedProfile as { timezone?: string | null } | null)?.timezone;

  useEffect(() => {
    if (!user) return;
    const unsub = addSubscriptionChangeListener((premium) => setIsPremium(premium));
    return unsub;
  }, [user]);

  useEffect(() => {
    if (prevPremiumForAnalytics.current === true && !isPremium) {
      try {
        trackEvent("subscription_cancelled");
      } catch {
        /* non-fatal */
      }
    }
    prevPremiumForAnalytics.current = isPremium;
  }, [isPremium]);

  useEffect(() => {
    if (!user?.id || !bootstrap.isFetched) return;
    const p = profile;
    if (!p) return;
    const rawTier = (stats as StatsFromApi)?.tier ?? (p as ProfileFromApi)?.tier;
    const tier = typeof rawTier === "string" ? rawTier : undefined;
    identify(user.id, {
      email: user.email ?? undefined,
      isPremium,
      tier,
    });
    setSentryUser(user.id, user.email ?? undefined);

    const deviceTz = getDeviceIanaTimeZone();
    const profileTzRaw = (p as { timezone?: string | null }).timezone;
    const profileTz =
      typeof profileTzRaw === "string" ? profileTzRaw.trim() : "";
    const needsHeal = !profileTz || profileTz !== deviceTz;
    if (needsHeal && timezoneHealForDeviceRef.current !== deviceTz) {
      timezoneHealForDeviceRef.current = deviceTz;
      void trpcMutate(TRPC.profiles.update, { timezone: deviceTz })
        .then(() => {
          void fetchProfile();
        })
        .catch((err: unknown) => {
          captureError(err, "TimezoneSelfHeal");
          timezoneHealForDeviceRef.current = null;
        });
    }
  }, [user?.id, user?.email, profile, bootstrap.isFetched, isPremium, stats, fetchProfile]);

  const challenge = (activeChallenge?.challenges ?? null) as Record<string, unknown> | null;

  const todayDateLocal = useMemo(() => getTodayDateKey(profileTimezone), [profileTimezone]);

  const computeProgress = useMemo(() => {
    if (!challenge || !todayCheckins.length) {
      return { verifiedCount: 0, totalRequired: 0, progress: 0 };
    }

    const requiredTasks =
      (challenge.challenge_tasks as { id: string; config?: { required?: boolean } }[] | undefined)?.filter(
        (t) => (t.config?.required ?? true) === true
      ) || [];
    const completedCount = todayCheckins.filter((c: TodayCheckinForUser) =>
      c.status === 'completed' && requiredTasks.some((rt: { id: string }) => rt.id === c.task_id)
    ).length;

    const progress = requiredTasks.length > 0 ? (completedCount / requiredTasks.length) * 100 : 0;

    return {
      verifiedCount: completedCount,
      totalRequired: requiredTasks.length,
      progress
    };
  }, [challenge, todayCheckins]);

  const canSecureDay = useMemo(() => {
    return computeProgress.progress === 100 && computeProgress.totalRequired > 0;
  }, [computeProgress]);

  const eveningRemaining = useMemo(() => {
    const requiredTasks =
      (challenge?.challenge_tasks as
        | { id: string; type?: string; config?: { required?: boolean; require_photo_proof?: boolean; photo_required?: boolean } }[]
        | undefined)?.filter((t) => (t.config?.required ?? true) === true) ?? [];
    const completed = new Set(
      todayCheckins
        .filter((c: TodayCheckinForUser) => c.status === "completed")
        .map((c: TodayCheckinForUser) => c.task_id)
    );
    const leftover = requiredTasks.filter((t) => !completed.has(t.id));
    const cameraRemaining = leftover.filter((t) => {
      const cfg = t.config ?? {};
      return t.type === "photo" || cfg.require_photo_proof === true || cfg.photo_required === true;
    }).length;
    return {
      remaining: leftover.length,
      total: requiredTasks.length,
      challenge: typeof challenge?.title === "string" ? challenge.title : "GRIIT",
      cameraRemaining,
    };
  }, [challenge, todayCheckins]);

  useNotificationScheduler({
    user,
    stats,
    activeChallenge,
    timezone: profileTimezone,
    evening: eveningRemaining,
  });

  const { completeTask, secureDay } = useAppChallengeMutations({
    user,
    queryClient,
    activeChallenge,
    challenge,
    todayCheckins,
    setTodayCheckins: setTodayCheckinsForMutations,
    fetchTodayCheckins,
    fetchActiveChallenge,
    fetchStats,
    stats,
    profile,
    fallbackProfile: null,
  });

  const profileFetched = !!user?.id && bootstrap.isFetched;
  const profileLoading = !!user?.id && bootstrap.isPending && !bootstrap.data;
  const profileError =
    !!user?.id &&
    bootstrap.isFetched &&
    (bootstrap.isError || failed.includes("profile"));
  const initialFetchDone = hardTimeout || !user?.id || bootstrap.isFetched;

  const isError = profileError && !profile;

  const refetchAll = useCallback(async () => {
    await refetchBootstrap();
  }, [refetchBootstrap]);

  const refetchTodayCheckins = useCallback(async () => {
    if (activeChallenge?.id) await fetchTodayCheckins(activeChallenge.id);
  }, [activeChallenge?.id, fetchTodayCheckins]);

  const refreshPremiumStatus = useCallback(async () => {
    const info = await getCustomerInfo();
    if (info) {
      const ent = info.entitlements?.active?.[ENTITLEMENT_ID];
      const premium = ent != null;
      setSubscriptionState(premium ? 'premium' : 'free', ent?.expirationDate ?? null);
      setIsPremium(premium);
    } else {
      const ok = await checkPremiumStatus();
      setIsPremium(ok);
    }
  }, []);

  const profileMissing = profileError && !resolvedProfile && profileFetched;

  const value: AppContextValue = useMemo(() => ({
    profile: resolvedProfile,
    profileLoading: profileLoading && !resolvedProfile,
    profileMissing,
    autoCreateError,
    stats,
    activeChallenge,
    challenge,
    todayCheckins,
    todayDateLocal,
    computeProgress,
    canSecureDay,
    completeTask,
    secureDay,
    isLoading: !initialFetchDone && !hardTimeout && !resolvedProfile && profileLoading,
    isError,
    initialFetchDone,
    refetchAll,
    refetchTodayCheckins,

    challenges: [],
    getChallengeRoom: (_challengeId: string) => null,
    getChatMessages: (_roomId: string) => [],
    sendChatMessage: async (_params: Record<string, unknown>) => {},
    toggleMessageReaction: async (_messageId: string, _emoji: string) => {},
    isChallengeMember: (_challengeId: string) => false,
    currentUser: { id: user?.id || '', name: String((resolvedProfile as { display_name?: string } | null)?.display_name ?? ''), avatarUrl: String((resolvedProfile as { avatar_url?: string } | null)?.avatar_url ?? '') },
    activeUserChallenge: activeChallenge ? { currentDayIndex: 1 } : null,

    chatRoomSettings: {} as Record<string, { muteRoom: boolean; mentionsOnly: boolean }>,
    updateChatRoomSettings: async (_roomId: string, _settings: Record<string, unknown>) => {},

    currentChallenge: activeChallenge ? { tasks: (challenge?.challenge_tasks as ChallengeTaskFromApi[]) || [] } : null,
    verifyTask: (_taskId: string, _verificationData: unknown, _task: unknown) => ({ success: true, failureReason: undefined }),
    getTaskStateForTemplate: (_taskId: string) => null,
    isPremium,
    refreshPremiumStatus,
  }), [
    resolvedProfile,
    profileLoading,
    profileMissing,
    autoCreateError,
    stats,
    activeChallenge,
    challenge,
    todayCheckins,
    todayDateLocal,
    computeProgress,
    canSecureDay,
    completeTask,
    secureDay,
    initialFetchDone,
    hardTimeout,
    isError,
    refetchAll,
    refetchTodayCheckins,
    isPremium,
    refreshPremiumStatus,
    user,
  ]);

  return (
    <AppContext.Provider value={value}>
      <AnalyticsBootstrap />
      {children}
    </AppContext.Provider>
  );
}
