/**
 * Workout · Session body — type chip + live clock (floored) or typed duration + note.
 * Finish CTA is owned by the shell (disabled until floor met when floored).
 */
import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export type TaskWorkoutSessionBodyProps = {
  kinds: readonly string[];
  kind: string;
  onChangeKind: (k: string) => void;
  /** When true, show live timer over floor; else typed duration. */
  hasFloor: boolean;
  floorMinutes: number;
  timerDisplay: string;
  durationMinutes: string;
  onChangeDurationMinutes: (v: string) => void;
  notes: string;
  onChangeNotes: (v: string) => void;
};

function formatFloorClock(floorMinutes: number): string {
  const m = Math.max(0, Math.round(floorMinutes));
  return `${String(m).padStart(2, "0")}:00`;
}

export function TaskWorkoutSessionBody({
  kinds,
  kind,
  onChangeKind,
  hasFloor,
  floorMinutes,
  timerDisplay,
  durationMinutes,
  onChangeDurationMinutes,
  notes,
  onChangeNotes,
}: TaskWorkoutSessionBodyProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Session</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {kinds.map((k) => {
          const selected = k === kind;
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={k}
              onPress={() => onChangeKind(k)}
              style={({ pressed }) => [
                styles.chip,
                selected ? styles.chipSelected : null,
                pressed ? { opacity: 0.9 } : null,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected ? styles.chipTextSelected : null,
                ]}
              >
                {k}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {hasFloor ? (
        <View style={styles.clockCard}>
          <Text style={styles.clockLive} accessibilityLabel="Elapsed">
            {timerDisplay}
          </Text>
          <Text style={styles.clockFloor}>
            {`over ${formatFloorClock(floorMinutes)} minimum`}
          </Text>
        </View>
      ) : (
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Duration</Text>
          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel="Duration in minutes"
              value={durationMinutes}
              onChangeText={onChangeDurationMinutes}
              keyboardType="number-pad"
              placeholder="24"
              placeholderTextColor={DS_COLORS_V2.text.tertiary}
              style={styles.input}
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>
      )}

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>Note · optional</Text>
        <TextInput
          accessibilityLabel="Session note"
          value={notes}
          onChangeText={onChangeNotes}
          placeholder="How did it feel?"
          placeholderTextColor={DS_COLORS_V2.text.tertiary}
          multiline
          style={styles.noteInput}
        />
      </View>
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
  chips: {
    flexDirection: "row",
    gap: DS_SPACING_V2.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  chipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  chipTextSelected: {
    color: DS_COLORS_V2.brand.primary,
  },
  clockCard: {
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.xl,
    gap: DS_SPACING_V2.xs,
  },
  clockLive: {
    fontSize: 48,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  clockFloor: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
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
  noteInput: {
    minHeight: 72,
    fontSize: 16,
    fontWeight: "400",
    color: DS_COLORS_V2.text.primary,
    textAlignVertical: "top",
  },
});
