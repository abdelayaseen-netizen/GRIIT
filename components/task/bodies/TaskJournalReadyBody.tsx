/**
 * Journal · Ready body — GatesCard + helper for task-states-v2.
 * Mounted only for taskType === "journal" while unarmed. No camera.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, Pencil } from "lucide-react-native";
import { DS_COLORS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import { GatesCard, type GatesCardGate } from "@/components/task/GatesCard";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import {
  buildJournalReadyGates,
  JOURNAL_READY_HELPER,
} from "@/lib/journal-ready-gates";

export type TaskJournalReadyBodyProps = {
  config: TaskCompleteConfig;
  taskTitle: string;
  /** Real word floor from task config (0 / absent → omit word-floor gate). */
  minWords?: number;
  scheduleNow?: Date;
};

export function TaskJournalReadyBody({
  config,
  taskTitle,
  minWords = 0,
  scheduleNow,
}: TaskJournalReadyBodyProps) {
  const gates: GatesCardGate[] = useMemo(() => {
    return buildJournalReadyGates({
      schedule_window_start: config.schedule_window_start,
      schedule_window_end: config.schedule_window_end,
      min_words: minWords,
    }).map((g) => {
      const icon =
        g.key === "time" ? (
          <Clock size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : g.key === "word_floor" ? (
          <Pencil size={14} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : undefined;
      return { ...g, icon };
    });
  }, [config.schedule_window_start, config.schedule_window_end, minWords]);

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
      <Text style={styles.helper}>{JOURNAL_READY_HELPER}</Text>
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
