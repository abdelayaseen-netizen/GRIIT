import React from "react";
import { Pressable, Text, View } from "react-native";
import { fmtMmSs, logReady } from "@/lib/task-flow-state";
import type { DistanceUnit } from "@/lib/distance-unit";
import { RUN_HONESTY, RUN_NO_MAP } from "@/lib/work-step";
import { TaskKeypad } from "../TaskKeypad";
import { styles } from "../taskFlowStyles";

type KeypadField = "distance" | "duration" | "minutes" | "count";

type Props = {
  taskType: string;
  keypad: { field: KeypadField } | null;
  buffer: string;
  onBuffer: (v: string) => void;
  onKeypadDone: (v: number | null) => void;
  onOpenDistance: () => void;
  onOpenDuration: () => void;
  onToggleUnit: () => void;
  unit: DistanceUnit;
  distance: number | null;
  durationSec: number | null;
  workoutMin: number | null;
  minDurationMinutes: number;
  kind: string;
  onKind: (k: string) => void;
  onUseTimer: () => void;
  onNextPhoto: () => void;
};

export function LogStep({
  taskType,
  keypad,
  buffer,
  onBuffer,
  onKeypadDone,
  onOpenDistance,
  onOpenDuration,
  onToggleUnit,
  unit,
  distance,
  durationSec,
  workoutMin,
  minDurationMinutes,
  kind,
  onKind,
  onUseTimer,
  onNextPhoto,
}: Props) {
  const ready = logReady({
    taskType,
    distance,
    durationSec,
    workoutMin,
    minDurationMinutes,
  });
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{taskType === "run" ? "Log the run" : "Log the session"}</Text>
      <Text style={styles.switchSub}>
        {taskType === "run"
          ? "Then one photo to prove you were out there."
          : "Then one photo to prove you were there."}
      </Text>
      {keypad ? (
        <TaskKeypad
          label={keypad.field === "distance" ? "Distance" : keypad.field === "duration" ? "Duration" : "Minutes"}
          mask={keypad.field === "distance" ? "distance" : keypad.field === "duration" ? "duration" : "minutes"}
          buffer={buffer}
          onBuffer={onBuffer}
          onDone={onKeypadDone}
        />
      ) : (
        <>
          {taskType === "run" ? (
            <Pressable onPress={onOpenDistance} accessibilityRole="button" accessibilityLabel="Distance" style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Pressable
                  onPress={onToggleUnit}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle distance unit"
                  style={styles.unitBtn}
                >
                  <Text style={styles.unitBtnText}>{unit}</Text>
                </Pressable>
              </View>
              <Text style={styles.bigNum}>{distance == null ? "—" : distance.toFixed(2)}</Text>
              <Text style={styles.switchSub}>Tap to type</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onOpenDuration} accessibilityRole="button" accessibilityLabel="Duration" style={styles.card}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.bigNum}>
              {taskType === "run"
                ? durationSec == null
                  ? "—"
                  : fmtMmSs(durationSec)
                : workoutMin == null
                  ? "—"
                  : `${workoutMin}`}
            </Text>
            <Text style={styles.switchSub}>Tap to type</Text>
          </Pressable>
          {taskType === "workout" ? (
            <View style={styles.rowWrap}>
              {["Lift", "Push", "Pull", "Conditioning"].map((k) => (
                <Pressable
                  key={k}
                  onPress={() => onKind(k)}
                  accessibilityRole="button"
                  accessibilityLabel={k}
                  style={[styles.chip, kind === k && styles.chipOn]}
                >
                  <Text style={styles.chipText}>{k}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Pressable
            onPress={onUseTimer}
            accessibilityRole="button"
            accessibilityLabel="Use the timer instead"
            style={styles.dashBtn}
          >
            <Text style={styles.dashText}>Use the timer instead</Text>
          </Pressable>
          <Text style={styles.disclosure}>
            {taskType === "run" ? RUN_HONESTY : "Duration is self-entered unless the in-app timer ran. The photo is still required."}
          </Text>
          {taskType === "run" ? <Text style={styles.disclosure}>{RUN_NO_MAP}</Text> : null}
          <Pressable
            disabled={taskType === "run" ? false : !ready}
            onPress={taskType === "run" && !ready ? onUseTimer : onNextPhoto}
            accessibilityRole="button"
            accessibilityLabel={taskType === "run" ? (ready ? "Post" : "Start") : "Next: photo proof"}
            style={styles.orangeBtn}
          >
            <Text style={styles.btnText}>
              {taskType === "run" ? (ready ? "Post" : "Start") : "Next: photo proof"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
