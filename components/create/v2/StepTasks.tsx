/**
 * StepTasks — Step 2 of CreateWizardV2.
 *
 * Two tabs:
 *   - Starter packs (5 hardcoded packs — wired to a future
 *     `TRPC.challenges.getStarterPack` if needed; for v2 we ship a curated set).
 *   - Custom — list of user-built tasks (with "Add task" tile).
 *
 * Pure controlled component.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Briefcase,
  Camera,
  Dumbbell,
  Feather,
  Flame,
  Plus,
  Sun,
  Sunrise,
  Trash2,
} from "lucide-react-native";

import { DS_DAYLIGHT } from "@/lib/design-system";
import type {
  WizardCategory,
  WizardDifficulty,
} from "@/components/create/v2/StepRules";

export type WizardTaskType =
  | "simple"
  | "photo"
  | "timer"
  | "journal"
  | "run"
  | "counter"
  | "workout"
  | "reading"
  | "checkin"
  | "water";

export type RunGoalType = "distance" | "time" | "pace";
export type RunTrackingMode = "gps" | "manual";
export type RunUnit = "mi" | "km";

export type WizardTask = {
  name: string;
  type: WizardTaskType;
  durationMinutes?: number;
  minWords?: number;
  requirePhoto?: boolean;
  runGoalType?: RunGoalType;
  /** Target value for the chosen goal type. Omitted = "just track it" (no target). */
  runTarget?: number;
  runTrackingMode?: RunTrackingMode;
  runUnit?: RunUnit;
};

export type WizardPack = {
  id: string;
  name: string;
  subtitle: string;
  tasks: WizardTask[];
  category: WizardCategory;
  durationDays?: number;
  difficulty?: WizardDifficulty;
};

export const PACKS: readonly WizardPack[] = [
  {
    id: "75-hard",
    name: "75 Hard Classic",
    subtitle: "5 strict tasks · original framework",
    category: "discipline",
    durationDays: 75,
    difficulty: "hard",
    tasks: [
      { name: "Workout 1 (45 min)", type: "timer", durationMinutes: 45 },
      { name: "Workout 2 outdoors (45 min)", type: "timer", durationMinutes: 45 },
      { name: "Read 10 pages", type: "reading" },
      { name: "Drink 1 gallon water", type: "water" },
      { name: "Photo proof of progress", type: "photo", requirePhoto: true },
    ],
  },
  {
    id: "athlete",
    name: "Athlete",
    subtitle: "3 tasks · Run, train, check-in",
    category: "fitness",
    tasks: [
      { name: "Run 3 km", type: "run" },
      { name: "Strength session (30 min)", type: "timer", durationMinutes: 30 },
      { name: "Gym check-in", type: "checkin" },
    ],
  },
  {
    id: "faith",
    name: "Faith",
    subtitle: "3 tasks · Prayer, read, gratitude",
    category: "faith",
    tasks: [
      { name: "Prayer (15 min)", type: "timer", durationMinutes: 15 },
      { name: "Read scripture", type: "reading" },
      { name: "Gratitude journal", type: "journal", minWords: 30 },
    ],
  },
  {
    id: "morning",
    name: "Morning routine",
    subtitle: "5 tasks · Win the morning",
    category: "discipline",
    tasks: [
      { name: "Wake up by 6am", type: "simple" },
      { name: "Cold shower", type: "simple" },
      { name: "Stretch (10 min)", type: "timer", durationMinutes: 10 },
      { name: "Journal (50 words)", type: "journal", minWords: 50 },
      { name: "Drink 1L water", type: "water" },
    ],
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    subtitle: "3 tasks · Ship, journal, learn",
    category: "discipline",
    tasks: [
      { name: "Ship one thing", type: "simple" },
      { name: "Journal lessons (60 words)", type: "journal", minWords: 60 },
      { name: "Read 20 pages", type: "reading" },
    ],
  },
] as const;

function packIcon(packId: string, color: string): React.ReactNode {
  const size = 16;
  const strokeWidth = 2;
  switch (packId) {
    case "75-hard":
      return <Flame size={size} color={color} strokeWidth={strokeWidth} />;
    case "athlete":
      return <Dumbbell size={size} color={color} strokeWidth={strokeWidth} />;
    case "faith":
      return <Feather size={size} color={color} strokeWidth={strokeWidth} />;
    case "morning":
      return <Sunrise size={size} color={color} strokeWidth={strokeWidth} />;
    case "entrepreneur":
      return <Briefcase size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return <Sun size={size} color={color} strokeWidth={strokeWidth} />;
  }
}

function taskTypeLabel(type: WizardTaskType): string {
  switch (type) {
    case "simple":
      return "Confirm";
    case "photo":
      return "Photo";
    case "timer":
      return "Timer";
    case "journal":
      return "Journal";
    case "run":
      return "Run";
    case "workout":
      return "Workout";
    case "reading":
      return "Pages";
    case "water":
      return "Water";
    case "counter":
      return "Counter";
    case "checkin":
      return "Check-in";
    default:
      return "Task";
  }
}

