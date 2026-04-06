import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import {
  Check,
  Flame,
  Target,
  Clock,
  BookOpen,
  Activity,
  Camera,
  MapPin,
  ChevronDown,
} from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system"
import { formatTimeHHMM } from "@/lib/time-enforcement";

function taskTypeIcon(type?: string): React.ReactNode {
  switch (type) {
    case "timer":
      return <Clock size={12} color={DS_COLORS.DISCOVER_BLUE} />;
    case "journal":
      return <BookOpen size={12} color={DS_COLORS.CATEGORY_MIND} />;
    case "run":
      return <Activity size={12} color={DS_COLORS.DISCOVER_GREEN} />;
    case "photo":
      return <Camera size={12} color={DS_COLORS.WARNING} />;
    case "checkin":
      return <MapPin size={12} color={DS_COLORS.DISCOVER_CORAL} />;
    case "workout":
      return <Activity size={12} color={DS_COLORS.DISCOVER_GREEN} />;
    default:
      return <Check size={12} color={DS_COLORS.TEXT_MUTED} />;
  }
}

function isOverdue(timeStr: string): boolean {
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
}

function parseTaskMeta(taskConfig?: string): { scheduledTime?: string; durationMin?: number } {
  if (!taskConfig?.trim()) return {};
  try {
    const c = JSON.parse(taskConfig) as { scheduled_time?: string; min_duration_minutes?: number };
    return {
      scheduledTime: typeof c.scheduled_time === "string" ? c.scheduled_time : undefined,
      durationMin: typeof c.min_duration_minutes === "number" ? c.min_duration_minutes : undefined,
    };
  } catch {
    return {};
  }
}

type Goal = { id: string; title: string; completed: boolean; taskType?: string; taskConfig?: string };

