import { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from './AuthContext';
import { trpcQuery, trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { supabase } from '@/lib/supabase';
import { getTodayDateKey } from '@/lib/date-utils';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { useAppChallengeMutations } from '@/hooks/useAppChallengeMutations';
import { AnalyticsBootstrap } from '@/components/AnalyticsBootstrap';
import { setSubscriptionState } from '@/lib/premium';
import { initSubscription, clearSubscription, checkPremiumStatus, getCustomerInfo, addSubscriptionChangeListener } from '@/lib/subscription';
import { identify, resetAnalytics, trackEvent } from '@/lib/analytics';
import { setSentryUser } from '@/lib/sentry';
import type { ProfileFromApi, StatsFromApi, ActiveChallengeFromApi, TodayCheckinForUser, ChallengeTaskFromApi } from '@/types';

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
  }) => Promise<{ firstTaskOfDay?: boolean; completionId?: string } | void>;
  secureDay: () => Promise<{
    newStreakCount: number;
    lastStandEarned?: boolean;
    challengeDay?: number;
    challengeCompleted?: boolean;
    challengeId?: string;
    challengeName?: string;
    totalDays?: number;
  } | undefined>;
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
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);
  const [autoCreateError, setAutoCreateError] = useState<string | null>(null);
  const [fallbackProfile, setFallbackProfile] = useState<Record<string, unknown> | null>(null);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [profileAutoCreating, setProfileAutoCreating] = useState(false);

  const [profile, setProfile] = useState<ProfileFromApi | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const [stats, setStats] = useState<StatsFromApi | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallengeFromApi | null>(null);
  const [, setActiveChallengeError] = useState(false);
  const [activeChallengeLoaded, setActiveChallengeLoaded] = useState(false);
  const [todayCheckins, setTodayCheckins] = useState<TodayCheckinForUser[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const prevPremiumForAnalytics = useRef<boolean | null>(null);

  const [hardTimeout, setHardTimeout] = useState(false);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setHardTimeout(true), 15000);
    return () => clearTimeout(timer);
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const data = await trpcQuery<ProfileFromApi>(TRPC.profiles.get);
      setProfile(data);
      const subStatus = (data as ProfileFromApi)?.subscription_status;
      const subExpiry = (data as ProfileFromApi)?.subscription_expiry;
      setSubscriptionState(subStatus ?? undefined, subExpiry ?? undefined);
      const premiumFromProfile = subStatus === 'premium' || subStatus === 'trial';
      setIsPremium(premiumFromProfile);
      setProfileError(false);
      initSubscription(user.id).catch(() => {
        // error swallowed — handle in UI
      });
    } catch {
      setProfileError(true);
    } finally {
      setProfileLoading(false);
      setProfileFetched(true);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await trpcQuery<StatsFromApi>(TRPC.profiles.getStats);
      setStats(data);
    } catch {
      // Stats fetch failed — non-blocking
    }
  }, [user]);

  const fetchActiveChallenge = useCallback(async (): Promise<ActiveChallengeFromApi | null> => {
    if (!user) return null;
    try {
      const data = await trpcQuery<ActiveChallengeFromApi | null>(TRPC.challenges.getActive);
      setActiveChallenge(data);
      setActiveChallengeError(false);
      setActiveChallengeLoaded(true);
      return data;
    } catch {
      setActiveChallengeError(true);
      setActiveChallengeLoaded(true);
      return null;
    }
  }, [user]);

  const fetchTodayCheckins = useCallback(async (activeChallengeId: string) => {
    try {
      const data = await trpcQuery<TodayCheckinForUser[]>(TRPC.checkins.getTodayCheckins, { activeChallengeId });
      setTodayCheckins(data || []);
    } catch {
      // Today checkins failed — non-blocking
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setStats(null);
      setSubscriptionState(null, null);
      clearSubscription();
      resetAnalytics();
      return;
    }
    void Promise.allSettled([fetchProfile(), fetchStats(), fetchActiveChallenge()]).then((results) => {
      const activeResult = results[2];
      if (activeResult.status === "fulfilled") {
        const ac = activeResult.value as { id?: string } | null;
        if (ac?.id) void fetchTodayCheckins(ac.id);
      }
    });
  }, [user, fetchProfile, fetchStats, fetchActiveChallenge, fetchTodayCheckins]);

  const resolvedProfile = profile || fallbackProfile;
  const profileTimezone = (resolvedProfile as { timezone?: string | null } | null)?.timezone;
  useNotificationScheduler({ user, stats, activeChallenge, timezone: profileTimezone });

  useEffect(() => {
    if (activeChallenge?.id) {
      fetchTodayCheckins(activeChallenge.id);
    }
  }, [activeChallenge?.id, fetchTodayCheckins]);

  const directProfileFallback = useCallback(async (userId: string, email?: string) => {
    if (fallbackAttempted) return;
    setFallbackAttempted(true);
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing && !fetchErr) {
        setFallbackProfile(existing);
        return;
      }

      const fallbackUsername = `user_${userId.slice(0, 8)}`;
      const fallbackName = email?.split('@')[0] || fallbackUsername;

      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: userId,
            username: fallbackUsername,
            display_name: fallbackName,
            bio: '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (createErr) {
        setAutoCreateError(createErr.message);
        return;
      }

      if (created) setFallbackProfile(created);
    } catch (err) {
      setAutoCreateError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [fallbackAttempted]);

  useEffect(() => {
    if (
      user &&
      profileFetched &&
      profile === null &&
      !autoCreateAttempted &&
      !profileAutoCreating
    ) {
      setAutoCreateAttempted(true);
      setProfileAutoCreating(true);
      const fallbackUsername = `user_${user.id.slice(0, 8)}`;
      const fallbackName = user.email?.split('@')[0] || fallbackUsername;
      trpcMutate(TRPC.profiles.create, {
        username: fallbackUsername,
        display_name: fallbackName,
      }).then(() => {
        fetchProfile();
        fetchStats();
      }).catch((err: unknown) => {
        setAutoCreateError(err instanceof Error ? err.message : String(err));
      }).finally(() => {
        setProfileAutoCreating(false);
      });
    }
  }, [user, profileFetched, profile, autoCreateAttempted, profileAutoCreating, fetchProfile, fetchStats]);

  useEffect(() => {
    if (
      user &&
      profileError &&
      !fallbackAttempted &&
      !profile &&
      !fallbackProfile
    ) {
      directProfileFallback(user.id, user.email ?? undefined);
    }
  }, [user, profileError, profile, fallbackAttempted, fallbackProfile, directProfileFallback]);

  useEffect(() => {
    if (!user) {
      setAutoCreateAttempted(false);
      setAutoCreateError(null);
      setFallbackProfile(null);
      setFallbackAttempted(false);
      setProfile(null);
      setProfileFetched(false);
      setProfileError(false);
      setStats(null);
      setActiveChallenge(null);
      setActiveChallengeLoaded(false);
      setTodayCheckins([]);
      setIsPremium(false);
      prevPremiumForAnalytics.current = null;
    }
  }, [user]);

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
    if (!user?.id || !profileFetched) return;
    const p = profile || fallbackProfile;
    if (!p) return;
    const rawTier = (stats as StatsFromApi)?.tier ?? (p as ProfileFromApi)?.tier;
    const tier = typeof rawTier === "string" ? rawTier : undefined;
    identify(user.id, {
      email: user.email ?? undefined,
      isPremium,
      tier,
    });
    setSentryUser(user.id, user.email ?? undefined);
  }, [user?.id, user?.email, profile, fallbackProfile, profileFetched, isPremium, stats]);

  const challenge = (activeChallenge?.challenges ?? null) as Record<string, unknown> | null;

  const todayDateLocal = useMemo(() => getTodayDateKey(profileTimezone), [profileTimezone]);

  const computeProgress = useMemo(() => {
    if (!challenge || !todayCheckins.length) {
      return { verifiedCount: 0, totalRequired: 0, progress: 0 };
    }

    const requiredTasks = (challenge.challenge_tasks as { id: string; required?: boolean }[] | undefined)?.filter((t) => t.required) || [];
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

  const { completeTask, secureDay } = useAppChallengeMutations({
    user,
    queryClient,
    activeChallenge,
    challenge,
    todayCheckins,
    setTodayCheckins,
    fetchTodayCheckins,
    fetchActiveChallenge,
    fetchStats,
    stats,
    profile,
    fallbackProfile,
    canSecureDay,
  });

  const profileHasLoaded = (profileFetched && profile !== null) || profileError || !!fallbackProfile;
  const initialFetchDone = hardTimeout || ((profileHasLoaded || (profileFetched && autoCreateAttempted && !profileAutoCreating) || !!fallbackProfile) && activeChallengeLoaded);

  const isError = (
    profileError &&
    !profile &&
    !fallbackProfile &&
    fallbackAttempted
  );

  const refetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchProfile(),
      fetchStats(),
      fetchActiveChallenge(),
    ]);
    const activeResult = results[2];
    const activeData = activeResult.status === 'fulfilled' ? activeResult.value : null;
    const ac = activeData as { id?: string } | null | undefined;
    if (ac?.id) await fetchTodayCheckins(ac.id);
  }, [fetchProfile, fetchStats, fetchActiveChallenge, fetchTodayCheckins]);

  const refetchTodayCheckins = useCallback(async () => {
    if (activeChallenge?.id) await fetchTodayCheckins(activeChallenge.id);
  }, [activeChallenge?.id, fetchTodayCheckins]);

  const refreshPremiumStatus = useCallback(async () => {
    const info = await getCustomerInfo();
    if (info) {
      const ent = info.entitlements?.active?.['premium'];
      const premium = ent != null;
      setSubscriptionState(premium ? 'premium' : 'free', ent?.expirationDate ?? null);
      setIsPremium(premium);
    } else {
      const ok = await checkPremiumStatus();
      setIsPremium(ok);
    }
  }, []);

  const profileMissing = !resolvedProfile && autoCreateAttempted && fallbackAttempted && !profileAutoCreating && !!autoCreateError;

  const value: AppContextValue = useMemo(() => ({
    profile: resolvedProfile,
    profileLoading: (profileLoading || profileAutoCreating) && !resolvedProfile,
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
    isLoading: !initialFetchDone && !hardTimeout && !resolvedProfile && (profileLoading || profileAutoCreating),
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
    profileAutoCreating,
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
