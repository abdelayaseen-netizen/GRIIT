/**
 * TaskReadyCard — shown in the body slot when a task has not been armed (Start not yet tapped).
 * Renders per-type hint text and gate-info chips derived from the task config.
 *
 * Replaces the Phase 1 inline placeholder in useTaskCompleteScreen.tsx renderBody.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, Camera, Lock, BookOpen, Droplets, MapPin } from "lucide-react-native";
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import { resolveCheckinRadiusMeters } from "@/lib/checkin-ready-gates";

// ──────────────────────────────────────────────────────────────────────────────
// Storyboard hint text (one line per task type)
// ──────────────────────────────────────────────────────────────────────────────
const HINTS: Record<string, string> = {
  photo: "No timer — capture when you're ready.",
  run: "Manual entry or in-app timer. No GPS.",
  workout: "Log your type and duration.",
  timer: "Stay on screen until the session is done.",
  journal: "No camera — text is the proof.",
  counter: "Tap up to your daily target.",
  water: "Tap up to your daily target.",
  reading: "Reading variant can add a page photo.",
  checkin: "We confirm GPS range — no photo.",
  simple: "",
  manual: "",
};

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type TaskReadyCardProps = {
  taskTypeRaw: string;
  config: TaskCompleteConfig;
  /** Pre-computed counter goal for counter/water/reading tasks. */
  counterGoal?: number;
  /** Pre-computed word minimum for journal tasks. */
  minWords?: number;
};

type GateChipData = {
  icon: React.ReactNode;
  label: string;
  detail: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export function TaskReadyCard({
  taskTypeRaw,
  config,
  counterGoal,
  minWords,
}: TaskReadyCardProps) {
  const hint = HINTS[taskTypeRaw] ?? "Complete this task.";
  const chips: GateChipData[] = [];

  // Time-window chip — shown whenever a window is configured.
  if (config.schedule_window_start && config.schedule_window_end) {
    chips.push({
      icon: <Clock size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: "Time window",
      detail: `Open ${config.schedule_window_start}–${config.schedule_window_end}`,
    });
  } else if (config.schedule_window_start) {
    chips.push({
      icon: <Clock size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: "Time window",
      detail: `Opens ${config.schedule_window_start}`,
    });
  }

  // Camera-only chip — only for tasks that produce a photo.
  if (config.require_camera_only) {
    chips.push({
      icon: <Camera size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: "Camera only",
      detail: "Library blocked · Enforced",
    });
  } else if (
    config.require_photo &&
    (taskTypeRaw === "photo" ||
      taskTypeRaw === "run" ||
      taskTypeRaw === "timer")
  ) {
    chips.push({
      icon: <Camera size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: "Photo proof",
      detail: "Capture during the session",
    });
  }

  // Word-minimum chip — journal only.
  if (taskTypeRaw === "journal" && typeof minWords === "number" && minWords > 0) {
    chips.push({
      icon: <BookOpen size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: `${minWords} words minimum`,
      detail: "Your writing is the proof",
    });
  }

  // Tap-target chip — counter / water / reading.
  if (
    (taskTypeRaw === "counter" ||
      taskTypeRaw === "water" ||
      taskTypeRaw === "reading") &&
    typeof counterGoal === "number" &&
    counterGoal > 0
  ) {
    const unitLabel =
      taskTypeRaw === "water"
        ? "cups"
        : taskTypeRaw === "reading"
        ? "pages"
        : "reps";
    chips.push({
      icon:
        taskTypeRaw === "water" ? (
          <Droplets size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ) : (
          <Lock size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
        ),
      label: `Target · ${counterGoal} ${unitLabel}`,
      detail: "Tap each one",
    });
  }

  // Location chip — checkin / location-gated. Default radius 200 (never 50).
  if (config.require_location) {
    const radiusM = resolveCheckinRadiusMeters(config.location_radius_meters);
    const locName = config.location_name ?? "saved spot";
    chips.push({
      icon: <MapPin size={13} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />,
      label: "Location",
      detail: `Within ${radiusM} m of ${locName} · Enforced`,
    });
  }

  return (
    <View style={styles.wrap}>
      {chips.length > 0 ? (
        <View style={styles.chipsWrap}>
          {chips.map((chip, i) => (
            <GateChip key={i} {...chip} />
          ))}
        </View>
      ) : null}
      {hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function GateChip({ icon, label, detail }: GateChipData) {
  return (
    <View style={styles.chip}>
      <View style={styles.chipIcon}>{icon}</View>
      <View style={styles.chipText}>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: DS_SPACING_V2.xl,
    paddingHorizontal: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.md,
  },
  chipsWrap: {
    gap: DS_SPACING_V2.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipIcon: {
    width: 20,
    alignItems: "center",
    paddingTop: 1,
  },
  chipText: {
    flex: 1,
    gap: 2,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    lineHeight: 18,
  },
  chipDetail: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 16,
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
});
