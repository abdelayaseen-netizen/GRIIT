/**
 * Counter/Water/Reading · Ready — GatesCard, no time-window treatment.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, Target } from "lucide-react-native";
import { DS_COLORS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import { GatesCard, type GatesCardGate } from "@/components/task/GatesCard";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import {
  buildCounterReadyGates,
  counterReadyHelper,
} from "@/lib/counter-ready-gates";

export type TaskCounterReadyBodyProps = {
  config: TaskCompleteConfig;
  taskTitle: string;
  target: number;
  variant: "counter" | "water" | "reading";
};

export function TaskCounterReadyBody({
  config,
  taskTitle,
  target,
  variant,
}: TaskCounterReadyBodyProps) {
  const gates: GatesCardGate[] = useMemo(() => {
    return buildCounterReadyGates({ target, variant }).map((g) => {
      const icon =
        g.key === "all_day" ? (
          <Calendar size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : g.key === "target" ? (
          <Target size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : undefined;
      return { ...g, icon };
    });
  }, [target, variant]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{taskTitle}</Text>
      <GatesCard
        // Intentionally omit schedule window — counter is all-day; no In/Out chip.
        scheduleWindowStart={undefined}
        scheduleWindowEnd={undefined}
        scheduleTimezone={config.schedule_timezone}
        gates={gates}
      />
      <Text style={styles.helper}>{counterReadyHelper(variant)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  helper: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 20,
  },
});
