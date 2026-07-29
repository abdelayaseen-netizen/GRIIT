/**
 * Check-in · Ready — GatesCard with time window + Within {real radius} m.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import { DS_COLORS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import { GatesCard, type GatesCardGate } from "@/components/task/GatesCard";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import {
  buildCheckinReadyGates,
  CHECKIN_READY_HELPER,
} from "@/lib/checkin-ready-gates";

export type TaskCheckinReadyBodyProps = {
  config: TaskCompleteConfig;
  taskTitle: string;
  scheduleNow?: Date;
};

export function TaskCheckinReadyBody({
  config,
  taskTitle,
  scheduleNow,
}: TaskCheckinReadyBodyProps) {
  const gates: GatesCardGate[] = useMemo(() => {
    return buildCheckinReadyGates({
      schedule_window_start: config.schedule_window_start,
      schedule_window_end: config.schedule_window_end,
      location_radius_meters: config.location_radius_meters,
    }).map((g) => {
      const icon =
        g.key === "time" ? (
          <Clock size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : g.key === "location" ? (
          <MapPin size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : undefined;
      return { ...g, icon };
    });
  }, [
    config.schedule_window_start,
    config.schedule_window_end,
    config.location_radius_meters,
  ]);

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
      <Text style={styles.helper}>{CHECKIN_READY_HELPER}</Text>
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