export default React.memo(function GoalCard({
  challengeName,
  goals,
  currentDay,
  durationDays,
  onPressGoal,
  onPressFindChallenge,
  onPressInActiveChallenge,
  onLongPressChallenge,
  onPressChallengeName,
  isError,
  defaultExpanded = true,
  completedSection = false,
}: {
  challengeName?: string;
  goals: Goal[];
  currentDay?: number;
  durationDays?: number;
  onPressGoal: (goalId: string) => void;
  onPressFindChallenge: () => void;
  onPressInActiveChallenge?: () => void;
  onLongPressChallenge?: () => void;
  onPressChallengeName?: () => void;
  isError?: boolean;
  defaultExpanded?: boolean;
  completedSection?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  useEffect(() => {
    if (isError && __DEV__) {
      console.error("[GoalCard] Home goals query failed; showing browse challenges empty state.");
    }
  }, [isError]);

  if (!challengeName) {
    return (
      <View style={s.wrap}>
        <View style={s.empty}>
          <Flame size={40} color={GRIIT_COLORS.primary} />
          <Text style={s.emptyTitle}>Your first challenge is waiting</Text>
          <Text style={s.emptySubtitle}>Pick one. Show up. That&apos;s all it takes.</Text>
          <TouchableOpacity
            style={s.emptyCta}
            onPress={onPressFindChallenge}
            accessibilityRole="button"
            accessibilityLabel="Browse challenges"
            activeOpacity={0.85}
          >
            <Text style={s.emptyCtaText}>Browse challenges →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rows = goals;
  const completed = rows.filter((g) => g.completed).length;
  const total = rows.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={s.wrap}>
      <View style={[s.card, completedSection && s.cardCompleted]}>
        <Pressable
          onLongPress={onLongPressChallenge}
          delayLongPress={500}
          style={s.challengeRow}
          accessibilityRole="button"
          accessibilityLabel={`${challengeName} — Day ${currentDay ?? 1} of ${durationDays ?? 1}`}
          accessibilityHint="Long press for options."
        >
          <View style={[s.iconBox, completedSection && s.iconBoxCompleted]}>
            {completedSection ? <Check size={16} color={DS_COLORS.GREEN} /> : <Target size={16} color={DS_COLORS.GREEN} />}
          </View>
          <View style={s.challengeMid}>
            <TouchableOpacity
              onPress={() => onPressChallengeName?.()}
              activeOpacity={0.7}
              disabled={!onPressChallengeName}
              accessibilityRole="button"
              accessibilityLabel={`${challengeName} — open challenge`}
            >
              <Text style={s.challengeName}>{challengeName}</Text>
            </TouchableOpacity>
            <Text style={s.daySubtitle}>{`Day ${currentDay ?? 1} of ${durationDays ?? 1}`}</Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, completedSection && s.progressFillCompleted, { width: `${Math.max(2, progress)}%` }]} />
            </View>
          </View>
          <TouchableOpacity
            style={s.challengeRight}
            onPress={() => setExpanded((e) => !e)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={expanded ? "Collapse tasks" : "Expand tasks"}
          >
            <Text style={[s.count, completedSection && s.countCompleted]}>{`${completed}/${total}`}</Text>
            <ChevronDown
              size={14}
              color={DS_COLORS.TEXT_MUTED}
              style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
            />
          </TouchableOpacity>
        </Pressable>

        {expanded &&
          rows.map((g) =>
            g.completed ? (
              <View key={g.id} style={s.doneRow}>
                <View style={s.doneCircle}>
                  <Check size={12} color={DS_COLORS.TEXT_ON_DARK} />
                </View>
                <Text style={s.doneText}>{g.title}</Text>
                <Text style={s.doneRight}>Done</Text>
              </View>
            ) : (
              <TaskTodoRow
                key={g.id}
                goal={g}
                onPressInActiveChallenge={onPressInActiveChallenge}
                onPressGoal={() => onPressGoal(g.id)}
              />
            )
          )}
      </View>
    </View>
  );
});

function TaskTodoRow({
  goal,
  onPressInActiveChallenge,
  onPressGoal,
}: {
  goal: Goal;
  onPressInActiveChallenge?: () => void;
  onPressGoal: () => void;
}) {
  const meta = useMemo(() => parseTaskMeta(goal.taskConfig), [goal.taskConfig]);
  const { scheduledTime, durationMin } = meta;
  const overdue = scheduledTime ? isOverdue(scheduledTime) : false;
  const showSub = Boolean(scheduledTime || durationMin);

  return (
    <Pressable
      style={({ pressed }) => [s.todoRow, pressed && s.todoRowPressed]}
      onPressIn={onPressInActiveChallenge}
      onPress={onPressGoal}
      accessibilityRole="button"
      accessibilityLabel={`Start ${goal.title}`}
    >
      <View style={s.todoCircle}>{taskTypeIcon(goal.taskType)}</View>
      <View style={s.todoTextCol}>
        <Text style={s.todoText}>{goal.title}</Text>
        {showSub ? (
          <Text style={[s.taskTimeSub, overdue && { color: DS_COLORS.DANGER }]}>
            {scheduledTime ? formatTimeHHMM(scheduledTime) : ""}
            {scheduledTime && overdue ? " · overdue" : ""}
            {durationMin != null
              ? `${scheduledTime ? " · " : ""}${durationMin} min`
              : ""}
          </Text>
        ) : null}
      </View>
      <View style={s.startBtn}>
        <Text style={s.startBtnText}>Let&apos;s go</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: DS_SPACING.xl, paddingTop: 0, marginBottom: DS_SPACING.md },
  challengeRight: { alignItems: "flex-end", justifyContent: "center", gap: 4 },
  daySubtitle: { fontSize: 10, color: DS_COLORS.TEXT_MUTED, marginBottom: 6 },
  card: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.DISCOVER_GREEN,
  },
  cardCompleted: {
    opacity: 0.8,
    borderLeftColor: DS_COLORS.GREEN,
  },
  challengeRow: { flexDirection: "row", gap: 10, marginBottom: DS_SPACING.md, alignItems: "center" },
  iconBox: {
    width: 34,
    height: 34,
    backgroundColor: DS_COLORS.GREEN_BG,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxCompleted: {
    backgroundColor: DS_COLORS.GREEN_BG,
  },
  challengeMid: { flex: 1 },
  challengeName: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  progressBg: {
    height: 3,
    backgroundColor: DS_COLORS.CARD_ALT_BG,
    borderRadius: DS_RADIUS.SM,
    overflow: "hidden",
  },
  progressFill: { height: 3, backgroundColor: DS_COLORS.DISCOVER_GREEN, borderRadius: DS_RADIUS.SM },
  progressFillCompleted: { backgroundColor: DS_COLORS.GREEN },
  count: { fontSize: 12, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.DISCOVER_CORAL },
  countCompleted: { color: DS_COLORS.GREEN },
  doneRow: {
    backgroundColor: DS_COLORS.GREEN_BG,
    borderWidth: 1,
    borderColor: DS_COLORS.COMPLETED_BORDER,
    borderRadius: DS_RADIUS.MD,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  todoRow: {
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: DS_RADIUS.MD,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  todoRowPressed: { backgroundColor: DS_COLORS.ACCENT_TINT },
  todoTextCol: { flex: 1, minWidth: 0 },
  doneCircle: {
    width: 18,
    height: 18,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.DISCOVER_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  todoCircle: {
    width: 22,
    height: 22,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 2,
    borderColor: DS_COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.DIFFICULTY_EASY_TEXT,
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  todoText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.grayDarker },
  taskTimeSub: { fontSize: 10, color: DS_COLORS.TEXT_MUTED, marginTop: 1 },
  doneRight: { fontSize: 10, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.DISCOVER_GREEN },
  startBtn: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: DS_RADIUS.button,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
  empty: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.lg,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: DS_SPACING.md,
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: DS_SPACING.sm,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCta: {
    marginTop: DS_SPACING.lg,
    alignSelf: "stretch",
    backgroundColor: GRIIT_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: DS_SPACING.lg,
    borderRadius: DS_RADIUS.joinCta,
    alignItems: "center",
  },
  emptyCtaText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
});