export type StepTasksProps = {
  useCustom: boolean;
  onChangeUseCustom: (v: boolean) => void;
  pack: WizardPack | null;
  onChangePack: (pack: WizardPack | null) => void;
  customTasks: WizardTask[];
  onAddCustomTask: () => void;
  onRemoveCustomTask: (index: number) => void;
};

export function StepTasks({
  useCustom,
  onChangeUseCustom,
  pack,
  onChangePack,
  customTasks,
  onAddCustomTask,
  onRemoveCustomTask,
}: StepTasksProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>What must get done daily?</Text>
      <Text style={styles.sub}>Pick a starter pack or build from scratch.</Text>

      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Starter packs tab"
          accessibilityState={{ selected: !useCustom }}
          onPress={() => onChangeUseCustom(false)}
          style={[
            styles.tab,
            !useCustom ? styles.tabSelected : null,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              !useCustom ? styles.tabTextSelected : null,
            ]}
          >
            Starter packs
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Custom tasks tab"
          accessibilityState={{ selected: useCustom }}
          onPress={() => onChangeUseCustom(true)}
          style={[styles.tab, useCustom ? styles.tabSelected : null]}
        >
          <Text
            style={[
              styles.tabText,
              useCustom ? styles.tabTextSelected : null,
            ]}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {!useCustom ? (
        <View style={styles.packsList}>
          {PACKS.map((p) => {
            const selected = pack?.id === p.id;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${p.name} pack`}
                accessibilityState={{ selected }}
                onPress={() => onChangePack(p)}
                style={[
                  styles.packRow,
                  selected ? styles.packRowSelected : null,
                ]}
              >
                <View style={styles.packIconWrap}>
                  {packIcon(p.id, DS_DAYLIGHT.color.accent)}
                </View>
                <View style={styles.packBody}>
                  <Text style={styles.packTitle}>{p.name}</Text>
                  <Text style={styles.packSub} numberOfLines={1}>
                    {p.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.customWrap}>
          {customTasks.length === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add your first task"
              onPress={onAddCustomTask}
              style={styles.emptyAdd}
            >
              <Plus
                size={22}
                color={DS_DAYLIGHT.color.accent}
                strokeWidth={2}
              />
              <Text style={styles.emptyAddText}>Add your first task</Text>
            </Pressable>
          ) : (
            <View style={styles.taskList}>
              {customTasks.map((t, idx) => (
                <View key={`${t.name}-${idx}`} style={styles.taskRow}>
                  <View style={styles.taskRowLeft}>
                    <View style={styles.taskTypeBadge}>
                      <Text style={styles.taskTypeBadgeText}>
                        {taskTypeLabel(t.type)}
                      </Text>
                    </View>
                    <Text style={styles.taskName} numberOfLines={1}>
                      {t.name}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${t.name}`}
                    hitSlop={8}
                    onPress={() => onRemoveCustomTask(idx)}
                  >
                    <Trash2
                      size={14}
                      color={DS_DAYLIGHT.color.inkMuted2}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add another task"
                onPress={onAddCustomTask}
                style={styles.addAnother}
              >
                <Plus
                  size={14}
                  color={DS_DAYLIGHT.color.accent}
                  strokeWidth={2}
                />
                <Text style={styles.addAnotherText}>Add another task</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {pack ? (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Camera
              size={12}
              color={DS_DAYLIGHT.color.inkMuted}
              strokeWidth={2}
            />
            <Text style={styles.previewTitle}>{`${pack.name} · ${pack.tasks.length} tasks`}</Text>
          </View>
          {pack.tasks.map((t, idx) => (
            <Text key={idx} style={styles.previewTask}>
              {`• ${t.name}`}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingTop: 8 },
  h1: {
    fontSize: 23,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: DS_DAYLIGHT.size.eyebrow,
    color: DS_DAYLIGHT.color.inkMuted,
    marginTop: -2,
  },

  tabs: {
    flexDirection: "row",
    padding: 3,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.segmentTrack,
    marginVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: DS_DAYLIGHT.radius.chip,
  },
  tabSelected: { backgroundColor: DS_DAYLIGHT.color.accentTint },
  tabText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  tabTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },

  packsList: { gap: 9, marginTop: 4 },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  packRowSelected: {
    borderColor: DS_DAYLIGHT.color.accent,
    borderWidth: 1.5,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  packIconWrap: {
    width: 42,
    height: 42,
    borderRadius: DS_DAYLIGHT.radius.field,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  packBody: { flex: 1, gap: 2 },
  packTitle: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  packSub: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  customWrap: { gap: 9, marginTop: 4 },
  emptyAdd: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_DAYLIGHT.color.accent,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  emptyAddText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },

  taskList: { gap: 9 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  taskRowLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  taskTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
  },
  taskTypeBadgeText: {
    fontSize: 10,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.5,
    color: DS_DAYLIGHT.color.inkMuted,
    textTransform: "uppercase",
  },
  taskName: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  addAnother: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_DAYLIGHT.color.cardBorder,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
  },
  addAnotherText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },

  previewCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    gap: 6,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewTitle: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: DS_DAYLIGHT.color.inkMuted,
  },
  previewTask: {
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
});

export default StepTasks;
