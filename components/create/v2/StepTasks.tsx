/**
 * Step 2 — Starter packs or custom tasks. Visual layer; parent owns state.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Briefcase,
  Dumbbell,
  Feather,
  Flame,
  Sunrise,
} from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";
import ListRow from "@/components/ds/ListRow";
import SegmentedControl from "@/components/ds/SegmentedControl";
import type {
  WizardCategory,
  WizardDifficulty,
} from "@/components/create/v2/StepRules";
import {
  CHALLENGE_PACKS,
  wizardTasksFromPack,
} from "@/lib/challenge-packs";
import type { GateTime, TaskGate, TaskModelType } from "@/backend/lib/task-model";
import { wizardGateLine } from "@/lib/task-ui";

export type WizardTaskType =
  | TaskModelType
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
  targetValue?: number;
  locationName?: string;
  radiusMeters?: number;
  runGoalType?: RunGoalType;
  runTarget?: number;
  runTrackingMode?: RunTrackingMode;
  runUnit?: RunUnit;
  config?: Record<string, unknown>;
  gates?: TaskGate[];
  gateTime?: GateTime;
  unit?: string;
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

const PACK_ORDER = ["75hard", "athlete", "faith", "morning", "entrepreneur"] as const;

const PACK_COPY: Record<string, { title: string; meta: string }> = {
  "75hard": { title: "75 Hard Classic", meta: "5 strict tasks · original framework" },
  athlete: { title: "Athlete", meta: "3 tasks · run, train, check in" },
  faith: { title: "Faith", meta: "3 tasks · prayer, read, gratitude" },
  morning: { title: "Morning routine", meta: "5 tasks · win the morning" },
  entrepreneur: { title: "Entrepreneur", meta: "3 tasks · ship, journal, learn" },
};

const PACKS: readonly WizardPack[] = PACK_ORDER.map((id) => {
  const pack = CHALLENGE_PACKS.find((p) => p.id === id);
  if (!pack) {
    return {
      id,
      name: PACK_COPY[id]?.title ?? id,
      subtitle: PACK_COPY[id]?.meta ?? "",
      category: "discipline" as WizardCategory,
      tasks: [],
    };
  }
  return {
    id: pack.id,
    name: pack.name,
    subtitle: pack.description,
    category: pack.category ?? "discipline",
    durationDays: pack.durationDays,
    difficulty: pack.difficulty,
    tasks: wizardTasksFromPack(pack).map((t) => ({
      name: t.name,
      type: t.type as WizardTaskType,
      durationMinutes: t.durationMinutes,
      minWords: t.minWords,
      requirePhoto: t.requirePhoto,
      targetValue: t.targetValue,
      locationName: t.locationName,
      radiusMeters: t.radiusMeters,
    })),
  };
});

const ICON = DS_V3.space.xs * 6;
const PT = DS_V3.space.xs / 4;

function packIcon(packId: string, color: string): React.ReactNode {
  switch (packId) {
    case "75hard":
      return <Flame size={ICON} color={color} strokeWidth={2} />;
    case "athlete":
      return <Dumbbell size={ICON} color={color} strokeWidth={2} />;
    case "faith":
      return <Feather size={ICON} color={color} strokeWidth={2} />;
    case "morning":
      return <Sunrise size={ICON} color={color} strokeWidth={2} />;
    default:
      return <Briefcase size={ICON} color={color} strokeWidth={2} />;
  }
}

export type StepTasksProps = {
  useCustom: boolean;
  onChangeUseCustom: (v: boolean) => void;
  pack: WizardPack | null;
  onChangePack: (pack: WizardPack | null) => void;
  customTasks: WizardTask[];
  onAddCustomTask: () => void;
  onEditCustomTask: (index: number) => void;
};

export function StepTasks({
  useCustom,
  onChangeUseCustom,
  pack,
  onChangePack,
  customTasks,
  onAddCustomTask,
  onEditCustomTask,
}: StepTasksProps) {
  const mode = useCustom ? "Custom" : "Starter packs";

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={styles.title}>What must get done daily?</Text>
        <Text style={styles.secondary}>Pick a starter pack or build from scratch.</Text>
      </View>
      <View style={styles.segWrap}>
        <SegmentedControl
          items={["Starter packs", "Custom"]}
          value={mode}
          onChange={(v) => onChangeUseCustom(v === "Custom")}
        />
      </View>
      <View style={styles.list}>
        {!useCustom
          ? PACKS.map((p, i) => {
              const on = pack?.id === p.id;
              const copy = PACK_COPY[p.id] ?? { title: p.name, meta: p.subtitle };
              const tint = on ? DS_V3.color.brandText : DS_V3.color.textPrimary;
              const metaTint = on ? DS_V3.color.brandText : DS_V3.color.textSecondary;
              return (
                <View key={p.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.title}
                    accessibilityState={{ selected: on }}
                    onPress={() => onChangePack(p)}
                    style={[styles.packRow, on ? styles.packOn : null]}
                  >
                    {packIcon(p.id, tint)}
                    <View style={styles.packBody}>
                      <Text style={[styles.bodyStrong, { color: tint }]}>{copy.title}</Text>
                      <Text style={[styles.caption, { color: metaTint }]}>{copy.meta}</Text>
                    </View>
                  </Pressable>
                  {on ? (
                    <View style={styles.taskLines}>
                      {p.tasks.map((t) => (
                        <View key={t.name} style={styles.packTask}>
                          <Text style={styles.bodyStrong}>{t.name}</Text>
                          <Text style={[styles.caption, styles.muted]}>{wizardGateLine(t)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : i < PACKS.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              );
            })
          : customTasks.length === 0 ? (
            <EmptyState
              heading="No tasks yet"
              body="Add at least one task to continue."
              actionLabel="Add a task"
              onAction={onAddCustomTask}
            />
          ) : (
            <>
              <View style={styles.rowsFlush}>
                {customTasks.map((t, i) => (
                  <ListRow
                    key={`${t.name}-${i}`}
                    title={t.name}
                    subtitle={wizardGateLine(t)}
                    divider={i < customTasks.length - 1}
                    trailing={
                      <Button
                        label="Edit"
                        variant="tertiary"
                        size="small"
                        flush
                        onPress={() => onEditCustomTask(i)}
                        accessibilityLabel={`Edit ${t.name}`}
                      />
                    }
                  />
                ))}
              </View>
              <View style={styles.addWrap}>
                <Button label="Add a task" variant="secondary" onPress={onAddCustomTask} />
              </View>
            </>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: DS_V3.space.xs * 35 },
  block: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.xs,
  },
  segWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  list: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  bodyStrong: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
  },
  muted: { color: DS_V3.color.textSecondary },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.gutter,
  },
  packOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.lg,
  },
  packBody: { flex: 1 },
  taskLines: {
    paddingLeft: DS_V3.space.xs * 14,
    paddingRight: DS_V3.space.lg,
    paddingBottom: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  packTask: { gap: DS_V3.space.xs / 2 },
  rowsFlush: { marginHorizontal: -DS_V3.space.gutter },
  divider: {
    height: PT,
    backgroundColor: DS_V3.color.border,
  },
  addWrap: { marginTop: DS_V3.space.gutter },
});
