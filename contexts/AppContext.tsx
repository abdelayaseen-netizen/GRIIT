import { createContext, useContext, ReactNode, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { trpcQuery, trpcMutate } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';

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
  secureDay: () => void;
  isLoading: boolean;
  isError: boolean;
  initialFetchDone: boolean;
  refetchAll: () => Promise<void>;
  notifications: any[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
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
    const timer = setTimeout(() => {
      console.warn('[AppContext] Hard timeout reached (15s), forcing initialFetchDone');
      setHardTimeout(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const data = await trpcQuery('profiles.get');
      console.log('[AppContext] Profile fetched:', !!data);
      setProfile(data);
      setProfileError(false);
    } catch (err) {
      console.error('[AppContext] Profile fetch error:', err);
      setProfileError(true);
    } finally {
      setProfileLoading(false);
      setProfileFetched(true);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await trpcQuery('profiles.getStats');
      setStats(data);
    } catch (err) {
      console.error('[AppContext] Stats fetch error:', err);
    }
  }, [user]);

  const fetchActiveChallenge = useCallback(async () => {
    if (!user) return;
    try {
      const data = await trpcQuery('challenges.getActive');
      setActiveChallenge(data);
      setActiveChallengeError(false);
    } catch (err) {
      console.error('[AppContext] Active challenge fetch error:', err);
      setActiveChallengeError(true);
    } finally {
      setActiveChallengeLoaded(true);
    }
  }, [user]);

  const fetchStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await trpcQuery('stories.list');
      setStories(data || []);
    } catch (err) {
      console.error('[AppContext] Stories fetch error:', err);
    }
  }, [user]);

  const fetchTodayCheckins = useCallback(async (activeChallengeId: string) => {
    try {
      const data = await trpcQuery('checkins.getTodayCheckins', { activeChallengeId });
      setTodayCheckins(data || []);
    } catch (err) {
      console.error('[AppContext] Today checkins fetch error:', err);
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
    if (activeChallenge?.id) {
      fetchTodayCheckins(activeChallenge.id);
    }
  }, [activeChallenge?.id, fetchTodayCheckins]);

  const directProfileFallback = useCallback(async (userId: string, email?: string) => {
    if (fallbackAttempted) return;
    setFallbackAttempted(true);
    console.log('[AppContext] Attempting direct Supabase profile fallback...');
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existing && !fetchErr) {
        console.log('[AppContext] Direct fallback found existing profile');
        setFallbackProfile(existing);
        return;
      }

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        console.warn('[AppContext] Direct profile fetch error:', fetchErr.message);
      }

      console.log('[AppContext] No profile found, auto-creating via Supabase...');
      const fallbackUsername = `user_${userId.slice(0, 8)}`;
      const fallbackName = email?.split('@')[0] || fallbackUsername;

      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            username: fallbackUsername,
            display_name: fallbackName,
            bio: '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (createErr) {
        console.error('[AppContext] Direct profile create error:', createErr.message);
        setAutoCreateError(createErr.message);
        return;
      }

      if (created) {
        console.log('[AppContext] Direct fallback created profile successfully');
        setFallbackProfile(created);
      }
    } catch (err) {
      console.error('[AppContext] Direct fallback exception:', err);
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
      console.log('[AppContext] Profile missing for user, auto-creating via tRPC...');
      setAutoCreateAttempted(true);
      setProfileAutoCreating(true);
      const fallbackUsername = `user_${user.id.slice(0, 8)}`;
      const fallbackName = user.email?.split('@')[0] || fallbackUsername;
      trpcMutate('profiles.create', {
        username: fallbackUsername,
        display_name: fallbackName,
      }).then(() => {
        console.log('[AppContext] Auto-created profile, refetching...');
        fetchProfile();
        fetchStats();
      }).catch((err: any) => {
        console.error('[AppContext] Auto-create profile failed:', err.message);
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
      console.log('[AppContext] tRPC profile failed, trying direct Supabase fallback...');
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

  const todayDateLocal = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

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
  }) => {
    trpcMutate('checkins.complete', params).then(() => {
      if (activeChallenge?.id) fetchTodayCheckins(activeChallenge.id);
      fetchActiveChallenge();
    }).catch((err: any) => {
      console.error('[AppContext] Complete task error:', err);
    });
  }, [activeChallenge, fetchTodayCheckins, fetchActiveChallenge]);

  const secureDay = useCallback(() => {
    if (activeChallenge?.id && canSecureDay) {
      trpcMutate('checkins.secureDay', { activeChallengeId: activeChallenge.id }).then(() => {
        fetchActiveChallenge();
        fetchStats();
      }).catch((err: any) => {
        console.error('[AppContext] Secure day error:', err);
      });
    }
  }, [activeChallenge, canSecureDay, fetchActiveChallenge, fetchStats]);

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
    await Promise.allSettled([
      fetchProfile(),
      fetchStats(),
      fetchActiveChallenge(),
      fetchStories(),
    ]);
  }, [fetchProfile, fetchStats, fetchActiveChallenge, fetchStories]);

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

    notifications: [],
    markNotificationAsRead: async (_notificationId: string) => {},

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
    user,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
