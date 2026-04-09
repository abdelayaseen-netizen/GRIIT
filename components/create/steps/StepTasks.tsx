import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trash2 } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { CHALLENGE_PACKS, tasksFromPack } from "@/lib/challenge-packs";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import { styles } from "@/components/create/wizard-styles";

export interface StepTasksProps {
  tasks: (TaskEditorTask & { wizardType?: string })[];
  setTasks: React.Dispatch<React.SetStateAction<(TaskEditorTask & { wizardType?: string })[]>>;
  selectedPackId: string | null;
  setSelectedPackId: (id: string | null) => void;
  taskStepError: boolean;
  onAddTask: () => void;
  onEditTask: (index: number) => void;
  onRemoveTask: (index: number) => void;
  onReorderTask: (from: number, to: number) => void;
}

export function StepTasks({
  tasks,
  setTasks,
  selectedPackId,
  setSelectedPackId,
  taskStepError,
  onAddTask,
  onEditTask,
  onRemoveTask,
  onReorderTask,
}: StepTasksProps) {
  void onEditTask;
  void onReorderTask;

  return (
    <>
      <Text style={styles.h1}>Daily tasks</Text>
      <Text style={styles.sub}>What must get done every single day?</Text>
      <Text style={styles.packsHead}>Quick start packs</Text>
      <View style={styles.colGap10}>
        {Array.from({ length: Math.ceil(CHALLENGE_PACKS.length / 2) }, (_, rowIdx) => {
          const row = CHALLENGE_PACKS.slice(rowIdx * 2, rowIdx * 2 + 2);
          return (
            <View key={row.map((p) => p.id).join("-")} style={styles.rowGap10}>
              {row.map((pack) => {
                const sel = selectedPackId === pack.id;
                return (
                  <TouchableOpacity
                    key={pack.id}
                    style={[styles.packCard, sel && styles.packCardSel, { flex: 1 }]}
                    onPress={() => {
                      if (sel) {
                        setSelectedPackId(null);
                        setTasks([]);
                      } else {
                        setSelectedPackId(pack.id);
                        const built = tasksFromPack(pack) as unknown as (TaskEditorTask & { wizardType?: string })[];
                        const withW = pack.tasks.map((t, i) => ({
                          ...(built[i] as object),
                          wizardType: t.type,
                        })) as unknown as (TaskEditorTask & { wizardType?: string })[];
                        setTasks(withW);
                      }
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`${pack.name} pack — ${pack.taskCount} tasks — tap to use this pack`}
                    accessibilityState={{ selected: sel }}
                  >
                    <Text style={styles.packEmoji}>{pack.emoji}</Text>
                    <Text style={styles.packName} numberOfLines={1}>
                      {pack.name}
                    </Text>
                    <Text style={styles.packDesc} numberOfLines={2}>
                      {pack.description}
                    </Text>
                    <Text style={styles.packCount}>{pack.taskCount} tasks</Text>
                  </TouchableOpacity>
                );
              })}
              {row.length === 1 ? <View style={styles.flex1} /> : null}
            </View>
          );
        })}
      </View>
      <Text style={styles.listHead}>Pack tasks</Text>
      {tasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySub}>Add your first daily task</Text>
        </View>
      ) : (
        tasks.map((task, index) => (
          <View key={task.id} style={styles.taskRow}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
              {task.config?.hard_mode ? (
                <View style={styles.hardBadge} accessibilityLabel="Hard mode task">
                  <Text style={styles.hardBadgeText}>Hard</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => onRemoveTask(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remove task ${task.title}`}
            >
              <Trash2 size={18} color={DS_COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        ))
      )}
      {taskStepError ? <Text style={styles.errText}>Add at least one daily task</Text> : null}
      <TouchableOpacity
        style={styles.dashedAdd}
        onPress={onAddTask}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add a new task to this challenge"
      >
        <Text style={styles.dashedAddText}>+ Add custom task</Text>
      </TouchableOpacity>
    </>
  );
}
