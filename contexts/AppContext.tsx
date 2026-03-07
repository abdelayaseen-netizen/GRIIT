import { createContext, useContext, ReactNode, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { trpcQuery, trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { supabase } from '@/lib/supabase';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
  scheduleNextSecureReminder,
  cancelSecureReminders,
} from '@/lib/notifications';
import { registerPushTokenWithBackend } from '@/lib/register-push-token';
import { getTodayDateKey } from '@/lib/date-utils';

type AppContextValue = {
  profile: any;
  profileLoading: boolean;
  profileMissing: boolean;
  autoCreateError: string | null;
  stats: any;
  activeChallenge: any;
  challenge: any;
  stories: any[];
  todayCheckins: any[];
  todayDateLocal: string;
  computeProgress: { verifiedCount: number; totalRequired: number; progress: number };
  canSecureDay: boolean;
  completeTask: (params: { activeChallengeId: string; taskId: string; value?: number; noteText?: string; proofUrl?: string }) => void;
  secureDay: () => Promise<{ newStreakCount: number; lastStandEarned?: boolean } | undefined>;
  isLoading: boolean;
  isError: boolean;
  initialFetchDone: boolean;
  refetchAll: () => Promise<void>;
  refetchTodayCheckins: () => Promise<void>;
  challenges: any[];
  getChallengeRoom: (challengeId: string) => any;
  getChatMessages: (roomId: string) => any[];
  sendChatMessage: (params: any) => Promise<void>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  isChallengeMember: (challengeId: string) => boolean;
  currentUser: { id: string; name: string; avatarUrl: string };
  activeUserChallenge: { currentDayIndex: number } | null;
  chatRoomSettings: Record<string, { muteRoom: boolean; mentionsOnly: boolean }>;
  updateChatRoomSettings: (roomId: string, settings: any) => Promise<void>;
  currentChallenge: { tasks: any[] } | null;
  verifyTask: (taskId: string, verificationData: any, task: any) => { success: boolean; failureReason: string | undefined };
  getTaskStateForTemplate: (taskId: string) => any;
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
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);
  const [autoCreateError, setAutoCreateError] = useState<string | null>(null);
  const [fallbackProfile, setFallbackProfile] = useState<Record<string, any> | null>(null);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [profileAutoCreating, setProfileAutoCreating] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [activeChallengeError, setActiveChallengeError] = useState(false);
  const [activeChallengeLoaded, setActiveChallengeLoaded] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<any[]>([]);

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
      const data = await trpcQuery(TRPC.profiles.get);
      setProfile(data);
      setProfileError(false);
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
      const data = await trpcQuery(TRPC.profiles.getStats);
      setStats(data);
    } catch {
      // Stats fetch failed — non-blocking
    }
  }, [user]);

  const fetchActiveChallenge = useCallback(async (): Promise<any> => {
    if (!user) return null;
    try {
      const data = await trpcQuery(TRPC.challenges.getActive);
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

  const fetchStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await trpcQuery(TRPC.stories.list);
      setStories(data || []);
    } catch {
      // Stories fetch failed — non-blocking
    }
  }, [user]);

  const fetchTodayCheckins = useCallback(async (activeChallengeId: string) => {
    try {
      const data = await trpcQuery(TRPC.checkins.getTodayCheckins, { activeChallengeId });
      setTodayCheckins(data || []);
    } catch {
      // Today checkins failed — non-blocking
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchStats();
    fetchActiveChallenge();
    fetchStories();
  }, [user, fetchProfile, fetchStats, fetchActiveChallenge, fetchStories]);

  useEffect(() => {
    if (Platform.OS === 'web' || !user) return;
    requestNotificationPermissions().then((ok) => {
      if (ok) {
        setupNotificationChannel();
        registerPushTokenWithBackend().catch(() => {});
      }
    });
  }, [user]);

  useEffect(() => {
    if (Platform.OS === 'web' || !user || !stats) return;
    const todayKey = getTodayDateKey();
    const lastKey = stats.lastCompletedDateKey ?? null;
    const preferred = (stats as any)?.preferredSecureTime ?? '20:00';
    const lastStands = (stats as any)?.lastStandsAvailable ?? 0;
    if (lastKey === todayKey) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduleNextSecureReminder(preferred, tomorrow, lastStands).catch(() => {});
    } else {
      scheduleNextSecureReminder(preferred, undefined, lastStands).catch(() => {});
    }
    return () => {
      cancelSecureReminders();
    };
  }, [user, stats?.lastCompletedDateKey, (stats as any)?.preferredSecureTime, (stats as any)?.lastStandsAvailable]);

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
      }).catch((err: any) => {
        setAutoCreateError(err.message);
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
      setStories([]);
      setTodayCheckins([]);
    }
  }, [user]);

  const challenge = activeChallenge?.challenges as any;

  const todayDateLocal = useMemo(() => getTodayDateKey(), []);

  const computeProgress = useMemo(() => {
    if (!challenge || !todayCheckins.length) {
      return { verifiedCount: 0, totalRequired: 0, progress: 0 };
    }

    const requiredTasks = challenge.challenge_tasks?.filter((t: any) => t.required) || [];
    const completedCount = todayCheckins.filter((c: any) =>
      c.status === 'completed' && requiredTasks.some((rt: any) => rt.id === c.task_id)
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

  const completeTask = useCallback((params: {
    activeChallengeId: string;
    taskId: string;
    value?: number;
    noteText?: string;
    proofUrl?: string;
  }): Promise<void> => {
    return trpcMutate(TRPC.checkins.complete, params).then(() => {
      if (activeChallenge?.id) fetchTodayCheckins(activeChallenge.id);
      fetchActiveChallenge();
      fetchStats();
    });
  }, [activeChallenge, fetchTodayCheckins, fetchActiveChallenge, fetchStats]);

  const secureDay = useCallback(async (): Promise<{ newStreakCount: number; lastStandEarned?: boolean } | undefined> => {
    if (!activeChallenge?.id || !canSecureDay) return undefined;
    try {
      const result = await trpcMutate(TRPC.checkins.secureDay, { activeChallengeId: activeChallenge.id }) as { success: boolean; newStreakCount: number; lastStandEarned?: boolean };
      fetchActiveChallenge();
      fetchStats();
      if (Platform.OS !== 'web') {
        const preferred = (stats as any)?.preferredSecureTime ?? '20:00';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const currentLastStands = (stats as any)?.lastStandsAvailable ?? 0;
        const newLastStands = result?.lastStandEarned ? Math.min(2, currentLastStands + 1) : currentLastStands;
        scheduleNextSecureReminder(preferred, tomorrow, newLastStands).catch(() => {});
      }
      return result;
    } catch {
      return undefined;
    }
  }, [activeChallenge, canSecureDay, fetchActiveChallenge, fetchStats, stats]);

  const resolvedProfile = profile || fallbackProfile;
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
      fetchStories(),
    ]);
    const activeResult = results[2];
    const activeData = activeResult.status === 'fulfilled' ? activeResult.value : null;
    if (activeData?.id) await fetchTodayCheckins(activeData.id);
  }, [fetchProfile, fetchStats, fetchActiveChallenge, fetchStories, fetchTodayCheckins]);

  const refetchTodayCheckins = useCallback(async () => {
    if (activeChallenge?.id) await fetchTodayCheckins(activeChallenge.id);
  }, [activeChallenge?.id, fetchTodayCheckins]);

  const profileMissing = !resolvedProfile && autoCreateAttempted && fallbackAttempted && !profileAutoCreating && !!autoCreateError;

  const value: AppContextValue = useMemo(() => ({
    profile: resolvedProfile,
    profileLoading: (profileLoading || profileAutoCreating) && !resolvedProfile,
    profileMissing,
    autoCreateError,
    stats,
    activeChallenge,
    challenge,
    stories,
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
    getChallengeRoom: (_challengeId: string) => null as any,
    getChatMessages: (_roomId: string) => [],
    sendChatMessage: async (_params: any) => {},
    toggleMessageReaction: async (_messageId: string, _emoji: string) => {},
    isChallengeMember: (_challengeId: string) => false,
    currentUser: { id: user?.id || '', name: resolvedProfile?.display_name || '', avatarUrl: resolvedProfile?.avatar_url || '' },
    activeUserChallenge: activeChallenge ? { currentDayIndex: 1 } : null,

    chatRoomSettings: {} as Record<string, { muteRoom: boolean; mentionsOnly: boolean }>,
    updateChatRoomSettings: async (_roomId: string, _settings: any) => {},

    currentChallenge: activeChallenge ? { tasks: challenge?.challenge_tasks || [] } : null,
    verifyTask: (_taskId: string, _verificationData: any, _task: any) => ({ success: true, failureReason: undefined }),
    getTaskStateForTemplate: (_taskId: string) => null as any,
  }), [
    resolvedProfile,
    profileLoading,
    profileAutoCreating,
    profileMissing,
    autoCreateError,
    stats,
    activeChallenge,
    challenge,
    stories,
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
    user,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
