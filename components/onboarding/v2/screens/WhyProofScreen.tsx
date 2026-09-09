import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { formatTimeWindow, taskGates } from "@/lib/challenge-detail-mapping";
import type { TodayCardModel } from "@/lib/today-card";
import TodayCard from "@/components/home/TodayCard";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";

function sampleTodayModel(): TodayCardModel {
  const runGates = taskGates({
    require_photo: true,
    config: { schedule_window_start: "06:00", schedule_window_end: "09:00" },
  });
  const showerGates = taskGates({
    require_photo: true,
    require_location: true,
  });
  const window = formatTimeWindow("06:00", "09:00") ?? "";
  return {
    groups: [
      {
        challenge_name: "Sample",
        active_challenge_id: "onboarding-why-proof",
        tasks: [
          {
            id: "run",
            name: "Run 5km",
            gates: runGates.map((g) => g.kind),
            time_window: window,
            done: false,
          },
          {
            id: "read",
            name: "Read 10 pages",
            gates: [],
            done: true,
          },
          {
            id: "shower",
            name: "Cold shower",
            gates: showerGates.map((g) => g.kind),
            done: true,
          },
        ],
      },
    ],
    done: 2,
    total: 3,
    labelled: false,
    day_secured: false,
  };
}

export default function WhyProofScreen({
  onContinue,
  onSkip,
  onBack,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const model = useMemo(() => sampleTodayModel(), []);

  return (
    <OnboardingScreen
      step={1}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title="Streaks are easy to fake."
      subtitle="Everywhere else you tap a box. Here the server secures the day, and only when every task in every challenge you joined is done."
      footer={<ChromePrimary label="Continue" onPress={onContinue} />}
    >
      <View style={styles.streak}>
        <Text style={styles.secondary}>Current streak</Text>
        <View style={styles.streakRow}>
          <Text style={styles.zero}>0</Text>
          <Text style={styles.days}>days</Text>
        </View>
        <Text style={styles.secondary}>Post today to start.</Text>
      </View>
      <View style={styles.cardWrap}>
        <TodayCard model={model} />
      </View>
      <Text style={styles.caption}>
        {model.done} of {model.total}. The day is not secured, and nothing you tap changes that.
      </Text>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  streak: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.xs,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  zero: {
    fontSize: DS_V3.size.tap,
    lineHeight: DS_V3.space.section + DS_V3.space.lg,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  days: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  cardWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
  },
  caption: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
