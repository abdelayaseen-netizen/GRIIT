import { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from 'expo-haptics';
import { useAuth } from './AuthContext';
import { trpcQuery, trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { supabase } from '@/lib/supabase';
import {
  scheduleNextSecureReminder,
  cancelSecureReminders,
  scheduleLapsedUserReminders,
  cancelLapsedUserReminders,
  scheduleMilestoneApproachingIfNeeded,
  scheduleMorningMotivation,
  cancelMorningMotivation,
  scheduleWeeklySummary,
  cancelWeeklySummary,
  scheduleChallengeCountdowns,
  scheduleTaskWindowAlerts,
  fireStreakCelebration,
  isStreakCelebrationMilestone,
} from '@/lib/notifications';
import { getTodayDateKey, countSecuredLast7Days } from '@/lib/date-utils';
import { deriveUserRank } from '@/lib/derive-user-rank';
import { setSubscriptionState } from '@/lib/premium';
import { initSubscription, clearSubscription, checkPremiumStatus, getCustomerInfo, addSubscriptionChangeListener } from '@/lib/subscription';
import { identify, resetAnalytics, trackEvent } from '@/lib/analytics';
import { setSentryUser, captureError } from '@/lib/sentry';
import type { ProfileFromApi, StatsFromApi, ActiveChallengeFromApi, TodayCheckinForUser, ChallengeTaskFromApi } from '@/types';
import { showGoalCelebration } from '@/store/celebrationStore';
import { useProofSharePromptStore } from '@/store/proofSharePromptStore';

const MILESTONE_SHARE_DAYS = new Set([7, 14, 21, 30, 45, 60, 75]);

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

  useEffect(() => {
    if (Platform.OS === 'web' || !user || !stats) return;
    const todayKey = getTodayDateKey();
    const lastKey = stats.lastCompletedDateKey ?? null;
    const preferred = (stats as StatsFromApi)?.preferredSecureTime ?? '20:00';
    const lastStands = (stats as StatsFromApi)?.lastStandsAvailable ?? 0;
    const streakCount = (stats as StatsFromApi)?.activeStreak ?? 0;
    if (lastKey === todayKey) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduleNextSecureReminder(preferred, tomorrow, lastStands, streakCount).catch(() => {
        // error swallowed — handle in UI
      });
    } else {
      scheduleNextSecureReminder(preferred, undefined, lastStands, streakCount).catch(() => {
        // error swallowed — handle in UI
      });
    }
    const challengeName = (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;
    scheduleLapsedUserReminders({ streakCount, challengeName }).catch(() => {
      // error swallowed — handle in UI
    });

    let cancelled = false;
    const runExtended = async () => {
      const settings = (await trpcQuery(TRPC.notifications.getReminderSettings).catch(() => null)) as {
        morning_kickoff_enabled?: boolean;
        weekly_summary_enabled?: boolean;
      } | null;
      if (cancelled) return;

      const ch = activeChallenge?.challenges as Record<string, unknown> | null | undefined;
      const taskRows = (ch?.challenge_tasks as unknown[] | undefined) ?? [];
      const taskCount = taskRows.length;
      const currentDay = (activeChallenge as { current_day?: number })?.current_day ?? 1;
      const challengeTitle = typeof ch?.title === 'string' ? ch.title : undefined;

      if (settings?.morning_kickoff_enabled !== false) {
        scheduleMorningMotivation({
          morningTime: '07:00',
          streakCount,
          taskCount,
          currentDay,
          challengeName: challengeTitle,
        }).catch(() => {});
      } else {
        await cancelMorningMotivation();
      }

      const securedKeys = (await trpcQuery(TRPC.profiles.getSecuredDateKeys).catch(() => [])) as string[];
      if (cancelled) return;

      const daysSecuredThisWeek = countSecuredLast7Days(Array.isArray(securedKeys) ? securedKeys : []);
      const basePoints = ((stats as StatsFromApi)?.totalDaysSecured ?? 0) * 5;

      if (settings?.weekly_summary_enabled !== false) {
        scheduleWeeklySummary({
          daysSecuredThisWeek,
          totalDaysThisWeek: 7,
          points: basePoints,
          rank: deriveUserRank(stats as StatsFromApi),
          streakCount,
        }).catch(() => {});
      } else {
        await cancelWeeklySummary();
      }

      const myActive = (await trpcQuery(TRPC.challenges.listMyActive).catch(() => [])) as {
        id?: string;
        current_day?: number;
        challenges?: {
          duration_days?: number;
          title?: string;
          challenge_tasks?: Record<string, unknown>[];
        };
      }[];
      if (cancelled) return;

      const countdownData = (Array.isArray(myActive) ? myActive : [])
        .filter((ac) => ac.challenges?.duration_days != null && ac.current_day != null)
        .map((ac) => ({
          id: ac.id ?? '',
          name: ac.challenges?.title ?? 'Challenge',
          currentDay: ac.current_day ?? 1,
          totalDays: ac.challenges?.duration_days ?? 1,
        }))
        .filter((d) => d.id);
      scheduleChallengeCountdowns(countdownData).catch(() => {});

      const winTasks: {
        id: string;
        taskType?: string;
        anchorTimeLocal?: string | null;
        windowStartOffsetMin?: number | null;
        challengeName?: string;
      }[] = [];
      for (const ac of Array.isArray(myActive) ? myActive : []) {
        const ch = ac.challenges;
        const title = ch?.title ?? 'Challenge';
        const tasks = ch?.challenge_tasks ?? [];
        for (const t of tasks) {
          const cfg = (t as { config?: Record<string, unknown> }).config;
          if (cfg && cfg.timeEnforcementEnabled === false) continue;

          const anchorFromCfg = typeof cfg?.anchorTimeLocal === 'string' ? cfg.anchorTimeLocal : null;
          const anchor =
            anchorFromCfg ??
            (typeof (t as { anchorTimeLocal?: string }).anchorTimeLocal === 'string'
              ? (t as { anchorTimeLocal: string }).anchorTimeLocal
              : null) ??
            (typeof (t as { anchor_time_local?: string }).anchor_time_local === 'string'
              ? (t as { anchor_time_local: string }).anchor_time_local
              : null);
          if (!anchor?.trim()) continue;

          const w =
            typeof (t as { windowStartOffsetMin?: number }).windowStartOffsetMin === 'number'
              ? (t as { windowStartOffsetMin: number }).windowStartOffsetMin
              : typeof (t as { window_start_offset_min?: number }).window_start_offset_min === 'number'
                ? (t as { window_start_offset_min: number }).window_start_offset_min
              : typeof cfg?.windowStartOffsetMin === 'number'
                ? (cfg.windowStartOffsetMin as number)
                : 0;

          const rawType = (t as { type?: string }).type;
          winTasks.push({
            id: `${ac.id ?? 'ac'}-${String((t as { id?: string }).id)}`,
            taskType: typeof rawType === 'string' ? rawType : undefined,
            anchorTimeLocal: anchor,
            windowStartOffsetMin: w,
            challengeName: title,
          });
        }
      }
      scheduleTaskWindowAlerts(winTasks).catch(() => {});
    };
    void runExtended();

    return () => {
      cancelled = true;
      cancelSecureReminders();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps derived from stats; listing stats would re-run on any stats change
  }, [
    user,
    stats?.lastCompletedDateKey,
    (stats as StatsFromApi)?.preferredSecureTime,
    (stats as StatsFromApi)?.lastStandsAvailable,
    (stats as StatsFromApi)?.totalDaysSecured,
    (stats as StatsFromApi)?.activeStreak,
    (stats as StatsFromApi)?.tier,
    activeChallenge?.id,
    activeChallenge?.challenges,
  ]);

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

  const todayDateLocal = useMemo(() => getTodayDateKey(), []);

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

  const completeTask = useCallback((params: {
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
  }): Promise<{ firstTaskOfDay?: boolean; completionId?: string } | void> => {
    const requiredTasks = (challenge?.challenge_tasks as { id: string; required?: boolean }[] | undefined)?.filter((t) => t.required) || [];
    const completedCountBefore = todayCheckins.filter((c: TodayCheckinForUser) =>
      c.status === 'completed' && requiredTasks.some((rt: { id: string }) => rt.id === c.task_id)
    ).length;
    const firstTaskOfDay = completedCountBefore === 0 && requiredTasks.length > 1;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const previousCheckins = todayCheckins.slice();
    const optimisticCheckin = {
      active_challenge_id: params.activeChallengeId,
      task_id: params.taskId,
      status: "completed" as const,
    };
    setTodayCheckins((prev) => [...prev, optimisticCheckin]);

    return trpcMutate<{ id?: string }>(TRPC.checkins.complete, params)
      .then((data) => {
        const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
        const challengeIdForRetention = (activeChallenge as { challenge_id?: string } | null)?.challenge_id;
        if (currentDay >= 7 && challengeIdForRetention) {
          try {
            trackEvent("day_7_retained", { challenge_id: challengeIdForRetention, day_number: currentDay });
          } catch {
            /* non-fatal */
          }
        }
        if (currentDay === 3 && challengeIdForRetention) {
          try {
            trackEvent("day_3_retained", { challenge_id: challengeIdForRetention });
          } catch {
            /* non-fatal */
          }
        }
        if (activeChallenge?.id) void fetchTodayCheckins(activeChallenge.id);
        void fetchActiveChallenge();
        void fetchStats();
        void queryClient.invalidateQueries({ queryKey: ["home"] });
        void queryClient.invalidateQueries({ queryKey: ["home", "v2", user?.id ?? ""] });
        void queryClient.invalidateQueries({ queryKey: ["discover", "myActive", user?.id ?? ""] });
        void queryClient.invalidateQueries({ queryKey: ["discover", "completed", user?.id ?? ""] });
        void queryClient.invalidateQueries({ queryKey: ["community", "activeChallenges", user?.id ?? ""] });
        void queryClient.invalidateQueries({ queryKey: ["community", "feed", user?.id] });
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        showGoalCelebration(5);
        const tasks = (challenge?.challenge_tasks as ChallengeTaskFromApi[] | undefined) ?? [];
        const taskType = tasks.find((t) => t.id === params.taskId)?.type ?? 'unknown';
        const cid = (activeChallenge as ActiveChallengeFromApi | null)?.challenge_id;
        if (cid) {
          try {
            trackEvent("task_completed", { challenge_id: cid, task_type: String(taskType) });
          } catch {
            /* non-fatal */
          }
        }
        return { firstTaskOfDay, completionId: data?.id };
      })
      .catch((err: unknown) => {
        setTodayCheckins(previousCheckins);
        const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn't save. Tap to retry.";
        captureError(err, "AppContextCompleteTask");
        throw new Error(msg);
      });
  }, [activeChallenge, challenge, todayCheckins, fetchTodayCheckins, fetchActiveChallenge, fetchStats, queryClient, user?.id]);

  const secureDay = useCallback(async (): Promise<{
    newStreakCount: number;
    lastStandEarned?: boolean;
    challengeCompleted?: boolean;
    challengeId?: string;
    challengeName?: string;
    totalDays?: number;
  } | undefined> => {
    if (!activeChallenge?.id || !canSecureDay) return undefined;
    try {
      const result = await trpcMutate(TRPC.checkins.secureDay, { activeChallengeId: activeChallenge.id }) as {
        success: boolean;
        newStreakCount: number;
        lastStandEarned?: boolean;
        challengeDay?: number;
        challengeCompleted?: boolean;
        challengeId?: string;
        challengeName?: string;
        totalDays?: number;
      };
      const securedChallengeId =
        result.challengeId ?? (activeChallenge as { challenge_id?: string }).challenge_id ?? "";
      const dayNum = result.challengeDay ?? (activeChallenge as { current_day?: number }).current_day ?? 0;
      if (securedChallengeId) {
        try {
          trackEvent("day_secured", { challenge_id: securedChallengeId, day_number: dayNum });
        } catch {
          /* non-fatal */
        }
      }
      const dayN = result.challengeDay;
      if (typeof dayN === 'number' && MILESTONE_SHARE_DAYS.has(dayN)) {
        const prof = profile || fallbackProfile;
        const uname = String((prof as { username?: string } | null)?.username ?? 'user').replace(/^@+/, '');
        const nested = (activeChallenge as { challenges?: { title?: string; duration_days?: number } } | null)?.challenges;
        useProofSharePromptStore.getState().show({
          userName: uname,
          challengeTitle: nested?.title ?? 'Challenge',
          dayNumber: dayN,
          totalDays: nested?.duration_days ?? 75,
          streakCount: result.newStreakCount ?? 0,
        });
      }
      void fetchActiveChallenge();
      void fetchStats();
      const streakN = result?.newStreakCount;
      if (typeof streakN === 'number' && [7, 14, 30, 75].includes(streakN)) {
        trackEvent('streak_milestone', { days: streakN });
      }
      if (Platform.OS !== 'web') {
        const preferred = (stats as StatsFromApi)?.preferredSecureTime ?? '20:00';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const currentLastStands = (stats as StatsFromApi)?.lastStandsAvailable ?? 0;
        const newLastStands = result?.lastStandEarned ? Math.min(2, currentLastStands + 1) : currentLastStands;
        const newStreakCount = result?.newStreakCount ?? (stats as StatsFromApi)?.activeStreak ?? 0;
        scheduleNextSecureReminder(preferred, tomorrow, newLastStands, newStreakCount).catch(() => {
          // error swallowed — handle in UI
        });
        await cancelLapsedUserReminders();
        const challengeName = (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;
        await scheduleLapsedUserReminders({ streakCount: newStreakCount, challengeName });
        scheduleMilestoneApproachingIfNeeded(newStreakCount).catch(() => {
          // error swallowed — handle in UI
        });
        if (isStreakCelebrationMilestone(newStreakCount)) {
          fireStreakCelebration(newStreakCount).catch(() => {});
        }
      }
      return result;
    } catch {
      return undefined;
    }
  }, [activeChallenge, canSecureDay, fetchActiveChallenge, fetchStats, stats, profile, fallbackProfile]);

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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
