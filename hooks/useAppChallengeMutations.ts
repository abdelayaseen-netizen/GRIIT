import { useCallback, type Dispatch, type SetStateAction } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import type { QueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  scheduleNextSecureReminder,
  scheduleLapsedUserReminders,
  cancelLapsedUserReminders,
  scheduleMilestoneApproachingIfNeeded,
  fireStreakCelebration,
  isStreakCelebrationMilestone,
} from "@/lib/notifications";
import { track, trackDay30Completed, trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { showGoalCelebration } from "@/store/celebrationStore";
import { useProofSharePromptStore } from "@/store/proofSharePromptStore";
import type {
  StatsFromApi,
  ActiveChallengeFromApi,
  TodayCheckinForUser,
  ChallengeTaskFromApi,
} from "@/types";

const MILESTONE_SHARE_DAYS = new Set([7, 14, 21, 30, 45, 60, 75]);

type UserRef = { id?: string } | null;

type UseAppChallengeMutationsArgs = {
  user: UserRef;
  queryClient: QueryClient;
  activeChallenge: ActiveChallengeFromApi | null;
  challenge: Record<string, unknown> | null;
  todayCheckins: TodayCheckinForUser[];
  setTodayCheckins: Dispatch<SetStateAction<TodayCheckinForUser[]>>;
  fetchTodayCheckins: (activeChallengeId: string) => Promise<void>;
  fetchActiveChallenge: () => Promise<ActiveChallengeFromApi | null>;
  fetchStats: () => Promise<void>;
  stats: StatsFromApi | null;
  profile: unknown;
  fallbackProfile: unknown;
  canSecureDay: boolean;
};

function calculateDaysSinceSignup(profileLike: unknown): number | null {
  const createdAt = (profileLike as { created_at?: string | null } | null)?.created_at;
  if (!createdAt) return null;
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(createdAtMs)) return null;
  const diffMs = Date.now() - createdAtMs;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function useAppChallengeMutations({
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
}: UseAppChallengeMutationsArgs) {
  const completeTask = useCallback(
    (params: {
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
    }): Promise<{ firstTaskOfDay?: boolean; completionId?: string } | void> => {
      const requiredTasks =
        (challenge?.challenge_tasks as { id: string; config?: { required?: boolean } }[] | undefined)?.filter(
          (t) => (t.config?.required ?? true) === true
        ) || [];
      const completedCountBefore = todayCheckins.filter(
        (c: TodayCheckinForUser) =>
          c.status === "completed" && requiredTasks.some((rt: { id: string }) => rt.id === c.task_id)
      ).length;
      const firstTaskOfDay = completedCountBefore === 0 && requiredTasks.length > 1;

      if (Platform.OS !== "web") {
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
        .then(async (data) => {
          const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
          const challengeIdForRetention = (activeChallenge as { challenge_id?: string } | null)?.challenge_id;
          const activeStreak = (stats as StatsFromApi | null)?.activeStreak;
          const daysSinceSignup = calculateDaysSinceSignup(profile ?? fallbackProfile);
          if (currentDay >= 7 && challengeIdForRetention) {
            try {
              trackEvent("day_7_retained", { challenge_id: challengeIdForRetention, day_number: currentDay });
            } catch {
              /* non-fatal */
            }
          }
          if (daysSinceSignup === 30 && challengeIdForRetention) {
            try {
              trackDay30Completed({
                challenge_id: challengeIdForRetention,
                day_number: currentDay,
                days_since_signup: daysSinceSignup,
              });
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
          const isMinimumDay = params.task_mode === "minimum";
          if (isMinimumDay) {
            try {
              track({
                name: "minimum_day_completed",
                challenge_id: challengeIdForRetention,
                streak_count: activeStreak,
                day_number: currentDay,
              });
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
          const taskType = tasks.find((t) => t.id === params.taskId)?.type ?? "unknown";
          const cid = (activeChallenge as ActiveChallengeFromApi | null)?.challenge_id;
          if (cid) {
            try {
              trackEvent("task_completed", { challenge_id: cid, task_type: String(taskType) });
            } catch {
              /* non-fatal */
            }
          }
          try {
            if (firstTaskOfDay && cid) {
              const isFirstEver = !(await AsyncStorage.getItem("griit_has_completed_task"));
              if (isFirstEver) {
                try {
                  track({ name: "first_task_completed", challengeId: cid });
                } catch {
                  /* non-fatal */
                }
                await AsyncStorage.setItem("griit_has_completed_task", "true");
              }
            }
          } catch {
            /* non-fatal */
          }
          if (currentDay === 1 && cid) {
            try {
              track({
                name: "day1_task_completed",
                challengeId: cid,
                ttfv_seconds: undefined,
                starter_id: undefined,
                primary_goal: undefined,
                daily_time_budget: undefined,
              });
            } catch {
              /* non-fatal */
            }
          }
          return { firstTaskOfDay, completionId: data?.id };
        })
        .catch((err: unknown) => {
          setTodayCheckins(previousCheckins);
          const msg =
            err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn't save. Tap to retry.";
          captureError(err, "AppContextCompleteTask");
          throw new Error(msg);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setTodayCheckins is a stable setState dispatch
    [activeChallenge, challenge, todayCheckins, fetchTodayCheckins, fetchActiveChallenge, fetchStats, queryClient, user?.id]
  );

  const secureDay = useCallback(async (): Promise<{
    newStreakCount: number;
    lastStandEarned?: boolean;
    challengeCompleted?: boolean;
    challengeId?: string;
    challengeName?: string;
    totalDays?: number;
  } | undefined> => {
    if (__DEV__) {
      console.log("[secureDay] called", {
        activeChallengeId: activeChallenge?.id,
        canSecureDay,
        todayCheckinsCount: todayCheckins.length,
      });
    }
    if (!activeChallenge?.id || !canSecureDay) return undefined;
    try {
      const result = (await trpcMutate(TRPC.checkins.secureDay, { activeChallengeId: activeChallenge.id })) as {
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
      if (result.challengeDay === 1 && securedChallengeId) {
        try {
          track({
            name: "day1_secured",
            challengeId: securedChallengeId,
            ttfv_seconds: undefined,
            starter_id: undefined,
            primary_goal: undefined,
            daily_time_budget: undefined,
          });
        } catch {
          /* non-fatal */
        }
      }
      const dayN = result.challengeDay;
      if (typeof dayN === "number" && MILESTONE_SHARE_DAYS.has(dayN)) {
        const prof = profile || fallbackProfile;
        const uname = String((prof as { username?: string } | null)?.username ?? "user").replace(/^@+/, "");
        const nested = (activeChallenge as { challenges?: { title?: string; duration_days?: number } } | null)?.challenges;
        useProofSharePromptStore.getState().show({
          userName: uname,
          challengeTitle: nested?.title ?? "Challenge",
          dayNumber: dayN,
          totalDays: nested?.duration_days ?? 75,
          streakCount: result.newStreakCount ?? 0,
        });
      }
      void fetchActiveChallenge();
      void fetchStats();
      const streakN = result?.newStreakCount;
      if (typeof streakN === "number" && [7, 14, 30, 75].includes(streakN)) {
        trackEvent("streak_milestone", { days: streakN });
      }
      if (Platform.OS !== "web") {
        const preferred = (stats as StatsFromApi)?.preferredSecureTime ?? "20:00";
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const currentLastStands = (stats as StatsFromApi)?.lastStandsAvailable ?? 0;
        const newLastStands = result?.lastStandEarned ? Math.min(2, currentLastStands + 1) : currentLastStands;
        const newStreakCount = result?.newStreakCount ?? (stats as StatsFromApi)?.activeStreak ?? 0;
        scheduleNextSecureReminder(preferred, tomorrow, newLastStands, newStreakCount).catch((err: unknown) => {
          captureError(err, "scheduleNextSecureReminder");
        });
        await cancelLapsedUserReminders();
        const challengeName = (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;
        await scheduleLapsedUserReminders({ streakCount: newStreakCount, challengeName });
        scheduleMilestoneApproachingIfNeeded(newStreakCount).catch((err: unknown) => {
          captureError(err, "scheduleMilestoneApproachingIfNeeded");
        });
        if (isStreakCelebrationMilestone(newStreakCount)) {
          fireStreakCelebration(newStreakCount).catch(() => {});
        }
      }
      return result;
    } catch (err) {
      captureError(err, "secureDay");
      throw err;
    }
  }, [activeChallenge, canSecureDay, fetchActiveChallenge, fetchStats, stats, profile, fallbackProfile, todayCheckins]);

  /**
   * verifyAndCompleteTask — calls checkins.verifyTask (the real server trust boundary).
   * Returns { verified: true, checkinId, streakAdvanced, newStreakCount } on success, or
   *         { verified: false, reason, reasonCode } on any gate failure.
   * On success, performs the same post-completion work as completeTask
   * (refetch, analytics, cache invalidation) and updates optimistic checkin state.
   */
  const verifyAndCompleteTask = useCallback(
    async (params: {
      activeChallengeId: string;
      taskId: string;
      photoUrl?: string;
      captureSource?: "camera" | "library" | "unknown";
      value?: number;
      noteText?: string;
      heart_rate_avg?: number;
      heart_rate_peak?: number;
      location_latitude?: number;
      location_longitude?: number;
      timer_seconds_on_screen?: number;
      clocked_in_at?: string;
      task_mode?: "full" | "minimum";
    }): Promise<
      | { verified: true; checkinId?: string; streakAdvanced: boolean; newStreakCount?: number }
      | { verified: false; reason: string; reasonCode: string }
    > => {
      const previousCheckins = todayCheckins.slice();
      const optimisticCheckin = {
        active_challenge_id: params.activeChallengeId,
        task_id: params.taskId,
        status: "completed" as const,
      };
      setTodayCheckins((prev) => [...prev, optimisticCheckin]);

      try {
        const result = (await trpcMutate(TRPC.checkins.verifyTask, params)) as
          | { verified: true; checkinId?: string; streakAdvanced: boolean; newStreakCount?: number }
          | { verified: false; reason: string; reasonCode: string };

        if (!result.verified) {
          setTodayCheckins(previousCheckins);
          return result;
        }

        // Post-success: refetch, analytics, cache invalidation (mirrors completeTask)
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

        const tasks = (challenge?.challenge_tasks as ChallengeTaskFromApi[] | undefined) ?? [];
        const taskType = tasks.find((t) => t.id === params.taskId)?.type ?? "unknown";
        const cid = (activeChallenge as ActiveChallengeFromApi | null)?.challenge_id;
        if (cid) {
          try {
            trackEvent("task_completed", { challenge_id: cid, task_type: String(taskType) });
            track({ name: "task_verified", challenge_id: cid, task_type: String(taskType), streak_advanced: result.streakAdvanced });
          } catch { /* non-fatal */ }
        }

        const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
        const daysSinceSignup = calculateDaysSinceSignup(profile ?? fallbackProfile);
        if (currentDay >= 7 && cid) {
          try { trackEvent("day_7_retained", { challenge_id: cid, day_number: currentDay }); } catch { /* non-fatal */ }
        }
        if (daysSinceSignup === 30 && cid) {
          try { trackDay30Completed({ challenge_id: cid, day_number: currentDay, days_since_signup: daysSinceSignup }); } catch { /* non-fatal */ }
        }
        if (currentDay === 1 && cid) {
          try {
            track({ name: "day1_task_completed", challengeId: cid, ttfv_seconds: undefined, starter_id: undefined, primary_goal: undefined, daily_time_budget: undefined });
          } catch { /* non-fatal */ }
        }
        try {
          const isFirstEver = !(await AsyncStorage.getItem("griit_has_completed_task"));
          if (isFirstEver) {
            try { track({ name: "first_task_completed", challengeId: cid ?? "" }); } catch { /* non-fatal */ }
            await AsyncStorage.setItem("griit_has_completed_task", "true");
          }
        } catch { /* non-fatal */ }

        return result;
      } catch (err: unknown) {
        setTodayCheckins(previousCheckins);
        const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn't save. Tap to retry.";
        captureError(err, "AppContextVerifyTask");
        throw new Error(msg);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChallenge, challenge, todayCheckins, fetchTodayCheckins, fetchActiveChallenge, fetchStats, queryClient, user?.id]
  );

  return { completeTask, secureDay, verifyAndCompleteTask };
}
