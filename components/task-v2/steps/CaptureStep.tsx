import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { TaskCapture } from "../TaskCapture";

type Props = {
  challengeName: string;
  taskName: string;
  currentDay: number;
  workDone?: string | null;
  photoAfter?: string | null;
  onCancel: () => void;
  onCaptured: (uri: string, at: string) => void;
};

export function CaptureStep({
  challengeName,
  taskName,
  currentDay,
  workDone,
  photoAfter,
  onCancel,
  onCaptured,
}: Props) {
  return (
    <View style={styles.root}>
      {workDone ? (
        <View style={styles.doneRow}>
          <Check size={DS_V3.space.gutter} color={DS_V3.color.brandText} />
          <View style={styles.doneCopy}>
            <Text style={styles.done}>{workDone}</Text>
            {photoAfter ? <Text style={styles.after}>{photoAfter}</Text> : null}
          </View>
        </View>
      ) : null}
      <TaskCapture
        challenge={challengeName}
        task={`${taskName}. Day ${currentDay}.`}
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
