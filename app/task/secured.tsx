import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import SecuredDayScreen, { type SecuredTaskRow } from "@/components/task-v2/SecuredDayScreen";
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
import { proofsFromComplete, readSecuredHandoff, type SecuredProof } from "@/lib/secured-day";
// Build 92 02.3: Share opens the sticker carousel (chunk 05; the share sheet until then),
// the teaching line shows once per user, and the task rows carry their verification label.
import { SECURED_TEACHING_KEY, markTeachingSeen, teachingShows, verifyLabel } from "@/lib/finish-flow";
import { openStickerCarousel } from "@/lib/sticker-carousel";
import {
  finishedAtFromSecuredParam,
  readSecuredDateKeysFromCache,
  submitResultFromSecuredParams,
  todayIsSecuredInCache,
} from "@/lib/task-secured-nav";
import { afterSecuredNext } from "@/lib/moment-queue";
import { freezeEarnedNote } from "@/lib/freeze-earn";
import { useFirstConcept } from "@/lib/concept-seen";

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
  const taskName = firstString(params.taskName) || result.challengeName;
  const [meta, setMeta] = useState<{ tasks: SecuredTaskRow[]; ready: boolean; error: boolean }>({
    tasks: [],
    ready: false,
    error: false,
  });
  const [retryTick, setRetryTick] = useState(0);
  // The teaching line: once per user (AsyncStorage, keyed by user id).
  const [firstTime, setFirstTime] = useState(false);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    void AsyncStorage.getItem(SECURED_TEACHING_KEY)
      .then((raw) => {
        if (!live) return;
        if (!teachingShows(raw, userId)) return;
        setFirstTime(true);
        return AsyncStorage.setItem(SECURED_TEACHING_KEY, markTeachingSeen(raw, userId));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [userId]);

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
        type Checkin = Parameters<typeof dayOpenTasksFromActive>[0]["completed"][number] & {
          proof_url?: string | null;
          completion_image_url?: string | null;
          proof_source?: string | null;
        };
        const { enrollments, completed } = bootstrapDayOpenInput<
          Parameters<typeof dayOpenTasksFromActive>[0]["enrollments"][number],
          Checkin
        >(user?.id ? queryClient.getQueryData(homeBootstrapQueryKey(user.id)) : undefined);
        const tasks = dayOpenTasksFromActive({
          enrollments,
          completed,
          todayKey: getTodayDateKey(tz),
          timeZone: tz ?? "UTC",
        });
        if (!live) return;
        const seen = new Set<string>();
        const rows: SecuredTaskRow[] = tasks
          .filter((t) => t.done)
          .filter((t) => {
            const key = t.id ?? `${t.challengeName}:${t.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((t) => {
            const checkin = completed.find((c) => c.task_id === t.id);
            const hasCameraProof = Boolean(checkin?.proof_url || checkin?.completion_image_url);
            const isThisTask = t.name === taskName && t.challengeName === result.challengeName;
            return {
              id: t.id ?? `${t.challengeName}:${t.name}`,
              title: t.name,
              label: verifyLabel({
                hasCameraProof: hasCameraProof || (isThisTask && closingPhoto),
                verifiedBy: checkin?.proof_source === "strava" ? "strava" : null,
              }),
              photoUri: isThisTask && proofUri ? proofUri : null,
            };
          });
        setMeta({ tasks: rows, ready: true, error: false });
      } catch {
        if (!live) return;
        setMeta({ tasks: [], ready: false, error: true });
      }
    })();
    return () => {
      live = false;
    };
  }, [queryClient, tz, retryTick, user?.id, result.challengeName, finishedAt, taskName, closingPhoto, proofUri]);

  // Build 92 02.2/02.3: Done, Back and swipe-down go Home. The Proof screen never opens from here.
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
      freezeNote={freezeEarnedNote(result, firstFreeze === true)}
      tasks={meta.ready ? meta.tasks : []}
      firstTime={firstTime}
      loadError={meta.error}
      onRetryLoad={() => {
        setMeta((prev) => ({ ...prev, error: false, ready: false }));
        setRetryTick((n) => n + 1);
      }}
      week={week.days}
      todayIndex={week.todayIndex}
      fillToday={fillToday}
      onShare={() =>
        openStickerCarousel({
          taskId: "",
          title: taskName,
          body: "",
          photoUri: proofs[0]?.uri ?? proofUri ?? null,
          cameraSeal: closingPhoto,
          eventId: shareEventId,
          challengeName: result.challengeName,
          taskName,
          currentDay: result.challengeDay,
          totalDays: result.challengeLength,
          streak: result.streakDays,
        })
      }
      onDone={done}
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
