/**
 * Dev harness: a timer that reaches 00:00, then Post returns Home with the toast.
 * Route: griit://dev/build81-timer
 */
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import Screen from "@/components/ds/Screen";
import { RunningStep } from "@/components/task-v2/steps/RunningStep";
import { publishTaskToast } from "@/lib/task-complete-toast";
import { ROUTES } from "@/lib/routes";

export default function Build81TimerHarness() {
  const router = useRouter();
  const [left, setLeft] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setLeft((n) => (n <= 0 ? 0 : n - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
      <RunningStep
        remainingSec={left}
        taskName="5-minute prayer or intention"
        headerTitle="Day 6 of 7"
        headerLabel="5-minute prayer"
        startedAtIso={new Date(Date.now() - 2000).toISOString()}
        requiredSeconds={2}
        onPause={() => undefined}
        onReset={() => setLeft(2)}
        submitting={saving}
        error={error}
        onPost={() => {
          if (left > 0 || saving) return;
          setSaving(true);
          setError(null);
          publishTaskToast({
            taskId: "prayer",
            title: "Saved.",
            body: "5-minute prayer or intention",
            photoUri: null,
            cameraSeal: false,
            challengeName: "5-Minute Morning Prayer",
            taskName: "5-minute prayer or intention",
            currentDay: 6,
            totalDays: 7,
          });
          router.replace(ROUTES.TABS_HOME as never);
        }}
        onBack={() => router.back()}
      />
      </Screen>
    </>
  );
}
