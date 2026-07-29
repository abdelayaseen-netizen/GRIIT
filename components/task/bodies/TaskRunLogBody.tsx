/**
 * Run · Log body — typed distance/duration + optional in-app timer (task-states-v2).
 * No GPS / maps. Mounted for taskType === "run" while armed on the Log phase.
 */
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Pause, Play } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { RUN_LOG_HELPER } from "@/lib/run-log";

export { RUN_LOG_HELPER };

export type TaskRunLogBodyProps = {
  distance: string;
  onChangeDistance: (v: string) => void;
  duration: string;
  onChangeDuration: (v: string) => void;
  /** When true, show play/pause for the in-app timer path. */
  showTimer?: boolean;
  isTimerRunning?: boolean;
  timerDisplay?: string;
  onToggleTimer?: () => void;
};

export function TaskRunLogBody({
  distance,
  onChangeDistance,
  duration,
  onChangeDuration,
  showTimer = false,
  isTimerRunning = false,
  timerDisplay,
  onToggleTimer,
}: TaskRunLogBodyProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Log your run</Text>

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>Distance</Text>
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel="Distance in kilometers"
            value={distance}
            onChangeText={onChangeDistance}
            keyboardType="decimal-pad"
            placeholder="5.2"
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            style={styles.input}
          />
          <Text style={styles.unit}>km</Text>
        </View>
      </View>

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>Duration</Text>
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel="Duration in minutes"
            value={duration}
            onChangeText={onChangeDuration}
            keyboardType="number-pad"
            placeholder="32"
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            style={styles.input}
          />
          <Text style={styles.unit}>min</Text>
        </View>
      </View>

      <Text style={styles.helper}>{RUN_LOG_HELPER}</Text>

      {showTimer && onToggleTimer ? (
        <View style={styles.timerRow}>
          {timerDisplay ? (
            <Text style={styles.timerDisplay} accessibilityLabel="Timer">
              {timerDisplay}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isTimerRunning ? "Pause timer" : "Start timer"}
            onPress={onToggleTimer}
            style={({ pressed }) => [
              styles.timerBtn,
              pressed ? { opacity: 0.9 } : null,
            ]}
          >
            {isTimerRunning ? (
              <Pause size={18} color={DS_COLORS_V2.brand.primaryText} strokeWidth={2} />
            ) : (
              <Play size={18} color={DS_COLORS_V2.brand.primaryText} strokeWidth={2} />
            )}
            <Text style={styles.timerBtnText}>
              {isTimerRunning ? "Pause" : "Start timer"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
  },
  heading: {
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  fieldCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 4,
  },
  unit: {
    fontSize: 17,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  helper: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 20,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_SPACING_V2.md,
  },
  timerDisplay: {
    fontSize: 22,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    fontVariant: ["tabular-nums"],
  },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderRadius: DS_RADIUS_V2.md,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: 12,
  },
  timerBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
});
