/**
 * Workout body — exercises + sets, with active-card editor and inline steppers.
 *
 * For now, the parent can either provide a structured `WorkoutValue` (full
 * sets-and-reps tracking) or fall back to `simpleEntry` (kind + minutes +
 * notes), which mirrors the legacy single-row form.
 */
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Minus, Plus } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type WorkoutSet = { reps: number; weight: number };

type WorkoutExercise = {
  name: string;
  plannedSets: WorkoutSet[];
  loggedSets: (WorkoutSet & { loggedAt: string })[];
};

export type WorkoutValue = { exercises: WorkoutExercise[] };

export type TaskWorkoutBodyProps =
  | {
      mode: "structured";
      value: WorkoutValue;
      onChange: (next: WorkoutValue) => void;
      elapsedLabel: string;
      targetLine: string;
    }
  | {
      mode: "simple";
      kind: string;
      onChangeKind: (v: string) => void;
      durationMinutes: string;
      onChangeDurationMinutes: (v: string) => void;
      notes: string;
      onChangeNotes: (v: string) => void;
      kinds: readonly string[];
      minMinutes: number;
    };

export function TaskWorkoutBody(props: TaskWorkoutBodyProps) {
  if (props.mode === "simple") {
    return (
      <View style={styles.wrap}>
        <View style={styles.simpleCard}>
          <Text style={styles.fieldLabel}>WORKOUT TYPE</Text>
          <View style={styles.kindsRow}>
            {props.kinds.map((k) => {
              const selected = props.kind === k;
              return (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  accessibilityLabel={`${k} workout`}
                  accessibilityState={{ selected }}
                  onPress={() => props.onChangeKind(k)}
                  style={[
                    styles.kindChip,
                    selected ? styles.kindChipSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.kindChipText,
                      selected ? styles.kindChipTextSelected : null,
                    ]}
                  >
                    {k}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.simpleCard}>
          <Text style={styles.fieldLabel}>DURATION (MINUTES)</Text>
          <TextInput
            accessibilityLabel="Workout duration in minutes"
            value={props.durationMinutes}
            onChangeText={props.onChangeDurationMinutes}
            keyboardType="number-pad"
            placeholder={`At least ${props.minMinutes || 1}`}
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            style={styles.simpleInput}
          />
        </View>

        <View style={styles.simpleCard}>
          <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
          <TextInput
            accessibilityLabel="Workout notes"
            value={props.notes}
            onChangeText={props.onChangeNotes}
            multiline
            placeholder="What did you focus on?"
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            style={[styles.simpleInput, { minHeight: 70 }]}
          />
        </View>
      </View>
    );
  }

  const { value, onChange, elapsedLabel, targetLine } = props;
  const activeIndex = value.exercises.findIndex(
    (ex) => ex.loggedSets.length < ex.plannedSets.length
  );

  function logCurrentSet() {
    if (activeIndex < 0) return;
    const ex = value.exercises[activeIndex];
    if (!ex) return;
    const setIndex = ex.loggedSets.length;
    const planned = ex.plannedSets[setIndex];
    if (!planned) return;
    const next: WorkoutValue = {
      exercises: value.exercises.map((e, i) =>
        i === activeIndex
          ? {
              ...e,
              loggedSets: [
                ...e.loggedSets,
                { ...planned, loggedAt: new Date().toISOString() },
              ],
            }
          : e
      ),
    };
    onChange(next);
  }

  function adjustSet(field: "reps" | "weight", delta: number) {
    if (activeIndex < 0) return;
    const ex = value.exercises[activeIndex];
    if (!ex) return;
    const setIndex = ex.loggedSets.length;
    const planned = ex.plannedSets[setIndex];
    if (!planned) return;
    const nextValue = Math.max(0, planned[field] + delta);
    const next: WorkoutValue = {
      exercises: value.exercises.map((e, i) =>
        i === activeIndex
          ? {
              ...e,
              plannedSets: e.plannedSets.map((s, si) =>
                si === setIndex ? { ...s, [field]: nextValue } : s
              ),
            }
          : e
      ),
    };
    onChange(next);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.fieldLabel}>TARGET</Text>
          <Text style={styles.targetText}>{targetLine}</Text>
        </View>
        <View style={styles.elapsedChip}>
          <Text style={styles.elapsedText}>{elapsedLabel}</Text>
        </View>
      </View>

      {value.exercises.map((ex, i) => {
        const isCompleted = ex.loggedSets.length >= ex.plannedSets.length;
        const isActive = i === activeIndex && !isCompleted;
        const status: "completed" | "active" | "upcoming" = isCompleted
          ? "completed"
          : isActive
            ? "active"
            : "upcoming";
        return (
          <ExerciseCard
            key={`${ex.name}-${i}`}
            exercise={ex}
            status={status}
            onLog={logCurrentSet}
            onAdjustReps={(d) => adjustSet("reps", d)}
            onAdjustWeight={(d) => adjustSet("weight", d)}
          />
        );
      })}

      <View style={styles.addTile}>
        <Text style={styles.addTileText}>Add exercise</Text>
      </View>
    </View>
  );
}

function ExerciseCard({
  exercise,
  status,
  onLog,
  onAdjustReps,
  onAdjustWeight,
}: {
  exercise: WorkoutExercise;
  status: "completed" | "active" | "upcoming";
  onLog: () => void;
  onAdjustReps: (delta: number) => void;
  onAdjustWeight: (delta: number) => void;
}) {
  const totalSets = exercise.plannedSets.length;
  const loggedCount = exercise.loggedSets.length;
  const setIndex = loggedCount;
  const planned = exercise.plannedSets[setIndex];

  if (status === "upcoming") {
    return (
      <View style={[styles.exerciseCard, styles.exerciseUpcoming]}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseSub}>{`${totalSets} sets planned`}</Text>
      </View>
    );
  }

  if (status === "completed") {
    return (
      <View style={[styles.exerciseCard, styles.exerciseCompleted]}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseDoneRow}>
            <Text style={styles.exerciseDoneText}>{`${loggedCount} of ${totalSets} sets`}</Text>
            <Check
              size={14}
              color={DS_COLORS_V2.semantic.success}
              strokeWidth={2.5}
            />
          </View>
        </View>
        <View style={styles.setPillsRow}>
          {exercise.loggedSets.map((s, idx) => (
            <View
              key={idx}
              style={[styles.setPill, styles.setPillCompleted]}
            >
              <Text style={styles.setPillTextCompleted}>
                {`${s.reps} × ${s.weight}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.exerciseCard, styles.exerciseActive]}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseSub}>
          {`Set ${loggedCount + 1} of ${totalSets}`}
        </Text>
      </View>
      <View style={styles.setPillsRow}>
        {exercise.plannedSets.map((p, idx) => {
          const done = idx < loggedCount;
          const current = idx === loggedCount;
          return (
            <View
              key={idx}
              style={[
                styles.setPill,
                done
                  ? styles.setPillCompleted
                  : current
                    ? styles.setPillCurrent
                    : styles.setPillUpcoming,
              ]}
            >
              <Text
                style={
                  done
                    ? styles.setPillTextCompleted
                    : current
                      ? styles.setPillTextCurrent
                      : styles.setPillTextUpcoming
                }
              >
                {done && exercise.loggedSets[idx]
                  ? `${exercise.loggedSets[idx]?.reps ?? p.reps} × ${exercise.loggedSets[idx]?.weight ?? p.weight}`
                  : `${p.reps} × ${p.weight}`}
              </Text>
            </View>
          );
        })}
      </View>

      {planned ? (
        <View style={styles.editorRow}>
          <View style={styles.editorField}>
            <Text style={styles.fieldLabel}>REPS</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease reps"
                onPress={() => onAdjustReps(-1)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={6}
              >
                <Minus
                  size={14}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
              <Text style={styles.stepValue}>{planned.reps}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase reps"
                onPress={() => onAdjustReps(1)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={6}
              >
                <Plus
                  size={14}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.editorField}>
            <Text style={styles.fieldLabel}>WEIGHT</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease weight"
                onPress={() => onAdjustWeight(-5)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={6}
              >
                <Minus
                  size={14}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
              <Text style={styles.stepValue}>{planned.weight}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase weight"
                onPress={() => onAdjustWeight(5)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={6}
              >
                <Plus
                  size={14}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Log set ${loggedCount + 1}`}
        onPress={onLog}
        style={({ pressed }) => [
          styles.logBtn,
          pressed ? styles.pressed : null,
        ]}
      >
        <Text style={styles.logBtnText}>{`Log set ${loggedCount + 1}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.sm },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  targetText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  elapsedChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  elapsedText: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },

  exerciseCard: {
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  exerciseCompleted: {
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  exerciseActive: {
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
  },
  exerciseUpcoming: {
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    opacity: 0.6,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  exerciseSub: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  exerciseDoneRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  exerciseDoneText: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.success,
  },
  setPillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  setPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    borderWidth: 1,
  },
  setPillCompleted: {
    backgroundColor: DS_COLORS_V2.semantic.successSoft,
    borderColor: DS_COLORS_V2.semantic.success,
  },
  setPillTextCompleted: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.success,
  },
  setPillCurrent: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  setPillTextCurrent: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  setPillUpcoming: {
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  setPillTextUpcoming: {
    fontSize: 11,
    color: DS_COLORS_V2.text.tertiary,
  },

  editorRow: { flexDirection: "row", gap: 12 },
  editorField: { flex: 1, gap: 4 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    minWidth: 30,
    textAlign: "center",
  },
  pressed: { opacity: 0.85 },
  logBtn: {
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  logBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },

  addTile: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.surface.divider,
    borderStyle: "dashed",
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  addTileText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },

  simpleCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 8,
  },
  simpleInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 6,
  },
  kindsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kindChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DS_RADIUS_V2.full,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  kindChipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  kindChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  kindChipTextSelected: { color: DS_COLORS_V2.brand.primary },
});

