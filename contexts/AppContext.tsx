import { createContext, useContext, ReactNode, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';

// Define the context value type
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

// Create the context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);
  const [autoCreateError, setAutoCreateError] = useState<string | null>(null);
  const [fallbackProfile, setFallbackProfile] = useState<Record<string, any> | null>(null);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  
  const [hardTimeout, setHardTimeout] = useState(false);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      console.warn('[AppContext] Hard timeout reached (15s), forcing initialFetchDone');
      setHardTimeout(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [user]);

  const queryOpts = { enabled: !!user, retry: 2, retryDelay: 3000, staleTime: 60_000, networkMode: 'offlineFirst' as const };
  const profileQuery = trpc.profiles.get.useQuery(undefined, queryOpts);
  const statsQuery = trpc.profiles.getStats.useQuery(undefined, queryOpts);
  const activeChallengeQuery = trpc.challenges.getActive.useQuery(undefined, queryOpts);
  const storiesQuery = trpc.stories.list.useQuery(undefined, queryOpts);

  const createProfileMutation = trpc.profiles.create.useMutation({
    onSuccess: () => {
      console.log('[AppContext] Auto-created profile, refetching...');
      utils.profiles.get.invalidate();
      utils.profiles.getStats.invalidate();
    },
    onError: (err) => {
      console.error('[AppContext] Auto-create profile failed:', err.message);
      setAutoCreateError(err.message);
    },
  });

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
        utils.profiles.get.invalidate();
        utils.profiles.getStats.invalidate();
      }
    } catch (err) {
      console.error('[AppContext] Direct fallback exception:', err);
      setAutoCreateError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [fallbackAttempted, utils]);

  useEffect(() => {
    if (
      user &&
      profileQuery.isSuccess &&
      profileQuery.data === null &&
      !autoCreateAttempted &&
      !createProfileMutation.isLoading
    ) {
      console.log('[AppContext] Profile missing for user, auto-creating via tRPC...');
      setAutoCreateAttempted(true);
      const fallbackUsername = `user_${user.id.slice(0, 8)}`;
      const fallbackName = user.email?.split('@')[0] || fallbackUsername;
      createProfileMutation.mutate({
        username: fallbackUsername,
        display_name: fallbackName,
      });
    }
  }, [user, profileQuery.isSuccess, profileQuery.data, autoCreateAttempted, createProfileMutation]);

  useEffect(() => {
    if (
      user &&
      profileQuery.isError &&
      !fallbackAttempted &&
      !profileQuery.data &&
      !fallbackProfile
    ) {
      console.log('[AppContext] tRPC profile failed, trying direct Supabase fallback...');
      directProfileFallback(user.id, user.email ?? undefined);
    }
  }, [user, profileQuery.isError, profileQuery.data, fallbackAttempted, fallbackProfile, directProfileFallback]);

  useEffect(() => {
    if (!user) {
      setAutoCreateAttempted(false);
      setAutoCreateError(null);
      setFallbackProfile(null);
      setFallbackAttempted(false);
    }
  }, [user]);

  const hadProfileSuccess = useRef(false);
  const hadActiveChallengeSuccess = useRef(false);
  if (profileQuery.isSuccess) hadProfileSuccess.current = true;
  if (activeChallengeQuery.isSuccess) hadActiveChallengeSuccess.current = true;
  
  const activeChallenge = activeChallengeQuery.data;
  const challenge = activeChallenge?.challenges as any;
  
  const todayCheckinsQuery = trpc.checkins.getTodayCheckins.useQuery(
    { activeChallengeId: activeChallenge?.id || '' },
    { enabled: !!activeChallenge?.id, retry: false, networkMode: 'offlineFirst' as const }
  );
  
  const completeCheckInMutation = trpc.checkins.complete.useMutation({
    onSuccess: () => {
      utils.checkins.getTodayCheckins.invalidate();
      utils.challenges.getActive.invalidate();
    }
  });
  
  const secureDayMutation = trpc.checkins.secureDay.useMutation({
    onSuccess: () => {
      utils.challenges.getActive.invalidate();
      utils.profiles.getStats.invalidate();
    }
  });

  const todayDateLocal = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);
  
  const computeProgress = useMemo(() => {
    if (!challenge || !todayCheckinsQuery.data) {
      return { verifiedCount: 0, totalRequired: 0, progress: 0 };
    }
    
    const requiredTasks = challenge.challenge_tasks?.filter((t: any) => t.required) || [];
    const completedCount = todayCheckinsQuery.data.filter((c: any) => 
      c.status === 'completed' && requiredTasks.some((rt: any) => rt.id === c.task_id)
    ).length;
    
    const progress = requiredTasks.length > 0 ? (completedCount / requiredTasks.length) * 100 : 0;
    
    return { 
      verifiedCount: completedCount, 
      totalRequired: requiredTasks.length, 
      progress 
    };
  }, [challenge, todayCheckinsQuery.data]);
  
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
    completeCheckInMutation.mutate(params);
  }, [completeCheckInMutation]);

  const secureDay = useCallback(() => {
    if (activeChallenge?.id && canSecureDay) {
      secureDayMutation.mutate({ activeChallengeId: activeChallenge.id });
    }
  }, [activeChallenge, canSecureDay, secureDayMutation]);

  const profileAutoCreating = createProfileMutation.isLoading;
  const resolvedProfile = profileQuery.data || fallbackProfile;
  const profileHasLoaded = (profileQuery.isSuccess && profileQuery.data !== null) || profileQuery.isError || !!fallbackProfile;
  const activeChallengeHasLoaded = activeChallengeQuery.isSuccess || activeChallengeQuery.isError;
  const initialFetchDone = hardTimeout || ((profileHasLoaded || (profileQuery.isSuccess && autoCreateAttempted && !profileAutoCreating) || !!fallbackProfile) && activeChallengeHasLoaded);

  useEffect(() => {
    if (initialFetchDone && !hardTimeout) {
      setHardTimeout(false);
    }
  }, [initialFetchDone, hardTimeout]);

  const isError = (
    profileQuery.isError &&
    !hadProfileSuccess.current &&
    !profileQuery.data &&
    !fallbackProfile &&
    fallbackAttempted
  );

  const refetchAll = useCallback(async () => {
    await Promise.allSettled([
      profileQuery.refetch(),
      statsQuery.refetch(),
      activeChallengeQuery.refetch(),
      storiesQuery.refetch(),
    ]);
  }, [profileQuery, statsQuery, activeChallengeQuery, storiesQuery]);

  const profileMissing = !resolvedProfile && autoCreateAttempted && fallbackAttempted && !profileAutoCreating && !!autoCreateError;

  const value: AppContextValue = useMemo(() => ({
    profile: resolvedProfile,
    profileLoading: (profileQuery.isLoading || profileAutoCreating) && !resolvedProfile,
    profileMissing,
    autoCreateError,
    stats: statsQuery.data,
    activeChallenge,
    challenge,
    stories: storiesQuery.data || [],
    todayCheckins: todayCheckinsQuery.data || [],
    todayDateLocal,
    computeProgress,
    canSecureDay,
    completeTask,
    secureDay,
    isLoading: !initialFetchDone && !hardTimeout && !resolvedProfile && ((profileQuery.isLoading && profileQuery.fetchStatus !== 'idle') || profileAutoCreating || (activeChallengeQuery.isLoading && activeChallengeQuery.fetchStatus !== 'idle')),
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
    currentUser: { id: user?.id || '', name: profileQuery.data?.display_name || '', avatarUrl: profileQuery.data?.avatar_url || '' },
    activeUserChallenge: activeChallenge ? { currentDayIndex: 1 } : null,
    
    chatRoomSettings: {} as Record<string, { muteRoom: boolean; mentionsOnly: boolean }>,
    updateChatRoomSettings: async (_roomId: string, _settings: any) => {},
    
    currentChallenge: activeChallenge ? { tasks: challenge?.challenge_tasks || [] } : null,
    verifyTask: (_taskId: string, _verificationData: any, _task: any) => ({ success: true, failureReason: undefined }),
    getTaskStateForTemplate: (_taskId: string) => null as any,
  }), [
    resolvedProfile,
    profileQuery,
    profileAutoCreating,
    profileMissing,
    autoCreateError,
    statsQuery.data,
    activeChallenge,
    challenge,
    storiesQuery.data,
    todayCheckinsQuery.data,
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
