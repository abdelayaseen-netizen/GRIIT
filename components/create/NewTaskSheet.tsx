/**
 * NewTaskSheet — replaces the legacy 1882-line `NewTaskModal.tsx`.
 *
 * Full-screen modal sheet for adding a custom task to the wizard.
 * Layout:
 *   1. Task name input
 *   2. Proof type grid (6 visible types, "Need more?" expands to 4 advanced)
 *   3. Inline type-specific config (timer duration, counter target, etc.)
 *   4. Verified proof card (dark)
 *   5. Add task CTA
 *
 * The sheet returns a `WizardTask` to the parent on save.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  CheckSquare,
  GlassWater,
  MapPin,
  Pencil,
  ShieldAlert,
  Target,
  Timer as TimerIcon,
  Footprints,
  Dumbbell,
  BookOpen,
} from "lucide-react-native";

import { DS_V3 } from "@/lib/design-system";
import { Button, Chip } from "@/components/ds";
import { FLAGS } from "@/lib/feature-flags";
import { useApp } from "@/contexts/AppContext";
import { parseDistanceUnit } from "@/lib/distance-unit";
import type {
  RunGoalType,
  RunTrackingMode,
  RunUnit,
  WizardTask,
  WizardTaskType,
} from "@/components/create/v2/StepTasks";

type ProofTypeDef = {
  id: WizardTaskType;
  label: string;
  description: string;
  icon: (props: { size: number; color: string; strokeWidth: number }) => React.ReactNode;
  advanced?: boolean;
};

const PROOF_TYPES: readonly ProofTypeDef[] = [
  {
    id: "simple",
    label: "Check off",
    description: "Tap to confirm the task is done, with no proof attached.",
    icon: (p) => <CheckSquare {...p} />,
  },
  {
    id: "photo",
    label: "Photo",
    description: "A photo taken in the app completes the day.",
    icon: (p) => <Camera {...p} />,
  },
  {
    id: "timer",
    label: "Timer",
    description: "A countdown runs in the app and the day counts when it reaches zero.",
    icon: (p) => <TimerIcon {...p} />,
  },
  {
    id: "journal",
    label: "Text",
    description: "A short written note completes the day.",
    icon: (p) => <Pencil {...p} />,
  },
  {
    id: "run",
    label: "Run",
    description: "Run records distance and time from the phone, and the day counts only when both are recorded.",
    icon: (p) => <Footprints {...p} />,
  },
  {
    id: "counter",
    label: "Counter",
    description: "Count up to a daily target and the day counts when the target is met.",
    icon: (p) => <Target {...p} />,
  },
  {
    id: "workout",
    label: "Workout",
    description: "Log a session and the day counts when the time is recorded.",
    icon: (p) => <Dumbbell {...p} />,
    advanced: true,
  },
  {
    id: "reading",
    label: "Reading",
    description: "Count pages to a daily target and the day counts when the target is met.",
    icon: (p) => <BookOpen {...p} />,
    advanced: true,
  },
  {
    id: "checkin",
    label: "Check-in",
    description: "The day counts when you are at the saved place.",
    icon: (p) => <MapPin {...p} />,
    advanced: true,
  },
  {
    id: "water",
    label: "Water",
    description: "Count glasses to a daily target and the day counts when the target is met.",
    icon: (p) => <GlassWater {...p} />,
    advanced: true,
  },
] as const;

const TIMER_PRESETS: readonly { mins: number; label: string }[] = [
  { mins: 5, label: "5 min" },
  { mins: 10, label: "10 min" },
  { mins: 15, label: "15 min" },
  { mins: 30, label: "30 min" },
] as const;

const NAME_MAX = 60;

const RUN_GOAL_TYPES: readonly { id: RunGoalType; label: string }[] = [
  { id: "distance", label: "Distance" },
  { id: "time", label: "Time" },
  { id: "pace", label: "Pace" },
] as const;

const RUN_TRACKING_MODES: readonly { id: RunTrackingMode; label: string }[] = [
  { id: "gps", label: "GPS auto-track" },
  { id: "manual", label: "Manual" },
] as const;


type NewTaskState = {
  name: string;
  type: WizardTaskType | null;
  verified: boolean;
  durationMinutes?: number;
  minWords?: number;
  counterGoal?: number;
  counterUnit?: string;
  locationName?: string;
  radiusMeters?: number;
  runGoalType: RunGoalType;
  runTarget?: number;
  runJustTrack: boolean;
  runTrackingMode: RunTrackingMode;
};

const INITIAL_STATE: NewTaskState = {
  name: "",
  type: "simple",
  verified: false,
  runGoalType: "distance",
  runJustTrack: false,
  runTrackingMode: "gps",
};

export type NewTaskSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (task: WizardTask) => void;
};

export function NewTaskSheet({ visible, onClose, onSave }: NewTaskSheetProps) {
  const { profile } = useApp();
  const runUnit: RunUnit = parseDistanceUnit(profile?.distance_unit);
  const [state, setState] = useState<NewTaskState>(INITIAL_STATE);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");

  const visibleTypes = useMemo(
    () => PROOF_TYPES.filter((t) => !t.advanced),
    []
  );
  const advancedTypes = useMemo(
    () => PROOF_TYPES.filter((t) => t.advanced),
    []
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setAdvancedOpen(false);
    setSaveError("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canSave = state.name.trim().length > 0 && state.type !== null;

  // Verified and Manual tracking are mutually exclusive on a Run: a manual
  // Run can never wear Verified. When Manual is selected, Verified is locked off.
  const verifiedLocked =
    state.type === "run" && state.runTrackingMode === "manual";

  const handleSave = useCallback(() => {
    if (!canSave || state.type == null) return;
    if (state.type === "checkin") {
      const loc = state.locationName?.trim() ?? "";
      if (!loc) {
        setSaveError("Location is required");
        return;
      }
      if (state.radiusMeters == null || state.radiusMeters <= 0) {
        setSaveError("Radius is required");
        return;
      }
    }
    const targetTypes = state.type === "reading" || state.type === "water" || state.type === "counter";
    const defaultTarget = state.type === "water" ? 8 : 10;
    const loc = state.locationName?.trim() ?? "";
    const task: WizardTask = {
      name: state.name.trim(),
      type: state.type,
      durationMinutes: state.durationMinutes,
      minWords: state.minWords,
      requirePhoto: state.type === "photo" || state.verified,
      ...(targetTypes
        ? { targetValue: state.counterGoal ?? defaultTarget }
        : {}),
      ...(state.type === "checkin"
        ? {
            locationName: loc,
            radiusMeters: state.radiusMeters,
          }
        : {}),
      ...(state.type === "run"
        ? {
            runGoalType: state.runGoalType,
            runTarget: state.runJustTrack ? undefined : state.runTarget,
            runTrackingMode: state.runTrackingMode,
            runUnit,
          }
        : {}),
    };
    onSave(task);
    reset();
  }, [canSave, state, onSave, reset, runUnit]);

  const setType = useCallback((id: WizardTaskType) => {
    setSaveError("");
    setState((p) => ({ ...p, type: id }));
  }, []);

  function renderInlineConfig() {
    if (state.type === "timer") {
      return (
        <View style={styles.configCard}>
          <Text style={styles.label}>DURATION</Text>
          <View style={styles.chipRow}>
            {TIMER_PRESETS.map((preset) => {
              const selected = state.durationMinutes === preset.mins;
              return (
                <Pressable
                  key={preset.mins}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset.label} timer`}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    setState((p) => ({ ...p, durationMinutes: preset.mins }))
                  }
                  style={[
                    styles.presetChip,
                    selected ? styles.presetChipSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      selected ? styles.presetChipTextSelected : null,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }
    if (state.type === "journal") {
      return (
        <View style={styles.configCard}>
          <Text style={styles.label}>MIN WORDS</Text>
          <TextInput
            accessibilityLabel="Minimum words"
            value={state.minWords ? String(state.minWords) : ""}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              const n = parseInt(cleaned, 10);
              setState((p) => ({
                ...p,
                minWords: Number.isNaN(n) ? undefined : Math.max(1, Math.min(500, n)),
              }));
            }}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.configInput}
          />
        </View>
      );
    }
    if (
      state.type === "counter" ||
      state.type === "water" ||
      state.type === "reading"
    ) {
      return (
        <View style={styles.configCard}>
          <Text style={styles.label}>DAILY TARGET</Text>
          <TextInput
            accessibilityLabel="Daily target"
            value={state.counterGoal ? String(state.counterGoal) : ""}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              const n = parseInt(cleaned, 10);
              setState((p) => ({
                ...p,
                counterGoal: Number.isNaN(n) ? undefined : Math.max(1, Math.min(100, n)),
              }));
            }}
            keyboardType="number-pad"
            placeholder={state.type === "water" ? "8" : "10"}
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.configInput}
          />
          {state.type === "counter" ? (
            <>
              <Text style={[styles.label, { marginTop: 8 }]}>UNIT</Text>
              <TextInput
                accessibilityLabel="Unit name"
                value={state.counterUnit ?? ""}
                onChangeText={(v) => setState((p) => ({ ...p, counterUnit: v }))}
                placeholder="cups, pages, reps…"
                placeholderTextColor={DS_V3.color.textSecondary}
                style={styles.configInput}
              />
            </>
          ) : null}
        </View>
      );
    }
    if (state.type === "checkin") {
      return (
        <View style={styles.configCard}>
          <Text style={styles.label}>LOCATION</Text>
          <TextInput
            accessibilityLabel="Location name"
            value={state.locationName ?? ""}
            onChangeText={(v) => {
              setSaveError("");
              setState((p) => ({ ...p, locationName: v }));
            }}
            placeholder="Name this place"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.configInput}
          />
          <Text style={[styles.label, { marginTop: 8 }]}>RADIUS (METERS)</Text>
          <TextInput
            accessibilityLabel="Radius in meters"
            value={state.radiusMeters != null ? String(state.radiusMeters) : ""}
            onChangeText={(v) => {
              setSaveError("");
              const cleaned = v.replace(/[^0-9]/g, "");
              const n = parseInt(cleaned, 10);
              setState((p) => ({
                ...p,
                radiusMeters: Number.isNaN(n) ? undefined : Math.max(1, n),
              }));
            }}
            keyboardType="number-pad"
            placeholder="Meters"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.configInput}
          />
          {saveError ? <Text style={styles.inlineError}>{saveError}</Text> : null}
        </View>
      );
    }
    if (state.type === "run" && FLAGS.RUN_GOAL_CONFIG) {
      const unitUpper = runUnit.toUpperCase();
      const goalLabel =
        state.runGoalType === "time"
          ? "TARGET TIME (MIN)"
          : state.runGoalType === "pace"
            ? `TARGET PACE (MIN/${unitUpper})`
            : `TARGET DISTANCE (${unitUpper})`;
      const unitSuffix =
        state.runGoalType === "time"
          ? "min"
          : state.runGoalType === "pace"
            ? `min/${runUnit}`
            : runUnit;
      const targetPlaceholder =
        state.runGoalType === "time"
          ? "30"
          : state.runGoalType === "pace"
            ? "9"
            : "5";
      return (
        <View style={styles.configCard}>
          <Text style={styles.label}>GOAL TYPE</Text>
          <View style={styles.chipRow}>
            {RUN_GOAL_TYPES.map((g) => {
              const selected = state.runGoalType === g.id;
              return (
                <Pressable
                  key={g.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${g.label} goal`}
                  accessibilityState={{ selected }}
                  onPress={() => setState((p) => ({ ...p, runGoalType: g.id }))}
                  style={[
                    styles.presetChip,
                    selected ? styles.presetChipSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      selected ? styles.presetChipTextSelected : null,
                    ]}
                  >
                    {g.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.runTargetHeader}>
            <Text style={styles.label}>{goalLabel}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Just track it, no target"
              accessibilityState={{ selected: state.runJustTrack }}
              onPress={() =>
                setState((p) => ({
                  ...p,
                  runJustTrack: !p.runJustTrack,
                  runTarget: undefined,
                }))
              }
              style={[
                styles.justTrackChip,
                state.runJustTrack ? styles.justTrackChipSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.justTrackText,
                  state.runJustTrack ? styles.justTrackTextSelected : null,
                ]}
              >
                Just track it
              </Text>
            </Pressable>
          </View>
          {!state.runJustTrack ? (
            <View style={styles.runTargetRow}>
              <TextInput
                accessibilityLabel={goalLabel}
                value={state.runTarget != null ? String(state.runTarget) : ""}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9.]/g, "");
                  const n = parseFloat(cleaned);
                  setState((p) => ({
                    ...p,
                    runTarget: Number.isNaN(n) ? undefined : n,
                  }));
                }}
                keyboardType="decimal-pad"
                placeholder={targetPlaceholder}
                placeholderTextColor={DS_V3.color.textSecondary}
                style={[styles.configInput, styles.runTargetInput]}
              />
              <Text style={styles.runUnitText}>{unitSuffix}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { marginTop: 8 }]}>TRACKING</Text>
          <View style={styles.chipRow}>
            {RUN_TRACKING_MODES.map((m) => {
              const selected = state.runTrackingMode === m.id;
              // Manual is disabled while Verified is on (mutually exclusive).
              const disabled = m.id === "manual" && state.verified;
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${m.label} tracking`}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() =>
                    setState((p) => ({
                      ...p,
                      runTrackingMode: m.id,
                      // Selecting Manual forces Verified off.
                      verified: m.id === "manual" ? false : p.verified,
                    }))
                  }
                  style={[
                    styles.presetChip,
                    selected ? styles.presetChipSelected : null,
                    disabled ? styles.presetChipDisabled : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      selected ? styles.presetChipTextSelected : null,
                      disabled ? styles.presetChipTextDisabled : null,
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {state.runTrackingMode === "manual" ? (
            <Text style={styles.runHint}>
              Manual runs can&apos;t be verified.
            </Text>
          ) : null}
        </View>
      );
    }
    return null;
  }

  const selectedType = PROOF_TYPES.find((t) => t.id === state.type);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.dim} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={handleClose}
              style={styles.headerBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Add task</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save"
              accessibilityState={{ disabled: !canSave }}
              onPress={canSave ? handleSave : undefined}
              disabled={!canSave}
              style={styles.headerBtnRight}
            >
              <Text style={[styles.saveText, !canSave ? styles.saveTextDisabled : null]}>
                Save
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={styles.heading}>Task name</Text>
              <View style={styles.nameCard}>
                <TextInput
                  accessibilityLabel="Task name"
                  value={state.name}
                  onChangeText={(v) =>
                    setState((p) => ({ ...p, name: v.slice(0, NAME_MAX) }))
                  }
                  placeholder="Morning run, Read 10 pages"
                  placeholderTextColor={DS_V3.color.textSecondary}
                  maxLength={NAME_MAX}
                  style={styles.nameInput}
                />
              </View>
            </View>

            <View style={styles.typeSection}>
              <Text style={styles.heading}>Proof type</Text>
              <View style={styles.chipWrap}>
                {(advancedOpen ? [...visibleTypes, ...advancedTypes] : visibleTypes).map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    selected={state.type === t.id}
                    onPress={() => setType(t.id)}
                  />
                ))}
              </View>
              {selectedType ? (
                <Text style={styles.typeDescription}>{selectedType.description}</Text>
              ) : null}
              {!advancedOpen ? (
                <Button
                  label="4 more types"
                  variant="tertiary"
                  size="small"
                  flush
                  onPress={() => setAdvancedOpen(true)}
                />
              ) : null}
            </View>

            {renderInlineConfig()}

            <View style={styles.verifiedRow}>
              <ShieldAlert size={DS_V3.space.xs * 6} color={DS_V3.color.textPrimary} strokeWidth={2} />
              <View style={styles.verifiedCopy}>
                <Text style={styles.verifiedTitle}>Verified proof</Text>
                <Text style={styles.typeDescription}>
                  Requires a photo taken in the app to complete this task each day.
                </Text>
              </View>
              <Switch
                accessibilityLabel="Verified proof"
                accessibilityState={{ disabled: verifiedLocked }}
                disabled={verifiedLocked}
                value={state.verified && !verifiedLocked}
                onValueChange={(v) =>
                  setState((p) => ({
                    ...p,
                    verified: v,
                    runTrackingMode:
                      v && p.type === "run" ? "gps" : p.runTrackingMode,
                  }))
                }
                trackColor={{
                  false: DS_V3.color.border,
                  true: DS_V3.color.brand,
                }}
                thumbColor={DS_V3.color.textPrimary}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {saveError ? <Text style={styles.inlineError}>{saveError}</Text> : null}
            <Button
              label="Add task"
              disabled={!canSave}
              onPress={handleSave}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const PT = DS_V3.space.xs / 4;

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-end" },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.canvas,
    opacity: 0.65,
  },
  sheet: {
    backgroundColor: DS_V3.color.surface,
    borderTopLeftRadius: DS_V3.radius.card,
    borderTopRightRadius: DS_V3.radius.card,
    borderTopWidth: PT,
    borderColor: DS_V3.color.border,
    maxHeight: "88%",
  },
  handleRow: {
    alignItems: "center",
    paddingTop: DS_V3.space.sm,
  },
  handle: {
    width: DS_V3.space.xs * 9,
    height: DS_V3.space.xs,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  header: {
    height: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    minWidth: DS_V3.size.tap,
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
  },
  headerBtnRight: {
    minWidth: DS_V3.size.tap,
    minHeight: DS_V3.size.tap,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  headerTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  saveText: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  saveTextDisabled: { color: DS_V3.color.textSecondary },
  scroll: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.gutter,
  },
  section: {
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  typeSection: {
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  nameCard: {
    backgroundColor: DS_V3.color.canvas,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.input,
    padding: DS_V3.space.lg,
  },
  nameInput: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingVertical: 0,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  typeDescription: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  verifiedRow: {
    paddingTop: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.lg,
    minHeight: DS_V3.size.tap,
  },
  verifiedCopy: { flex: 1, gap: DS_V3.space.xs },
  verifiedTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
  },
  inlineError: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
    marginBottom: DS_V3.space.sm,
  },
  label: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  configCard: {
    marginTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  configInput: {
    minHeight: DS_V3.size.tap,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    color: DS_V3.color.textPrimary,
    backgroundColor: DS_V3.color.canvas,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.lg,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  presetChip: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.lg,
    paddingVertical: DS_V3.space.md,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    justifyContent: "center",
  },
  presetChipSelected: {
    backgroundColor: DS_V3.color.brandTint,
    borderColor: DS_V3.color.brand,
  },
  presetChipText: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textPrimary,
  },
  presetChipTextSelected: {
    color: DS_V3.color.brandText,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
  },
  presetChipDisabled: { opacity: 0.4 },
  presetChipTextDisabled: { color: DS_V3.color.textSecondary },
  runHint: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  runTargetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: DS_V3.space.sm,
  },
  runTargetRow: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm },
  runTargetInput: { flex: 1 },
  runUnitText: {
    fontSize: DS_V3.type.secondary.fontSize,
    color: DS_V3.color.textSecondary,
  },
  justTrackChip: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.md,
    paddingVertical: DS_V3.space.sm,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    justifyContent: "center",
  },
  justTrackChipSelected: {
    backgroundColor: DS_V3.color.brandTint,
    borderColor: DS_V3.color.brand,
  },
  justTrackText: {
    fontSize: DS_V3.type.caption.fontSize,
    color: DS_V3.color.textSecondary,
  },
  justTrackTextSelected: { color: DS_V3.color.brandText },
});

