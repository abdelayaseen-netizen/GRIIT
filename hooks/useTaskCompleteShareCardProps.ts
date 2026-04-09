import { useMemo } from "react";
import { deriveUserRank } from "@/lib/derive-user-rank";
import { formatCheckinTime } from "@/lib/task-helpers";
import type { ChallengeTaskFromApi, StatsFromApi, TodayCheckinForUser } from "@/types";

export interface UseTaskCompleteShareCardPropsInput {
  submitted: boolean;
  computeProgress: { totalRequired: number; verifiedCount: number };
  stats: unknown;
  headerCurrentDay: number;
  headerDurationDays: number;
  challenge: unknown;
  activeChallenge: unknown;
  todayCheckins: TodayCheckinForUser[];
  activeChallengeId: string;
  taskId: string;
  completionMeta: { taskId: string; details: string; timeLabel: string } | null;
  headerChallengeName: string;
  taskName: string;
  photoUri: string | null;
  photoUrl: string | null;
  isHardMode: boolean;
}

export function useTaskCompleteShareCardProps({
  submitted,
  computeProgress,
  stats,
  headerCurrentDay,
  headerDurationDays,
  challenge,
  activeChallenge,
  todayCheckins,
  activeChallengeId,
  taskId,
  completionMeta,
  headerChallengeName,
  taskName,
  photoUri,
  photoUrl,
  isHardMode,
}: UseTaskCompleteShareCardPropsInput) {
  const durationDaysShare = Math.max(
    1,
    (challenge as { duration_days?: number } | null)?.duration_days ?? headerDurationDays
  );
  const challengeDayShare = Math.max(
    1,
    (activeChallenge as { current_day?: number } | null)?.current_day ?? headerCurrentDay
  );

  const isAllDayComplete = useMemo(
    () =>
      submitted &&
      computeProgress.totalRequired > 0 &&
      computeProgress.verifiedCount >= computeProgress.totalRequired,
    [submitted, computeProgress.totalRequired, computeProgress.verifiedCount]
  );

  const isChallengeCompleteShare = useMemo(
    () => submitted && isAllDayComplete && challengeDayShare >= durationDaysShare,
    [submitted, isAllDayComplete, challengeDayShare, durationDaysShare]
  );

  const shareStreak = useMemo(() => {
    const fromStats = (stats as StatsFromApi | null)?.activeStreak ?? 0;
    const fromHeader = headerCurrentDay > 1 ? headerCurrentDay - 1 : 0;
    return Math.max(fromStats, fromHeader);
  }, [stats, headerCurrentDay]);

  const shareRank = useMemo(() => deriveUserRank(stats as StatsFromApi | null), [stats]);

  const recapTasksForShare = useMemo(() => {
    const ch = challenge as { challenge_tasks?: ChallengeTaskFromApi[] } | null | undefined;
    const required = ch?.challenge_tasks?.filter((t) => t.required) ?? [];
    return required.map((t) => {
      const checkin = todayCheckins.find(
        (c: TodayCheckinForUser) =>
          c.task_id === t.id && c.active_challenge_id === activeChallengeId && c.status === "completed"
      );
      const isJustDone = Boolean(completionMeta && t.id === taskId && completionMeta.taskId === taskId);
      const details = isJustDone
        ? (completionMeta?.details ?? "")
        : (checkin?.note_text?.trim() ?? "");
      const timestamp = isJustDone
        ? (completionMeta?.timeLabel ?? "")
        : checkin?.created_at
          ? formatCheckinTime(checkin.created_at)
          : "";
      const name = (t.title && String(t.title).trim()) || "Task";
      return { name, details, timestamp };
    });
  }, [challenge, todayCheckins, activeChallengeId, taskId, completionMeta]);

  const requiredTaskCount = useMemo(() => {
    const ch = challenge as { challenge_tasks?: ChallengeTaskFromApi[] } | null | undefined;
    const n = ch?.challenge_tasks?.filter((t) => t.required).length;
    return Math.max(1, n || 1);
  }, [challenge]);

  const totalTasksForComplete = durationDaysShare * requiredTaskCount;

  const proofPhotoUriForShare = photoUri || photoUrl || "";
  const hasPhotoForShare = Boolean(photoUri || photoUrl);

  const proofCheckin = useMemo(
    () =>
      todayCheckins.find(
        (c: TodayCheckinForUser) =>
          c.task_id === taskId &&
          c.active_challenge_id === activeChallengeId &&
          c.status === "completed"
      ),
    [todayCheckins, taskId, activeChallengeId]
  );

  const statementShareProps = useMemo(
    () => ({
      challengeName: headerChallengeName,
      dayNumber: headerCurrentDay,
      totalDays: headerDurationDays,
      streak: shareStreak,
      taskName,
      completionTime: completionMeta?.timeLabel,
      rank: shareRank,
    }),
    [headerChallengeName, headerCurrentDay, headerDurationDays, shareStreak, taskName, completionMeta?.timeLabel, shareRank]
  );

  const transparentShareProps = useMemo(
    () => ({
      challengeName: headerChallengeName,
      dayNumber: headerCurrentDay,
      totalDays: headerDurationDays,
      streak: shareStreak,
      taskName,
      completionTime: completionMeta?.timeLabel,
    }),
    [headerChallengeName, headerCurrentDay, headerDurationDays, shareStreak, taskName, completionMeta?.timeLabel]
  );

  const proofShareProps = useMemo(
    () => ({
      challengeName: headerChallengeName,
      dayNumber: headerCurrentDay,
      totalDays: headerDurationDays,
      streak: shareStreak,
      taskName,
      proofPhotoUri: proofPhotoUriForShare,
      completionTime: completionMeta?.timeLabel,
      isHardMode: isHardMode,
      isVerified: proofCheckin?.verification_status === "verified",
    }),
    [
      headerChallengeName,
      headerCurrentDay,
      headerDurationDays,
      shareStreak,
      taskName,
      proofPhotoUriForShare,
      completionMeta?.timeLabel,
      isHardMode,
      proofCheckin?.verification_status,
    ]
  );

  const recapShareProps = useMemo(
    () => ({
      challengeName: headerChallengeName,
      dayNumber: headerCurrentDay,
      streak: shareStreak,
      rank: shareRank,
      tasks: recapTasksForShare,
    }),
    [headerChallengeName, headerCurrentDay, shareStreak, shareRank, recapTasksForShare]
  );

  const completeShareProps = useMemo(
    () => ({
      challengeName: headerChallengeName,
      totalDays: durationDaysShare,
      totalTasks: totalTasksForComplete,
    }),
    [headerChallengeName, durationDaysShare, totalTasksForComplete]
  );

  const minimalShareProps = useMemo(
    () => ({
      streak: shareStreak,
      challengeName: headerChallengeName,
    }),
    [shareStreak, headerChallengeName]
  );

  return {
    isAllDayComplete,
    isChallengeCompleteShare,
    hasPhotoForShare,
    statementShareProps,
    transparentShareProps,
    proofShareProps,
    recapShareProps,
    completeShareProps,
    minimalShareProps,
  };
}
