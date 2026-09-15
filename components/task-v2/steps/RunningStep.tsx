import React from "react";
import { Pressable, Text, View } from "react-native";
import { clockLabel, fmtMmSs } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  remainingSec: number;
  taskName: string;
  startedAtIso: string | null;
  requiredSeconds: number;
  onCancel: () => void;
};

export function RunningStep({ remainingSec, taskName, startedAtIso, requiredSeconds, onCancel }: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.huge}>{fmtMmSs(remainingSec)}</Text>
      <Text style={styles.switchSub}>{taskName}</Text>
      <Text style={styles.pill}>
        Started {startedAtIso ? clockLabel(startedAtIso) : ""} · ends{" "}
        {startedAtIso ? clockLabel(Date.parse(startedAtIso) + requiredSeconds * 1000) : ""}
      </Text>
      <Text style={styles.disclosure}>
        Runs on the clock. Lock your phone, put it down — we&apos;ll tell you when it&apos;s done.
      </Text>
      <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel the timer" style={styles.outlineBtn}>
        <Text style={styles.outlineText}>Cancel the timer</Text>
      </Pressable>
    </View>
  );
}
