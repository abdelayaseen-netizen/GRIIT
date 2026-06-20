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
  Timer as TimerIcon,
  Footprints,
  Dumbbell,
  BookOpen,
} from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import type { WizardTask, WizardTaskType } from "@/components/create/v2/StepTasks";

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
    icon: (p) => <GlassWater {...p} />,
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

type NewTaskState = {
  name: string;
  type: WizardTaskType | null;
  verified: boolean;
  durationMinutes?: number;
  minWords?: number;
  counterGoal?: number;
  counterUnit?: string;
};

const INITIAL_STATE: NewTaskState = {
  name: "",
  type: null,
  verified: false,
};

export type NewTaskSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (task: WizardTask) => void;
};

export function NewTaskSheet({ visible, onClose, onSave }: NewTaskSheetProps) {
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

  const handleSave = useCallback(() => {
    if (!canSave || state.type == null) return;
    const task: WizardTask = {
      name: state.name.trim(),
      type: state.type,
      durationMinutes: state.durationMinutes,
      minWords: state.minWords,
      requirePhoto: state.type === "photo" || state.verified,
    };
    onSave(task);
    reset();
  }, [canSave, state, onSave, reset]);

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
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
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
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
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
                placeholderTextColor={DS_COLORS_V2.text.tertiary}
                style={styles.configInput}
              />
            </>
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
                  placeholderTextColor={DS_COLORS_V2.text.tertiary}
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
                        color: DS_COLORS_V2.brand.primary,
                        strokeWidth: 2,
                      })}
                      <Text style={styles.typeLabel}>{t.label}</Text>
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
                          color: DS_COLORS_V2.brand.primary,
                          strokeWidth: 2,
                        })}
                        <Text style={styles.typeLabel}>{t.label}</Text>
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
                  size={16}
                  color={DS_COLORS_V2.streak.securedYellow}
                  strokeWidth={2}
                />
                <Text style={styles.hardTitle}>Verified proof</Text>
                <Switch
                  accessibilityLabel="Require verified proof for this task"
                  value={state.verified}
                  onValueChange={(v) =>
                    setState((p) => ({ ...p, verified: v }))
                  }
                  trackColor={{
                    false: DS_COLORS_V2.overlay.onDarkSurface10,
                    true: DS_COLORS_V2.brand.primaryOnDark,
                  }}
                  thumbColor={DS_COLORS_V2.text.onDark}
                />
              </View>
              <Text style={styles.hardSub}>
                Requires a photo as proof to complete this task each day.
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
                size={14}
                color={
                  canSave
                    ? DS_COLORS_V2.brand.primaryText
                    : DS_COLORS_V2.text.tertiary
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
  flex: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS_V2.surface.divider,
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
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  saveTextDisabled: { color: DS_COLORS_V2.text.tertiary },

  scroll: { flex: 1 },
  scrollContent: {
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.md,
    paddingBottom: 40,
  },

  section: { gap: 8 },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  nameCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  nameInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 8,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeCard: {
    flexBasis: "31%",
    flexGrow: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    alignItems: "flex-start",
    gap: 4,
  },
  typeCardSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  typeSub: {
    fontSize: 10,
    color: DS_COLORS_V2.text.secondary,
  },
  needMore: { paddingVertical: 4 },
  needMoreText: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },

  configCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  configInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  presetChipSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  presetChipTextSelected: { color: DS_COLORS_V2.brand.primary },

  hardCard: {
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.md,
    padding: 14,
    gap: 8,
  },
  hardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  hardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  hardSub: {
    fontSize: 11,
    color: DS_COLORS_V2.text.onDarkSecondary,
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: DS_SPACING_V2.sm,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS_V2.surface.divider,
  },
  footerCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  footerCtaDisabled: { backgroundColor: DS_COLORS_V2.surface.divider },
  footerCtaText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
  footerCtaTextDisabled: { color: DS_COLORS_V2.text.tertiary },
  pressed: { opacity: 0.85 },
});

export default NewTaskSheet;
