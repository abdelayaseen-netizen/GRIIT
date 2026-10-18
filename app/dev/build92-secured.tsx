/**
 * Build 92 chunk 02 dev route: opens Day secured with sample numbers so Maestro can prove
 * Done, Back and swipe-down all go Home, and for the P1-06 / P1-08 frames.
 * griit://dev/build92-secured?streak=3&camera=0
 */
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "@/components/ds/Screen";
import { ROUTES } from "@/lib/routes";
import { firstString } from "@/lib/task-helpers";

export default function Build92SecuredDev() {
  const router = useRouter();
  const params = useLocalSearchParams<{ streak?: string; camera?: string }>();
  useEffect(() => {
    const streak = firstString(params.streak) || "3";
    router.replace({
      pathname: ROUTES.TASK_SECURED,
      params: {
        daySecured: "1",
        daySecuredEarlier: "0",
        requiredRemaining: "0",
        streakDays: streak,
        streakDaysBefore: String(Math.max(0, parseInt(streak, 10) - 1)),
        challengeDay: "3",
        challengeLength: "30",
        challengeName: "Run every day",
        verificationKind: firstString(params.camera) === "1" ? "live_photo" : "self_report",
        taskName: "Morning run",
        closingPhoto: firstString(params.camera) === "1" ? "1" : "0",
        choiceMade: "1",
        originTab: "home",
      },
    } as never);
  }, [params.camera, params.streak, router]);
  return <Screen edges={[]} />;
}
