/**
 * WriteMyOwnSheet — escape-hatch bottom sheet for users who want a custom
 * challenge instead of one of the curated packs.
 *
 * Captures: title, 1–5 tasks (via `NewTaskSheet`), duration chip, difficulty
 * toggle. Tapping "Preview" synthesizes a `ChallengePackDef`-shaped object,
 * stores it in the create-proposal store, and pushes the user to the same
 * `CalendarPreviewScreen` as the curated path.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Plus, Trash2, X } from "lucide-react-native";
import { useRouter } from "expo-router";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import {
  NewTaskSheet,
} from "@/components/create/NewTaskSheet";
import type { WizardTask } from "@/components/create/v2/StepTasks";
import type { ChallengePackDef, PackTaskDef, PackTaskPhoto } from "@/lib/challenge-packs";
import { trackEvent } from "@/lib/analytics";

import { useCreateProposalStore } from "@/store/create-proposal-store";

const TITLE_MIN = 3;
const TITLE_MAX = 60;
const MAX_TASKS = 5;
const ROUTE_PREVIEW = "/create/preview" as const;

const DURATION_OPTIONS: readonly number[] = [7, 21, 30, 60, 75] as const;

export type WriteMyOwnSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function wizardTaskToPackTask(t: WizardTask): PackTaskDef {
  const cfg: Record<string, unknown> = {};
  if (typeof t.durationMinutes === "number") {
    cfg.minutes = t.durationMinutes;
    cfg.durationMinutes = t.durationMinutes;
  }
  if (typeof t.minWords === "number") {
    cfg.minWords = t.minWords;
  }
  const photo: PackTaskPhoto =
    t.requirePhoto === true ? "required" : "optional";
  return {
    name: t.name,
    type: t.type,
    config: cfg,
    photo,
  };
}

function buildSyntheticPack(title: string, tasks: WizardTask[]): ChallengePackDef {
  return {
    id: `custom-${Date.now()}`,
    name: title,
    emoji: "✏️",
    description: "Custom challenge.",
    taskCount: tasks.length,
    tasks: tasks.map(wizardTaskToPackTask),
  };
}

export function WriteMyOwnSheet({ visible, onClose }: WriteMyOwnSheetProps) {
  const router = useRouter();
  const setProposal = useCreateProposalStore((s) => s.setProposal);

  const [title, setTitle] = useState<string>("");
  const [tasks, setTasks] = useState<WizardTask[]>([]);
  const [duration, setDuration] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<"standard" | "hard">("standard");
  const [newTaskOpen, setNewTaskOpen] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  const reset = useCallback(() => {
    setTitle("");
    setTasks([]);
    setDuration(30);
    setDifficulty("standard");
    setValidationError("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canPreview = useMemo(() => {
    return (
      title.trim().length >= TITLE_MIN &&
      title.trim().length <= TITLE_MAX &&
      tasks.length >= 1 &&
      tasks.length <= MAX_TASKS
    );
  }, [title, tasks.length]);

  const handlePreview = useCallback(() => {
    if (!canPreview) {
      if (title.trim().length < TITLE_MIN) {
        setValidationError(`Title needs at least ${TITLE_MIN} characters.`);
      } else if (tasks.length < 1) {
        setValidationError("Add at least one task.");
      } else {
        setValidationError("Cannot preview yet.");
      }
      return;
    }
    setValidationError("");
    const synthetic = buildSyntheticPack(title.trim(), tasks);
    setProposal({
      pack: synthetic,
      reason: { kind: "default" },
      durationDays: duration,
      difficulty,
    });
    trackEvent("create_custom_previewed", { task_count: tasks.length });
    onClose();
    router.push(ROUTE_PREVIEW as never);
  }, [canPreview, title, tasks, duration, difficulty, setProposal, onClose, router]);

  const handleAddTask = useCallback((t: WizardTask) => {
    setTasks((prev) => (prev.length >= MAX_TASKS ? prev : [...prev, t]));
    setNewTaskOpen(false);
  }, []);

  const handleRemoveTask = useCallback((idx: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close write-my-own"
          style={styles.backdrop}
          onPress={handleClose}
        >
          <Pressable
            accessible={false}
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Write my own challenge</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                onPress={handleClose}
                style={styles.closeBtn}
              >
                <X size={20} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.sectionLabel}>What habit are you building?</Text>
              <TextInput
                accessibilityLabel="Challenge title"
                value={title}
                onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
                placeholder="e.g. Run before work"
                placeholderTextColor={DS_COLORS_V2.text.tertiary}
                maxLength={TITLE_MAX}
                style={styles.input}
              />
              <Text style={styles.helperLine}>
                {`${title.length}/${TITLE_MAX} · min ${TITLE_MIN} characters`}
              </Text>

              <Text style={styles.sectionLabel}>Daily tasks</Text>
              {tasks.map((t, idx) => (
                <View key={`${t.name}-${idx}`} style={styles.taskRow}>
                  <Text style={styles.taskNumber}>{`${idx + 1}.`}</Text>
                  <Text style={styles.taskTitle}>{t.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${t.name}`}
                    hitSlop={8}
                    onPress={() => handleRemoveTask(idx)}
                    style={styles.removeBtn}
                  >
                    <Trash2
                      size={16}
                      color={DS_COLORS_V2.text.secondary}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              ))}
              {tasks.length < MAX_TASKS ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add a task"
                  onPress={() => setNewTaskOpen(true)}
                  style={styles.addBtn}
                >
                  <Plus
                    size={16}
                    color={DS_COLORS_V2.brand.primary}
                    strokeWidth={2}
                  />
                  <Text style={styles.addBtnText}>Add task</Text>
                </Pressable>
              ) : (
                <Text style={styles.helperLine}>
                  You hit the cap of {MAX_TASKS} tasks.
                </Text>
              )}

              <Text style={styles.sectionLabel}>Duration</Text>
              <View style={styles.chipRow}>
                {DURATION_OPTIONS.map((d) => {
                  const selected = d === duration;
                  return (
                    <Pressable
                      key={d}
                      accessibilityRole="button"
                      accessibilityLabel={`${d} days`}
                      accessibilityState={{ selected }}
                      onPress={() => setDuration(d)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextSelected : null,
                        ]}
                      >
                        {`${d} days`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Difficulty</Text>
              <View style={styles.toggleRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Standard difficulty"
                  accessibilityState={{ selected: difficulty === "standard" }}
                  onPress={() => setDifficulty("standard")}
                  style={[
                    styles.toggle,
                    difficulty === "standard" ? styles.toggleSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      difficulty === "standard" ? styles.toggleTextSelected : null,
                    ]}
                  >
                    Standard
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Hard difficulty"
                  accessibilityState={{ selected: difficulty === "hard" }}
                  onPress={() => setDifficulty("hard")}
                  style={[
                    styles.toggle,
                    difficulty === "hard" ? styles.toggleSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      difficulty === "hard" ? styles.toggleTextSelected : null,
                    ]}
                  >
                    Hard
                  </Text>
                </Pressable>
              </View>

              {validationError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Preview challenge"
                accessibilityState={{ disabled: !canPreview }}
                onPress={handlePreview}
                disabled={!canPreview}
                style={[
                  styles.primaryBtn,
                  canPreview ? null : styles.primaryBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    canPreview ? null : styles.primaryBtnTextDisabled,
                  ]}
                >
                  Preview
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>

      <NewTaskSheet
        visible={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onSave={handleAddTask}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.overlay.photoGradientStrong,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.xl,
    borderTopRightRadius: DS_RADIUS_V2.xl,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.lg,
    maxHeight: "92%",
  },
  handleRow: {
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { marginTop: DS_SPACING_V2.xs },
  scrollContent: { paddingBottom: DS_SPACING_V2.lg, gap: DS_SPACING_V2.xs },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    marginTop: DS_SPACING_V2.sm,
  },
  input: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    paddingHorizontal: DS_SPACING_V2.sm,
    paddingVertical: DS_SPACING_V2.sm,
    color: DS_COLORS_V2.text.primary,
    fontSize: 15,
  },
  helperLine: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
    marginTop: 2,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.xs,
    paddingVertical: DS_SPACING_V2.sm,
    paddingHorizontal: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  taskNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
    width: 20,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING_V2.xxs,
    paddingVertical: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS_V2.surface.divider,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING_V2.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  chipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  chipTextSelected: { color: DS_COLORS_V2.brand.primaryText },
  toggleRow: {
    flexDirection: "row",
    gap: DS_SPACING_V2.xs,
  },
  toggle: {
    flex: 1,
    paddingVertical: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    alignItems: "center",
  },
  toggleSelected: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  toggleTextSelected: { color: DS_COLORS_V2.brand.primaryText },
  errorCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
  },
  errorText: {
    fontSize: 13,
    color: DS_COLORS_V2.semantic.danger,
  },
  footer: {
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.xs,
  },
  primaryBtn: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    paddingVertical: 16,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  primaryBtnText: {
    color: DS_COLORS_V2.brand.primaryText,
    fontSize: 16,
    fontWeight: "500",
  },
  primaryBtnTextDisabled: {
    color: DS_COLORS_V2.text.tertiary,
  },
});

export default WriteMyOwnSheet;
