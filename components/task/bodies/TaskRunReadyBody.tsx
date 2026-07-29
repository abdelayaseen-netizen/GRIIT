/**
 * Run · Ready body — GatesCard + helper for task-states-v2.
 * Mounted only for taskType === "run" while unarmed. Other types unchanged.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, Camera } from "lucide-react-native";
import { DS_COLORS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import { GatesCard, type GatesCardGate } from "@/components/task/GatesCard";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import {
  buildRunReadyGates,
  RUN_READY_HELPER,
} from "@/lib/run-ready-gates";

export type TaskRunReadyBodyProps = {
  config: TaskCompleteConfig;
  taskTitle: string;
  /** Shared schedule clock (same tick as Start CTA). */
  scheduleNow?: Date;
};

export function TaskRunReadyBody({
  config,
  taskTitle,
  scheduleNow,
}: TaskRunReadyBodyProps) {
  const gates: GatesCardGate[] = useMemo(() => {
    return buildRunReadyGates(config).map((g) => {
      const icon =
        g.key === "time" ? (
          <Clock size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : g.key === "camera" ? (
          <Camera size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : undefined;
      return { ...g, icon };
    });
  }, [config]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{taskTitle}</Text>
      <GatesCard
        scheduleWindowStart={config.schedule_window_start}
        scheduleWindowEnd={config.schedule_window_end}
        scheduleTimezone={config.schedule_timezone}
        gates={gates}
        now={scheduleNow}
      />
      <Text style={styles.helper}>{RUN_READY_HELPER}</Text>
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
