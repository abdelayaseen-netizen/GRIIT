import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Check, Flame, Target } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";

type Goal = { id: string; title: string; completed: boolean };

export default function GoalCard({
  challengeName,
  goals,
  currentDay,
  durationDays,
  onPressGoal,
  onPressFindChallenge,
  isError,
}: {
  challengeName?: string;
  goals: Goal[];
  currentDay?: number;
  durationDays?: number;
  onPressGoal: (goalId: string) => void;
  onPressFindChallenge: () => void;
  isError?: boolean;
}) {
  useEffect(() => {
    if (isError) {
      console.error("[GoalCard] Home goals query failed; showing browse challenges empty state.");
    }
  }, [isError]);

  if (!challengeName) {
    return (
      <View style={s.wrap}>
        <Text style={s.sectionTitle}>Today&apos;s goals</Text>
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

  const synthetic: Goal = { id: "__commit__", title: "You committed to this challenge", completed: true };
  const rows = [synthetic, ...goals];
  const completed = rows.filter((g) => g.completed).length;
  const total = rows.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>Today&apos;s goals</Text>
        <Text style={s.dayText}>{`Day ${currentDay ?? 1} of ${durationDays ?? 1}`}</Text>
      </View>
      <View style={s.card}>
        <View style={s.challengeRow}>
          <View style={s.iconBox}>
            <Target size={16} color={DS_COLORS.GREEN} />
          </View>
          <View style={s.challengeMid}>
            <Text style={s.challengeName}>{challengeName}</Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.max(2, progress)}%` }]} />
            </View>
          </View>
          <Text style={s.count}>{`${completed}/${total}`}</Text>
        </View>

        {rows.map((g) =>
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
              onPress={() => onPressGoal(g.id)}
              accessibilityRole="button"
              accessibilityLabel={`Start goal: ${g.title}`}
            >
              <View style={s.todoCircle} />
              <Text style={s.todoText}>{g.title}</Text>
              <Text style={s.todoRight}>Start</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: DS_SPACING.xl, paddingTop: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: DS_SPACING.md, alignItems: "center" },
  sectionTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  dayText: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: "600", color: DS_COLORS.DISCOVER_CORAL },
  card: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.DISCOVER_GREEN,
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
  count: { fontSize: 12, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
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
  todoCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: DS_COLORS.BORDER },
  doneText: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.DIFFICULTY_EASY_TEXT,
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  todoText: { flex: 1, fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.grayDarker },
  doneRight: { fontSize: 10, fontWeight: "600", color: DS_COLORS.DISCOVER_GREEN },
  todoRight: { fontSize: 11, fontWeight: "600", color: DS_COLORS.DISCOVER_CORAL },
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
