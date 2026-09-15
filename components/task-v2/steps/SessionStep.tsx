import React from "react";
import { Pressable, Text, View } from "react-native";
import { fmtMmSs } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  taskType: string;
  sessionUp: number;
  onStop: () => void;
  onCancel: () => void;
};

export function SessionStep({ taskType, sessionUp, onStop, onCancel }: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.statLabel}>SESSION TIMER</Text>
      <Text style={styles.huge}>{fmtMmSs(sessionUp)}</Text>
      <Text style={styles.disclosure}>
        Counting up. Stopping fills the duration field for you — the photo is still what gets verified.
      </Text>
      <Pressable
        onPress={onStop}
        accessibilityRole="button"
        accessibilityLabel={taskType === "run" ? "Stop and use duration" : "Stop and use minutes"}
        style={styles.inkBtn}
      >
        <Text style={styles.inkBtnText}>
          {taskType === "run"
            ? `Stop and use ${fmtMmSs(sessionUp)}`
            : `Stop and use ${Math.max(1, Math.round(sessionUp / 60))} min`}
        </Text>
      </Pressable>
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel, I'll type it"
        style={styles.textBtn}
      >
        <Text style={styles.shareText}>Cancel, I&apos;ll type it</Text>
      </Pressable>
    </View>
  );
}
