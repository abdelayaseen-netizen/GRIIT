import React, { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { countReady } from "@/lib/task-flow-state";
import { counterGoalCaption } from "@/lib/counter-log";
import { type KeypadMask } from "@/lib/keypad-masks";
import { TaskKeypad } from "../TaskKeypad";
import { styles } from "../taskFlowStyles";

type Props = {
  count: number;
  counterGoal: number;
  counterUnit: string;
  taskType: string;
  keypadOpen: boolean;
  buffer: string;
  onBuffer: (v: string) => void;
  onKeypadDone: (v: number | null) => void;
  onAddOne: () => void;
  onOpenKeypad: () => void;
  onRemoveOne: () => void;
  onAttachPhoto: () => void;
  onSubmit: () => void;
};

export function CountStep({
  count,
  counterGoal,
  counterUnit,
  taskType,
  keypadOpen,
  buffer,
  onBuffer,
  onKeypadDone,
  onAddOne,
  onOpenKeypad,
  onRemoveOne,
  onAttachPhoto,
  onSubmit,
}: Props) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdOpenedKeypad = useRef(false);
  const ready = countReady(count, counterGoal);

  return (
    <View style={styles.body}>
      <View style={styles.countLine}>
        <Text style={styles.huge}>{count}</Text>
        <Text style={styles.unit}>
          {counterGoalCaption(count, counterGoal, counterUnit).slice(String(count).length)}
        </Text>
      </View>
      {keypadOpen ? (
        <TaskKeypad
          label="Count"
          mask={"count" as KeypadMask}
          buffer={buffer}
          onBuffer={onBuffer}
          onDone={onKeypadDone}
        />
      ) : (
        <>
          <Pressable
            onPress={() => {
              if (holdOpenedKeypad.current) return;
              onAddOne();
            }}
            onPressIn={() => {
              holdOpenedKeypad.current = false;
              holdTimer.current = setTimeout(() => {
                holdOpenedKeypad.current = true;
                onOpenKeypad();
              }, 450);
            }}
            onPressOut={() => {
              if (holdTimer.current) clearTimeout(holdTimer.current);
            }}
            accessibilityRole="button"
            accessibilityLabel="Add one"
            style={styles.addOne}
          >
            <Text style={styles.addOneText}>Add one</Text>
          </Pressable>
          <View style={styles.row}>
            <Pressable onPress={onRemoveOne} accessibilityRole="button" accessibilityLabel="Remove one" style={styles.textBtn}>
              <Text style={styles.shareText}>Remove one</Text>
            </Pressable>
            <Pressable onPress={onOpenKeypad} accessibilityRole="button" accessibilityLabel="Type the number" style={styles.textBtn}>
              <Text style={styles.shareText}>Type the number</Text>
            </Pressable>
          </View>
          <Text style={styles.tiny}>Press and hold &quot;Add one&quot; to type it instead</Text>
          <Text style={styles.disclosure}>Self-entered count · nothing is checked.</Text>
          {taskType === "reading" ? (
            <Pressable onPress={onAttachPhoto} accessibilityRole="button" accessibilityLabel="Attach a page photo" style={styles.textBtn}>
              <Text style={styles.shareText}>Attach a page photo</Text>
            </Pressable>
          ) : null}
          <Pressable
            disabled={!ready}
            onPress={onSubmit}
            accessibilityRole="button"
            accessibilityLabel={!ready ? `${count} of ${counterGoal} logged` : "Submit"}
            style={[styles.inkBtn, !ready && styles.disabledBtn]}
          >
            <Text style={styles.inkBtnText}>
              {count < counterGoal ? `${count} of ${counterGoal} logged` : "Submit"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
