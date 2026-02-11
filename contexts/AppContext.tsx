import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

export const [AppProvider, useApp] = createContextHook(() => {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);
  const [autoCreateError, setAutoCreateError] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (
      user &&
      profileQuery.isSuccess &&
      profileQuery.data === null &&
      !autoCreateAttempted &&
      !createProfileMutation.isPending
    ) {
      console.log('[AppContext] Profile missing for user, auto-creating...');
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
    if (!user) {
      setAutoCreateAttempted(false);
      setAutoCreateError(null);
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

  const completeTask = (params: { 
    activeChallengeId: string; 
    taskId: string; 
    value?: number; 
    noteText?: string; 
    proofUrl?: string;
  }) => {
    completeCheckInMutation.mutate(params);
  };

  const secureDay = () => {
    if (activeChallenge?.id && canSecureDay) {
      secureDayMutation.mutate({ activeChallengeId: activeChallenge.id });
    }
  };

  const profileAutoCreating = createProfileMutation.isPending;
  const profileHasLoaded = (profileQuery.isSuccess && profileQuery.data !== null) || profileQuery.isError;
  const activeChallengeHasLoaded = activeChallengeQuery.isSuccess || activeChallengeQuery.isError;
  const initialFetchDone = hardTimeout || ((profileHasLoaded || (profileQuery.isSuccess && autoCreateAttempted && !profileAutoCreating)) && activeChallengeHasLoaded);

  useEffect(() => {
    if (initialFetchDone && !hardTimeout) {
      setHardTimeout(false);
    }
  }, [initialFetchDone, hardTimeout]);

  const isError = (
    profileQuery.isError &&
    !hadProfileSuccess.current &&
    !profileQuery.data
  );

  const refetchAll = async () => {
    await Promise.allSettled([
      profileQuery.refetch(),
      statsQuery.refetch(),
      activeChallengeQuery.refetch(),
      storiesQuery.refetch(),
    ]);
  };

  const profileMissing = profileQuery.isSuccess && profileQuery.data === null && autoCreateAttempted && !profileAutoCreating && !!autoCreateError;

  return {
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading || profileAutoCreating,
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
    isLoading: !initialFetchDone && !hardTimeout && ((profileQuery.isLoading && profileQuery.fetchStatus !== 'idle') || profileAutoCreating || (activeChallengeQuery.isLoading && activeChallengeQuery.fetchStatus !== 'idle')),
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
  };
});
