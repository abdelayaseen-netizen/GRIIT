import React from "react";
import { Text, View } from "react-native";
import ControlPill, { ControlPillRow } from "@/components/ds/ControlPill";
import { fmtMmSs } from "@/lib/task-flow-state";
import { SESSION_HONESTY } from "@/lib/work-step";
import { styles } from "../taskFlowStyles";

const STOP = "Stop";
const CANCEL_TYPE = "Cancel, I'll type it";

type Props = {
  taskType: string;
  sessionUp: number;
  onStop: () => void;
  onCancel: () => void;
};

export function SessionStep({ taskType, sessionUp, onStop, onCancel }: Props) {
  const stopA11y = taskType === "run" ? "Stop and use duration" : "Stop and use minutes";
  return (
    <View style={styles.body}>
      <Text style={styles.statLabel}>SESSION TIMER</Text>
      <Text style={styles.huge}>{fmtMmSs(sessionUp)}</Text>
      <Text style={styles.disclosure}>{SESSION_HONESTY}</Text>
      <ControlPillRow>
        <ControlPill label={STOP} icon="square" onPress={onStop} accessibilityLabel={stopA11y} />
        <ControlPill label={CANCEL_TYPE} icon="x" onPress={onCancel} />
      </ControlPillRow>
    </View>
  );
}
