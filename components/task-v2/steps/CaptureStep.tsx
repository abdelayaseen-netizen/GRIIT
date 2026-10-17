import React from "react";
import { StyleSheet, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { homeDayLine } from "@/lib/home-day-total";
import { TaskCapture } from "../TaskCapture";

type Props = {
  challengeName: string;
  taskName: string;
  currentDay: number;
  durationDays?: number;
  workDone?: string | null;
  photoAfter?: string | null;
  windowLabel?: string;
  onCancel: () => void;
  onCaptured: (uri: string, at: string) => void;
};

export function CaptureStep({
  challengeName,
  taskName,
  currentDay,
  durationDays,
  windowLabel,
  onCancel,
  onCaptured,
}: Props) {
  return (
    <View style={styles.root}>
      <TaskCapture
        challenge={challengeName}
        task={taskName}
        dayLine={homeDayLine(currentDay, durationDays)}
        windowLabel={windowLabel}
        onCancel={onCancel}
        onCaptured={onCaptured}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  doneRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  doneCopy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  done: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  after: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
