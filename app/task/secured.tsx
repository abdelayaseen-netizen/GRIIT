import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SecuredDayScreen from "@/components/task-v2/SecuredDayScreen";
import { weekFromSecuredKeys } from "@/components/task-v2/MomentScreenV3";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { firstString } from "@/lib/task-helpers";
import { ROUTES } from "@/lib/routes";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
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
  }>(() =>
    selectSecuredDayMeta({
      tasks: [],
      proofs,
    }),
  );
  const [shareFailed, setShareFailed] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
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
        });
        if (!live) return;
        const next = selectSecuredDayMeta({ tasks, proofs });
        setMeta({
          taskCount: next.taskCount || Math.max(1, proofs.length),
          challengeCount: next.challengeCount || Math.max(1, new Set(proofs.map((p) => p.challengeName)).size),
          selfReported:
            next.selfReported.length > 0
              ? next.selfReported
              : proofs.length === 0
                ? [
                    {
                      name: result.challengeName,
                      day: result.challengeDay,
                      length: result.challengeLength,
                    },
                  ]
                : [],
        });
      } catch {
        if (!live) return;
        setMeta({
          taskCount: Math.max(1, proofs.length),
          challengeCount: Math.max(1, new Set(proofs.map((p) => p.challengeName)).size || 1),
          selfReported:
            proofs.length === 0
              ? [{ name: result.challengeName, day: result.challengeDay, length: result.challengeLength }]
              : [],
        });
      }
    })();
    return () => {
      live = false;
    };
  }, [proofs, result.challengeDay, result.challengeLength, result.challengeName]);

  const done = () => {
    router.replace(ROUTES.HOME as never);
  };

  return (
    <SecuredDayScreen
      streak={result.streakDays}
      proofs={proofs}
      selfReported={meta.selfReported}
      taskCount={meta.taskCount}
      challengeCount={meta.challengeCount}
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
        setSharing(true);
        void trpcMutate(TRPC.checkins.shareProof, { eventId: shareEventId })
          .then(() => {
            setSharing(false);
            done();
          })
          .catch(() => {
            setSharing(false);
            setShareFailed(true);
          });
      }}
      onKeep={done}
      onDone={done}
    />
  );
}

export default function TaskSecuredScreen() {
  return (
    <ErrorBoundary>
      <TaskSecuredInner />
    </ErrorBoundary>
  );
}
