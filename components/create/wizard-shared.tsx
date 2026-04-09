import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";
import type { TaskEditorTask } from "@/components/TaskEditorModal";

export const DURATION_PRESETS = [7, 14, 21, 30, 75] as const;
export const CATEGORY_OPTIONS = ["Fitness", "Mind", "Faith", "Discipline", "Other"] as const;

export function DurationPill({
  label,
  selected,
  onPress,
  disabled,
  style,
  accessibilityLabel: a11yLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={a11yLabel ?? `Duration ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      style={[
        {
          height: 44,
          borderRadius: DS_RADIUS.iconButton,
          borderWidth: 1.5,
          borderColor: selected ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
          backgroundColor: selected ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "500",
          color: selected ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function getTaskIcon(taskType: string): string {
  const icons: Record<string, string> = {
    workout: "💪",
    run: "🏃",
    timer: "⏱️",
    simple: "✓",
    water: "💧",
    journal: "📓",
    reading: "📖",
    photo: "📷",
    checkin: "📍",
    counter: "#️⃣",
  };
  return icons[taskType] || "✓";
}

export function getTaskMeta(task: TaskEditorTask & { wizardType?: string }): string {
  const t = task.wizardType ?? task.type;
  const parts: string[] = [t.charAt(0).toUpperCase() + t.slice(1)];
  if (task.type === "run" && task.trackingMode === "distance" && task.targetValue != null) {
    parts.push(`${task.targetValue} ${task.unit || "mi"}`);
  }
  if (task.durationMinutes != null && task.durationMinutes > 0) {
    parts.push(`${task.durationMinutes} min`);
  }
  if (task.type === "counter" && task.targetValue != null) {
    parts.push(`${task.targetValue} ${task.unit || "reps"}`);
  }
  if (task.type === "reading" && task.targetValue != null) {
    parts.push(`${task.targetValue} pages`);
  }
  if (task.type === "water" && task.targetValue != null) {
    parts.push(`${task.targetValue} glasses`);
  }
  return parts.join(" · ");
}
