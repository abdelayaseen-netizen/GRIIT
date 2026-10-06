import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import SecuredDayScreen from "@/components/task-v2/SecuredDayScreen";
import { weekFromSecuredKeys } from "@/components/task-v2/MomentScreenV3";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { firstString } from "@/lib/task-helpers";
import { originTabFromParam, originTabHref } from "@/lib/origin-tab";
import { ROUTES } from "@/lib/routes";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { getTodayDateKey } from "@/lib/date-utils";
import { dayOpenTasksFromActive } from "@/lib/day-open-active";
import {
  proofsFromComplete,
  readSecuredHandoff,
  selectSecuredDayMeta,
  type SecuredProof,
  type SecuredSelfRow,
} from "@/lib/secured-day";
import {
  readSecuredDateKeysFromCache,
  submitResultFromSecuredParams,
  todayIsSecuredInCache,
} from "@/lib/task-secured-nav";
import { afterSecuredNext } from "@/lib/moment-queue";
import { freezeEarnedNote } from "@/lib/freeze-earn";
import { clearOptimisticFeedPost, publishOptimisticFeedPost } from "@/lib/optimistic-feed";
import type { LiveFeedPost } from "@/components/feed/feedTypes";

function TaskSecuredInner() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    daySecured?: string;
    daySecuredEarlier?: string;
    requiredRemaining?: string;
    streakDays?: string;
    streakDaysBefore?: string;
    challengeDay?: string;
    challengeLength?: string;
    challengeName?: string;
    verificationKind?: string;
    proofUri?: string;
    taskName?: string;
    shareEventId?: string;
    closingPhoto?: string;
    challengeDone?: string;
    activeChallengeId?: string;
    originTab?: string;
    counterTarget?: string;
    freezeGranted?: string;
    freezesHeld?: string;
    freezeCap?: string;
    freezeAtCap?: string;
  }>();
  const { user } = useAuth();
  const { profile, stats } = useApp();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";
  const tz = profile?.timezone ?? undefined;
  const result = submitResultFromSecuredParams({
    daySecured: firstString(params.daySecured),
    daySecuredEarlier: firstString(params.daySecuredEarlier),
    requiredRemaining: firstString(params.requiredRemaining),
    streakDays: firstString(params.streakDays),
    streakDaysBefore: firstString(params.streakDaysBefore),
    challengeDay: firstString(params.challengeDay),
    challengeLength: firstString(params.challengeLength),
    challengeName: firstString(params.challengeName),
    verificationKind: firstString(params.verificationKind),
    challengeDone: firstString(params.challengeDone),
    activeChallengeId: firstString(params.activeChallengeId),
    freezeGranted: firstString(params.freezeGranted),
    freezesHeld: firstString(params.freezesHeld),
    freezeCap: firstString(params.freezeCap),
    freezeAtCap: firstString(params.freezeAtCap),
  });
  const keys = readSecuredDateKeysFromCache(queryClient, userId);
  const fillToday = result.daySecured || todayIsSecuredInCache(queryClient, userId, tz);
  const statsRow = stats as { frozenDateKeys?: string[]; lastStandDateKeys?: string[] } | null;
  const week = weekFromSecuredKeys(keys, tz, {
    frozenDateKeys: statsRow?.frozenDateKeys ?? [],
    lastStandDateKeys: statsRow?.lastStandDateKeys ?? [],
    todaySecured: fillToday,
  });
  const proofUri = firstString(params.proofUri) || undefined;
  const paramEventId = firstString(params.shareEventId) || null;
  const closingPhoto = firstString(params.closingPhoto) === "1" || Boolean(proofUri);
  const held = readSecuredHandoff();
  const [proofs] = useState<SecuredProof[]>(
    () =>
      held?.proofs ??
      proofsFromComplete({
        photoUri: proofUri,
        challengeName: result.challengeName,
        challengeDay: result.challengeDay,
        challengeLength: result.challengeLength,
        eventId: paramEventId,
      }),
  );
  const shareEventId = held?.shareEventId ?? paramEventId;
  const offerShare = (held?.closingHasPhoto ?? closingPhoto) && proofs.length > 0;
  const [meta, setMeta] = useState<{
    taskCount: number;
    challengeCount: number;
    selfReported: SecuredSelfRow[];
    allSelfReported: boolean;
    ready: boolean;
    error: boolean;
  }>({
    taskCount: 0,
    challengeCount: 0,
    selfReported: [],
    allSelfReported: false,
    ready: false,
    error: false,
  });
  const [retryTick, setRetryTick] = useState(0);
  const [shareFailed, setShareFailed] = useState(false);
  const [sharing, setSavingShare] = useState(false);
  const [sharedNow, setSharedNow] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["challenge", "listMyActive"] });
        await queryClient.invalidateQueries({ queryKey: ["discover", "myActive"] });
        await queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
        const [activeList, checkins] = await Promise.all([
          trpcQuery(TRPC.challenges.listMyActive) as Promise<
            Parameters<typeof dayOpenTasksFromActive>[0]["enrollments"]
          >,
          trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<
            Parameters<typeof dayOpenTasksFromActive>[0]["completed"]
          >,
        ]);
        const tasks = dayOpenTasksFromActive({
          enrollments: Array.isArray(activeList) ? activeList : [],
          completed: Array.isArray(checkins) ? checkins : [],
          todayKey: getTodayDateKey(tz),
          timeZone: tz ?? "UTC",
        });
        if (!live) return;
        const next = selectSecuredDayMeta({ tasks, proofs });
        setMeta({
          taskCount: next.taskCount,
          challengeCount: next.challengeCount,
          selfReported: next.selfReported,
          allSelfReported: next.allSelfReported,
          ready: true,
          error: false,
        });
      } catch {
        if (!live) return;
        setMeta({
          taskCount: 0,
          challengeCount: 0,
          selfReported: [],
          allSelfReported: false,
          ready: false,
          error: true,
        });
      }
    })();
    return () => {
      live = false;
    };
  }, [proofs, queryClient, tz, retryTick]);

  const done = () => {
    const next = afterSecuredNext({
      challengeDone: result.challengeDone,
      challengeDay: result.challengeDay,
      challengeLength: result.challengeLength,
      counterReachedTarget: firstString(params.counterTarget) === "1",
    });
    if (next === "challenge_complete") {
      const enrollmentId = result.activeChallengeId;
      if (enrollmentId) {
        void trpcMutate(TRPC.challenges.markEndSeen, { enrollmentIds: [enrollmentId] }).catch(() => {});
      }
      router.replace({
        pathname: ROUTES.CHALLENGE_COMPLETE,
        params: {
          challengeName: result.challengeName,
          totalDays: String(result.challengeLength),
          enrollmentId: enrollmentId ?? "",
        },
      } as never);
      return;
    }
    router.replace(originTabHref(originTabFromParam(firstString(params.originTab))) as never);
  };

  return (
    <SecuredDayScreen
      streak={result.streakDays}
      freezeNote={freezeEarnedNote(result)}
      proofs={proofs}
      selfReported={meta.selfReported}
      taskCount={meta.ready ? meta.taskCount : undefined}
      challengeCount={meta.ready ? meta.challengeCount : 0}
      allSelfReported={meta.ready ? meta.allSelfReported : false}
      loadError={meta.error}
      onRetryLoad={() => {
        setMeta((prev) => ({ ...prev, error: false, ready: false }));
        setRetryTick((n) => n + 1);
      }}
      week={week.days}
      todayIndex={week.todayIndex}
      fillToday={fillToday}
      offerShare={offerShare}
      shareFailed={shareFailed}
      sharing={sharing}
      onShare={() => {
        if (sharing) return;
        if (!shareEventId) {
          setShareFailed(true);
          return;
        }
        setSavingShare(true);
        void trpcMutate(TRPC.checkins.shareProof, { eventId: shareEventId })
          .then(() => {
            setSavingShare(false);
            setSharedNow(true);
            const post: LiveFeedPost = {
              id: shareEventId,
              userId,
              username: profile?.username ?? "",
              displayName: profile?.display_name ?? "You",
              avatarUrl: profile?.avatar_url ?? null,
              streakCount: result.streakDays,
              challengeId: result.activeChallengeId ?? null,
              challengeName: result.challengeName,
              taskName: firstString(params.taskName) || result.challengeName,
              currentDay: result.challengeDay,
              totalDays: result.challengeLength,
              eventType: "task_completed",
              isCompleted: true,
              hasProof: true,
              photoUrl: proofs[0]?.uri ?? proofUri ?? null,
              proofPhotoUrl: proofs[0]?.uri ?? proofUri ?? null,
              verified: false,
              caption: null,
              createdAt: new Date().toISOString(),
              respectCount: 0,
              reactedByMe: false,
              commentCount: 0,
              visibility: "public",
            };
            publishOptimisticFeedPost(post);
          })
          .catch(() => {
            setSavingShare(false);
            setShareFailed(true);
          });
      }}
      onKeep={done}
      onUndo={() => {
        if (!shareEventId) return;
        clearOptimisticFeedPost(shareEventId);
        setSharedNow(false);
        void trpcMutate(TRPC.checkins.unshareProof, { eventId: shareEventId }).catch(() => {});
      }}
      sharedNow={sharedNow}
      onDone={done}
      username={profile?.username}
    />
  );
}

export default function TaskSecuredScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <TaskSecuredInner />
      </ErrorBoundary>
    </Screen>
  );
}
