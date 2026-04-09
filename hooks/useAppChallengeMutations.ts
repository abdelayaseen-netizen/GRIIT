import { useCallback, type Dispatch, type SetStateAction } from "react";
import { Platform } from "react-native";
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
import { trackEvent } from "@/lib/analytics";
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
    }): Promise<{ firstTaskOfDay?: boolean; completionId?: string } | void> => {
      const requiredTasks =
        (challenge?.challenge_tasks as { id: string; required?: boolean }[] | undefined)?.filter((t) => t.required) || [];
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
          const taskType = tasks.find((t) => t.id === params.taskId)?.type ?? "unknown";
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
          const msg =
            err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn't save. Tap to retry.";
          captureError(err, "AppContextCompleteTask");
          throw new Error(msg);
        });
    },
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

  return { completeTask, secureDay };
}
