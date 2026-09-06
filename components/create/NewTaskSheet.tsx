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
  Plus,
  ShieldAlert,
  Target,
  Timer as TimerIcon,
  Footprints,
  Dumbbell,
  BookOpen,
} from "lucide-react-native";

import { DS_DAYLIGHT } from "@/lib/design-system";
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
  sub: string;
  icon: (props: { size: number; color: string; strokeWidth: number }) => React.ReactNode;
  advanced?: boolean;
};

const PROOF_TYPES: readonly ProofTypeDef[] = [
  {
    id: "simple",
    label: "Check off",
    sub: "Just confirm done",
    icon: (p) => <CheckSquare {...p} />,
  },
  {
    id: "photo",
    label: "Photo",
    sub: "Snap proof",
    icon: (p) => <Camera {...p} />,
  },
  {
    id: "timer",
    label: "Timer",
    sub: "Count down",
    icon: (p) => <TimerIcon {...p} />,
  },
  {
    id: "journal",
    label: "Text",
    sub: "Write a note",
    icon: (p) => <Pencil {...p} />,
  },
  {
    id: "run",
    label: "Run",
    sub: "Distance + time",
    icon: (p) => <Footprints {...p} />,
  },
  {
    id: "counter",
    label: "Counter",
    sub: "Hit a daily target",
    icon: (p) => <Target {...p} />,
  },
  {
    id: "workout",
    label: "Workout",
    sub: "Sets × reps",
    icon: (p) => <Dumbbell {...p} />,
    advanced: true,
  },
  {
    id: "reading",
    label: "Reading",
    sub: "Pages",
    icon: (p) => <BookOpen {...p} />,
    advanced: true,
  },
  {
    id: "checkin",
    label: "Check-in",
    sub: "Location",
    icon: (p) => <MapPin {...p} />,
    advanced: true,
  },
  {
    id: "water",
    label: "Water",
    sub: "Cups",
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
  runGoalType: RunGoalType;
  runTarget?: number;
  runJustTrack: boolean;
  runTrackingMode: RunTrackingMode;
};

const INITIAL_STATE: NewTaskState = {
  name: "",
  type: null,
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
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canSave =
    state.name.trim().length >= 2 && state.type !== null;

  // Verified and Manual tracking are mutually exclusive on a Run: a manual
  // Run can never wear Verified. When Manual is selected, Verified is locked off.
  const verifiedLocked =
    state.type === "run" && state.runTrackingMode === "manual";

  const handleSave = useCallback(() => {
    if (!canSave || state.type == null) return;
    const task: WizardTask = {
      name: state.name.trim(),
      type: state.type,
      durationMinutes: state.durationMinutes,
      minWords: state.minWords,
      requirePhoto: state.type === "photo" || state.verified,
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
            placeholderTextColor={DS_DAYLIGHT.color.placeholder}
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
            placeholderTextColor={DS_DAYLIGHT.color.placeholder}
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
                placeholderTextColor={DS_DAYLIGHT.color.placeholder}
                style={styles.configInput}
              />
            </>
          ) : null}
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
                placeholderTextColor={DS_DAYLIGHT.color.placeholder}
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView edges={["bottom"]} style={styles.flex}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel adding task"
              hitSlop={8}
              onPress={handleClose}
              style={styles.headerBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Add task</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save task"
              accessibilityState={{ disabled: !canSave }}
              hitSlop={8}
              onPress={canSave ? handleSave : undefined}
              disabled={!canSave}
              style={styles.headerBtnRight}
            >
              <Text
                style={[
                  styles.saveText,
                  !canSave ? styles.saveTextDisabled : null,
                ]}
              >
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
              <Text style={styles.label}>TASK NAME</Text>
              <View style={styles.nameCard}>
                <TextInput
                  accessibilityLabel="Task name"
                  value={state.name}
                  onChangeText={(v) =>
                    setState((p) => ({ ...p, name: v.slice(0, NAME_MAX) }))
                  }
                  placeholder="e.g. Morning run, Read 10 pages"
                  placeholderTextColor={DS_DAYLIGHT.color.placeholder}
                  maxLength={NAME_MAX}
                  style={styles.nameInput}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>PROOF TYPE</Text>
              <View style={styles.grid}>
                {visibleTypes.map((t) => {
                  const selected = state.type === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${t.label}: ${t.sub}`}
                      accessibilityState={{ selected }}
                      onPress={() => setType(t.id)}
                      style={[
                        styles.typeCard,
                        selected ? styles.typeCardSelected : null,
                      ]}
                    >
                      {t.icon({
                        size: 20,
                        color: selected
                          ? DS_DAYLIGHT.color.accent
                          : DS_DAYLIGHT.color.inkSecondary,
                        strokeWidth: 2,
                      })}
                      <Text
                        style={[
                          styles.typeLabel,
                          selected ? styles.typeLabelSelected : null,
                        ]}
                      >
                        {t.label}
                      </Text>
                      <Text style={styles.typeSub} numberOfLines={1}>
                        {t.sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={advancedOpen ? "Hide advanced types" : "Show 4 advanced types"}
                onPress={() => setAdvancedOpen((p) => !p)}
                style={styles.needMore}
              >
                <Text style={styles.needMoreText}>
                  {advancedOpen
                    ? "Hide advanced"
                    : "Need more? 4 advanced types available"}
                </Text>
              </Pressable>
              {advancedOpen ? (
                <View style={styles.grid}>
                  {advancedTypes.map((t) => {
                    const selected = state.type === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${t.label}: ${t.sub}`}
                        accessibilityState={{ selected }}
                        onPress={() => setType(t.id)}
                        style={[
                          styles.typeCard,
                          selected ? styles.typeCardSelected : null,
                        ]}
                      >
                        {t.icon({
                          size: 20,
                          color: selected
                            ? DS_DAYLIGHT.color.accent
                            : DS_DAYLIGHT.color.inkSecondary,
                          strokeWidth: 2,
                        })}
                        <Text
                          style={[
                            styles.typeLabel,
                            selected ? styles.typeLabelSelected : null,
                          ]}
                        >
                          {t.label}
                        </Text>
                        <Text style={styles.typeSub} numberOfLines={1}>
                          {t.sub}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            {renderInlineConfig()}

            <View style={styles.hardCard}>
              <View style={styles.hardHeader}>
                <ShieldAlert
                  size={19}
                  color={DS_DAYLIGHT.color.inkSecondary}
                  strokeWidth={1.9}
                />
                <Text style={styles.hardTitle}>Verified proof</Text>
                <Switch
                  accessibilityLabel="Require verified proof for this task"
                  accessibilityState={{ disabled: verifiedLocked }}
                  disabled={verifiedLocked}
                  value={state.verified && !verifiedLocked}
                  onValueChange={(v) =>
                    setState((p) => ({
                      ...p,
                      verified: v,
                      // Enabling Verified on a Run forces GPS — manual runs can't be verified.
                      runTrackingMode:
                        v && p.type === "run" ? "gps" : p.runTrackingMode,
                    }))
                  }
                  trackColor={{
                    false: DS_DAYLIGHT.color.toggleOffTrack,
                    true: DS_DAYLIGHT.color.accent,
                  }}
                  thumbColor={DS_DAYLIGHT.color.white}
                />
              </View>
              <Text style={styles.hardSub}>
                {verifiedLocked
                  ? "Switch tracking to GPS to require verified proof. Manual runs can't be verified."
                  : "Requires a photo as proof to complete this task each day."}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={canSave ? "Add task" : "Enter a name to add task"}
              accessibilityState={{ disabled: !canSave }}
              onPress={canSave ? handleSave : undefined}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.footerCta,
                !canSave ? styles.footerCtaDisabled : null,
                pressed && canSave ? styles.pressed : null,
              ]}
            >
              <Plus
                size={16}
                color={
                  canSave
                    ? DS_DAYLIGHT.color.white
                    : DS_DAYLIGHT.color.inkMuted2
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.footerCtaText,
                  !canSave ? styles.footerCtaTextDisabled : null,
                ]}
              >
                {canSave ? "Add task" : "Enter a name to add task"}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_DAYLIGHT.color.canvas },
  handleRow: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: DS_DAYLIGHT.color.handle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    minWidth: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtnRight: {
    minWidth: 56,
    alignItems: "flex-end",
  },
  cancelText: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.accent,
  },
  headerTitle: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.cardTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  saveText: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },
  saveTextDisabled: { color: DS_DAYLIGHT.color.inkMuted2 },

  scroll: { flex: 1 },
  scrollContent: {
    padding: DS_DAYLIGHT.space.screenH,
    gap: 14,
    paddingBottom: 40,
  },

  section: { gap: 8 },
  label: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: DS_DAYLIGHT.color.inkMuted,
  },
  nameCard: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderRadius: DS_DAYLIGHT.radius.field,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  nameInput: {
    fontSize: DS_DAYLIGHT.size.title,
    color: DS_DAYLIGHT.color.ink,
    paddingVertical: 8,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  typeCard: {
    flexBasis: "31%",
    flexGrow: 0,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    alignItems: "flex-start",
    gap: 6,
  },
  typeCardSelected: {
    borderColor: DS_DAYLIGHT.color.accent,
    borderWidth: 1.5,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  typeLabel: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  typeLabelSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },
  typeSub: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  needMore: { paddingVertical: 4 },
  needMoreText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },

  configCard: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  configInput: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    color: DS_DAYLIGHT.color.ink,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  presetChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  presetChipSelected: {
    borderColor: DS_DAYLIGHT.color.accentTint,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  presetChipText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  presetChipTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },
  presetChipDisabled: {
    opacity: 0.4,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  presetChipTextDisabled: { color: DS_DAYLIGHT.color.inkMuted2 },
  runHint: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted2,
  },

  runTargetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  runTargetRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  runTargetInput: { flex: 1 },
  runUnitText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  justTrackChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  justTrackChipSelected: {
    borderColor: DS_DAYLIGHT.color.accentTint,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  justTrackText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  justTrackTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },

  hardCard: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  hardHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  hardTitle: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.ink,
  },
  hardSub: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted,
    lineHeight: 17,
  },

  footer: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: 12,
    paddingBottom: 12,
  },
  footerCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 54,
    borderRadius: DS_DAYLIGHT.radius.buttonLg,
    backgroundColor: DS_DAYLIGHT.color.accent,
  },
  footerCtaDisabled: { backgroundColor: DS_DAYLIGHT.color.segmentTrack },
  footerCtaText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  footerCtaTextDisabled: { color: DS_DAYLIGHT.color.inkMuted2 },
  pressed: { opacity: 0.85 },
});

