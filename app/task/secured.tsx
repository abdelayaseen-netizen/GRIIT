import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskConfirmation } from "@/components/task-v2/TaskConfirmation";
import { weekFromSecuredKeys } from "@/components/task-v2/MomentScreenV3";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { firstString } from "@/lib/task-helpers";
import { ROUTES } from "@/lib/routes";
import {
  readSecuredDateKeysFromCache,
  submitResultFromSecuredParams,
  todayIsSecuredInCache,
} from "@/lib/task-secured-nav";
import { shareProgressImage } from "@/lib/share";

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
  }>();
  const { user } = useAuth();
  const { profile } = useApp();
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
  const week = weekFromSecuredKeys(keys, tz);
  const fillToday = result.daySecured || todayIsSecuredInCache(queryClient, userId, tz);
  const proofUri = firstString(params.proofUri) || undefined;
  const taskName = firstString(params.taskName) || "Task";
  const done = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  };

  return (
    <TaskConfirmation
      result={result}
      taskName={taskName}
      verifyLine=""
      honest={result.verificationKind !== "self_report"}
      proofUri={proofUri}
      week={week.days}
      todayIndex={week.todayIndex}
      fillToday={fillToday}
      onDone={done}
      onNext={done}
      onShare={(uri) => {
        void shareProgressImage(uri, `${taskName}. Day ${result.challengeDay} on GRIIT.`);
      }}
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
