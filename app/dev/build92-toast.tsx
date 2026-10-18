/**
 * Build 92 chunk 01 dev route: shows the Part 0 toast over Home (P0-09, P0-12) for
 * simulator screenshots. griit://dev/build92-toast
 */
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import Screen from "@/components/ds/Screen";
import { ROUTES } from "@/lib/routes";
import { publishTaskToast } from "@/lib/task-complete-toast";

export default function Build92ToastDev() {
  const router = useRouter();
  useEffect(() => {
    publishTaskToast({
      taskId: "dev-run",
      title: "Morning run done. 2 left today.",
      body: "",
      photoUri: null,
      cameraSeal: false,
      challengeName: "Run every day",
      taskName: "Morning run",
      currentDay: 3,
      totalDays: 30,
      lifeMs: 60_000,
    });
    router.replace(ROUTES.TABS_HOME as never);
  }, [router]);
  return <Screen edges={[]} />;
}
