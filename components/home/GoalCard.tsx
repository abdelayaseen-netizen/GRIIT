import React, { useEffect, useState } from "react";
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
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";

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
    if (isError) {
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
          onPress={() => setExpanded((e) => !e)}
          onLongPress={onLongPressChallenge}
          delayLongPress={500}
          style={s.challengeRow}
          accessibilityRole="button"
          accessibilityLabel={`${challengeName} — Day ${currentDay ?? 1} of ${durationDays ?? 1} — ${expanded ? "collapse" : "expand"}`}
          accessibilityHint="Tap to expand or collapse. Long press for options."
        >
          <View style={[s.iconBox, completedSection && s.iconBoxCompleted]}>
            {completedSection ? <Check size={16} color={DS_COLORS.GREEN} /> : <Target size={16} color={DS_COLORS.GREEN} />}
          </View>
          <View style={s.challengeMid}>
            <TouchableOpacity
              onPress={onPressChallengeName}
              activeOpacity={0.7}
              disabled={!onPressChallengeName}
              accessibilityRole="button"
              accessibilityLabel={`${challengeName} — Day ${currentDay ?? 1} of ${durationDays ?? 1} — tap to view`}
            >
              <Text style={s.challengeName}>{challengeName}</Text>
            </TouchableOpacity>
            <View style={s.progressBg}>
              <View style={[s.progressFill, completedSection && s.progressFillCompleted, { width: `${Math.max(2, progress)}%` }]} />
            </View>
          </View>
          <View style={s.challengeRight}>
            <Text style={s.dayText}>{`Day ${currentDay ?? 1} of ${durationDays ?? 1}`}</Text>
            <Text style={[s.count, completedSection && s.countCompleted]}>{`${completed}/${total}`}</Text>
            <ChevronDown
              size={14}
              color={DS_COLORS.TEXT_MUTED}
              style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
            />
          </View>
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
            <Pressable
              key={g.id}
              style={({ pressed }) => [s.todoRow, pressed && s.todoRowPressed]}
              onPressIn={onPressInActiveChallenge}
              onPress={() => onPressGoal(g.id)}
              accessibilityRole="button"
              accessibilityLabel={`Start ${g.title}`}
            >
              <View style={s.todoCircle}>{taskTypeIcon(g.taskType)}</View>
              <Text style={s.todoText}>{g.title}</Text>
              <View style={s.startPill}>
                <Text style={s.startPillText}>Start</Text>
              </View>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { paddingHorizontal: DS_SPACING.xl, paddingTop: 0, marginBottom: DS_SPACING.md },
  challengeRight: { alignItems: "flex-end", justifyContent: "center", gap: 4 },
  dayText: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: "600", color: DS_COLORS.DISCOVER_CORAL },
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxCompleted: {
    backgroundColor: DS_COLORS.GREEN_BG,
  },
  challengeMid: { flex: 1 },
  challengeName: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  progressBg: {
    height: 3,
    backgroundColor: DS_COLORS.CARD_ALT_BG,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 3, backgroundColor: DS_COLORS.DISCOVER_GREEN, borderRadius: 2 },
  progressFillCompleted: { backgroundColor: DS_COLORS.GREEN },
  count: { fontSize: 12, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  countCompleted: { color: DS_COLORS.GREEN },
  doneRow: {
    backgroundColor: DS_COLORS.GREEN_BG,
    borderWidth: 1,
    borderColor: DS_COLORS.COMPLETED_BORDER,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  todoRow: {
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  todoRowPressed: { backgroundColor: DS_COLORS.ACCENT_TINT },
  doneCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DS_COLORS.DISCOVER_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  todoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  todoText: { flex: 1, fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.grayDarker },
  doneRight: { fontSize: 10, fontWeight: "600", color: DS_COLORS.DISCOVER_GREEN },
  startPill: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  startPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_CORAL,
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
    fontWeight: "700",
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
    borderRadius: 28,
    alignItems: "center",
  },
  emptyCtaText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "700",
    color: DS_COLORS.TEXT_ON_DARK,
  },
});
