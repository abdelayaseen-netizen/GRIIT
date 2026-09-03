import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  circleLabel,
  proofTypeLabel,
  sortDayOneTasks,
  type DayOneTask,
} from "@/lib/onboarding-v2-dayone";
import { reminderTimeText } from "@/lib/onboarding-v2-reminders";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton } from "../ui";

export default function DayOneScreen({ onStart }: { onStart: () => void }) {
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const storedTitle = useOnboardingStore((s) => s.selectedChallengeTitle);
  const storedDuration = useOnboardingStore((s) => s.selectedChallengeDurationDays);
  const storedTaskCount = useOnboardingStore((s) => s.selectedChallengeTaskCount);
  const remindersEnabled = useOnboardingStore((s) => s.remindersEnabled);
  const reminderPreset = useOnboardingStore((s) => s.reminderPreset);
  const reminderCustom = useOnboardingStore((s) => s.reminderCustom);

  const [title, setTitle] = useState(storedTitle ?? "Your challenge");
  const [duration, setDuration] = useState<number | null>(storedDuration);
  const [tasks, setTasks] = useState<DayOneTask[]>([]);

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pop, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const catalog = Array.isArray(data) ? data : [];
        const found = catalog.find(
          (c: { id?: string }) => typeof c.id === "string" && c.id === selectedChallengeId
        ) as
          | {
              title?: string;
              duration_days?: number | null;
              tasks?: DayOneTask[];
            }
          | undefined;
        if (cancelled || !found) return;
        if (found.title) setTitle(found.title);
        if (found.duration_days != null) setDuration(found.duration_days);
        if (Array.isArray(found.tasks)) setTasks(sortDayOneTasks(found.tasks));
      } catch {
        /* keep stored snapshot */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedChallengeId]);

  const reminderValue = remindersEnabled
    ? reminderTimeText(reminderPreset ?? "am6", reminderCustom ?? null)
    : "Off";
  const shownTasks = tasks.length > 0 ? tasks : [];
  const scale = pop.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.94, 1.02, 1],
  });

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>You&apos;re in.</Text>
        <Text style={styles.sub}>Tomorrow is Day 1. Here is exactly what it looks like.</Text>
      </View>

      <View style={styles.body}>
        <Animated.View style={[styles.card, { opacity: pop, transform: [{ scale }] }]}>
          <Text style={styles.dayLabel}>
            DAY 1{duration != null ? ` OF ${duration}` : ""}
          </Text>
          <Text style={styles.cardTitle}>{title}</Text>
          {shownTasks.length > 0 ? (
            <View style={styles.taskList}>
              {shownTasks.map((t, i) => (
                <View key={t.id ?? `${t.title}-${i}`} style={styles.taskRow}>
                  <View style={styles.box} />
                  <Text style={styles.taskName}>{t.title ?? "Task"}</Text>
                  <Text style={styles.proof}>{proofTypeLabel(t)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.taskFallback}>
              {storedTaskCount > 0
                ? `${storedTaskCount} tasks ready tomorrow.`
                : "Your first day starts tomorrow."}
            </Text>
          )}
        </Animated.View>

        <View style={styles.tiles}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>REMINDER</Text>
            <Text style={styles.tileValue}>{reminderValue}</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>CIRCLE</Text>
            <Text style={styles.tileValue}>{circleLabel(0)}</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>STARTS</Text>
            <Text style={styles.tileValue}>Tomorrow</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start Day 1" onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flex: 1, justifyContent: "center", paddingVertical: 16, gap: 10 },
  card: {
    backgroundColor: OBV2_COLOR.photoDark,
    borderRadius: 24,
    padding: 20,
  },
  dayLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 1.4, color: OBV2_COLOR.orange },
  cardTitle: {
    fontSize: 27,
    fontWeight: "500",
    letterSpacing: -0.8,
    color: OBV2_COLOR.onPhoto,
    marginTop: 7,
  },
  taskList: { marginTop: 16, gap: 9 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: OBV2_COLOR.ink3,
  },
  taskName: { flex: 1, fontSize: 14, fontWeight: "500", color: OBV2_COLOR.sunken },
  proof: { fontSize: 10, fontWeight: "500", letterSpacing: 0.6, color: OBV2_COLOR.mutedWarm },
  taskFallback: { marginTop: 16, fontSize: 14, fontWeight: "400", color: OBV2_COLOR.ink3 },
  tiles: { flexDirection: "row", gap: 9 },
  tile: {
    flex: 1,
    backgroundColor: OBV2_COLOR.card,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 3,
  },
  tileLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 0.7, color: OBV2_COLOR.mutedWarm },
  tileValue: { fontSize: 15, fontWeight: "500", color: OBV2_COLOR.ink },
  footer: { paddingTop: 14, paddingBottom: 32 },
});
