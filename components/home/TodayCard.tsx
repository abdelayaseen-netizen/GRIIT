/**
 * TodayCard — brief 16 Home, today's proof card.
 * Rows are the CTA. Gate labels come from todayCardGateLabel, not from this file.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import {
  todayCardGateLabel,
  type TodayCardModel,
  type TodayCardTask,
} from "@/lib/today-card";

const DOT = DS_V3.space.gutter;
const PT_HAIR = (DS_V3.space.xs * 3) / 8;
const BADGE_Y = DS_V3.space.xs + DS_V3.space.xs / 2;

export type TodayCardProps = {
  model: TodayCardModel | null;
  loading?: boolean;
  onTask?: (activeChallengeId: string, taskId: string) => void;
};

function TaskRow({
  task,
  onPress,
}: {
  task: TodayCardTask;
  onPress?: () => void;
}) {
  const inner = (
    <>
      <View style={[styles.dot, task.done ? styles.dotFilled : styles.dotOutline]} />
      <View style={styles.taskCopy}>
        <Text style={[styles.name, task.done ? styles.nameDone : null]}>{task.name}</Text>
        <Text style={styles.gate}>{todayCardGateLabel(task)}</Text>
      </View>
      {task.done ? null : (
        <ChevronRight size={DOT} color={DS_V3.color.textSecondary} />
      )}
    </>
  );
  if (task.done || !onPress) {
    return <View style={styles.row}>{inner}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.name}
      onPress={onPress}
      style={styles.row}
    >
      {inner}
    </Pressable>
  );
}

function LoadingCard() {
  return (
    <Card>
      <View style={styles.stack}>
        <View style={styles.header}>
          <Text style={styles.heading}>Today</Text>
          <View style={styles.skelBadge} />
        </View>
        <View style={styles.skelRow} />
        <View style={styles.skelRow} />
        <View style={styles.skelRow} />
      </View>
    </Card>
  );
}

export default function TodayCard({ model, loading, onTask }: TodayCardProps) {
  if (loading) return <LoadingCard />;
  if (!model || model.groups.length === 0) return null;

  return (
    <Card>
      <View style={styles.stack}>
        <View style={styles.header}>
          <Text style={styles.heading}>Today</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>
              {model.done} / {model.total}
            </Text>
          </View>
        </View>

        {model.groups.map((group) => (
          <View key={group.active_challenge_id} style={styles.group}>
            {model.labelled ? (
              <Text style={styles.groupLabel}>{group.challenge_name}</Text>
            ) : null}
            {group.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onPress={
                  task.done
                    ? undefined
                    : () => onTask?.(group.active_challenge_id, task.id)
                }
              />
            ))}
          </View>
        ))}

        {model.day_secured ? <Text style={styles.secured}>Day secured.</Text> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: DS_V3.space.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  badge: {
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.input,
    paddingVertical: BADGE_Y,
    paddingHorizontal: DS_V3.space.md,
  },
  badgeTxt: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  group: {
    gap: DS_V3.space.xs,
  },
  groupLabel: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DS_V3.radius.pill,
  },
  dotFilled: {
    backgroundColor: DS_V3.color.brand,
  },
  dotOutline: {
    borderWidth: PT_HAIR,
    borderColor: DS_V3.color.textSecondary,
  },
  taskCopy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  name: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  nameDone: {
    color: DS_V3.color.textSecondary,
  },
  gate: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  secured: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  skelBadge: {
    width: DS_V3.space.section,
    height: DS_V3.space.lg,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  skelRow: {
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
});
