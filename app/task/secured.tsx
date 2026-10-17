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
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { getTodayDateKey } from "@/lib/date-utils";
import { dayOpenTasksFromActive } from "@/lib/day-open-active";
import { homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
import { bootstrapDayOpenInput, refreshHomeBootstrap } from "@/lib/home-bootstrap-refresh";
import {
  proofsFromComplete,
  readSecuredHandoff,
  selectSecuredDayMeta,
  type SecuredProof,
  type SecuredSelfRow,
} from "@/lib/secured-day";
import {
  finishedAtFromSecuredParam,
  readSecuredDateKeysFromCache,
  submitResultFromSecuredParams,
  todayIsSecuredInCache,
} from "@/lib/task-secured-nav";
import { afterSecuredNext } from "@/lib/moment-queue";
import { freezeEarnedNote } from "@/lib/freeze-earn";
import { useFirstConcept } from "@/lib/concept-seen";
import { clearOptimisticFeedPost, optimisticTaskPost, publishOptimisticFeedPost } from "@/lib/optimistic-feed";
import { showInviteAfterSecured } from "@/lib/invite-link";

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
    openPost?: string;
    choiceMade?: string;
    finishedAt?: string;
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
  const finishedAt = finishedAtFromSecuredParam(firstString(params.finishedAt));
  // 06.1: the first freeze ever earned says what it does, once.
  const firstFreeze = useFirstConcept("freeze", result.freezeGranted === true);
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
  // Build 90 04.1: the post-or-private choice was made before the save; do not ask again here.
  const choiceMade = firstString(params.choiceMade) === "1";
  const offerShare = !choiceMade && (held?.closingHasPhoto ?? closingPhoto) && proofs.length > 0;
  const [meta, setMeta] = useState<{
    taskCount: number;
    challengeCount: number;
    selfReported: SecuredSelfRow[];
    allSelfReported: boolean;
    ready: boolean;
    error: boolean;
    /** 08.1: the challenge id of the enrollment this screen is for (from the bootstrap). */
    challengeId: string | null;
  }>({
    taskCount: 0,
    challengeCount: 0,
    selfReported: [],
    allSelfReported: false,
    ready: false,
    error: false,
    challengeId: null,
  });
  const [retryTick, setRetryTick] = useState(0);
  const [shareFailed, setShareFailed] = useState(false);
  const [sharing, setSavingShare] = useState(false);
  const [sharedNow, setSharedNow] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["challenge", "listMyActive"] }, { cancelRefetch: false });
        await queryClient.invalidateQueries({ queryKey: ["discover", "myActive"] }, { cancelRefetch: false });
        // Build 90 04.7: one bootstrap refresh (joining the one the finish started) carries
        // listMyActive and today's check-ins; no second and third request for the same rows.
        // 01b.3: the finish awaits its refresh before replacing to this screen, so by now it
        // has usually landed. `finishedAt` lets this call skip when that payload is newer.
        await refreshHomeBootstrap(queryClient, finishedAt ? { freshAfter: finishedAt } : undefined);
        const { enrollments, completed } = bootstrapDayOpenInput<
          Parameters<typeof dayOpenTasksFromActive>[0]["enrollments"][number],
          Parameters<typeof dayOpenTasksFromActive>[0]["completed"][number]
        >(user?.id ? queryClient.getQueryData(homeBootstrapQueryKey(user.id)) : undefined);
        const tasks = dayOpenTasksFromActive({
          enrollments,
          completed,
          todayKey: getTodayDateKey(tz),
          timeZone: tz ?? "UTC",
        });
        if (!live) return;
        const next = selectSecuredDayMeta({ tasks, proofs });
        const own = (enrollments as { id?: string; challenge_id?: string }[]).find(
          (e) => e.id === result.activeChallengeId,
        );
        setMeta({
          taskCount: next.taskCount,
          challengeCount: next.challengeCount,
          selfReported: next.selfReported,
          allSelfReported: next.allSelfReported,
          ready: true,
          error: false,
          challengeId: typeof own?.challenge_id === "string" ? own.challenge_id : null,
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
          challengeId: null,
        });
      }
    })();
    return () => {
      live = false;
    };
  }, [proofs, queryClient, tz, retryTick, user?.id, result.activeChallengeId, finishedAt]);

  const done = () => {
    const openPost = firstString(params.openPost);
    if (openPost) {
      router.replace(ROUTES.POST_ID(openPost) as never);
      return;
    }
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
      freezeNote={freezeEarnedNote(result, firstFreeze === true)}
      invite={
        meta.challengeId &&
        showInviteAfterSecured({
          challengeDay: result.challengeDay,
          challengeLength: result.challengeLength,
          daySecured: result.daySecured,
          challengeDone: result.challengeDone,
        })
          ? { challengeId: meta.challengeId, challengeName: result.challengeName }
          : null
      }
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
            const post = optimisticTaskPost({
              eventId: shareEventId,
              userId,
              username: profile?.username ?? "",
              displayName: profile?.display_name ?? "You",
              avatarUrl: profile?.avatar_url ?? null,
              challengeName: result.challengeName,
              taskName: firstString(params.taskName) || result.challengeName,
              currentDay: result.challengeDay,
              totalDays: result.challengeLength,
              photoUrl: proofs[0]?.uri ?? proofUri ?? null,
            });
            if (post) publishOptimisticFeedPost(post);
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
