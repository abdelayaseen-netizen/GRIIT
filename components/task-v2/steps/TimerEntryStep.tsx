import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { fmtMmSs } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  taskName: string;
  requiredSeconds: number;
  soundOn: boolean;
  onSoundOn: (v: boolean) => void;
  onStart: () => void;
};

export function TimerEntryStep({ taskName, requiredSeconds, soundOn, onSoundOn, onStart }: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{taskName}</Text>
      <Text style={styles.gate}>{fmtMmSs(requiredSeconds)} timer</Text>
      <Text style={styles.gate}>Runs on the clock — lock your phone if you want</Text>
      <View style={styles.switchCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Sound when it ends</Text>
          <Text style={styles.switchSub}>A notification arrives either way</Text>
        </View>
        <Switch value={soundOn} onValueChange={onSoundOn} accessibilityLabel="Sound when it ends" />
      </View>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start ${fmtMmSs(requiredSeconds)}`}
        style={styles.orangeBtn}
      >
        <Text style={styles.btnText}>Start {fmtMmSs(requiredSeconds)}</Text>
      </Pressable>
    </View>
  );
}
