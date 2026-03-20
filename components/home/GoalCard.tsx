import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Check, Target } from "lucide-react-native";

type Goal = { id: string; title: string; completed: boolean };

export default function GoalCard({
  challengeName,
  goals,
  currentDay,
  durationDays,
  onPressGoal,
  onPressFindChallenge,
  isError,
  onRetry,
}: {
  challengeName?: string;
  goals: Goal[];
  currentDay?: number;
  durationDays?: number;
  onPressGoal: (goalId: string) => void;
  onPressFindChallenge: () => void;
  isError?: boolean;
  onRetry?: () => void;
}) {
  if (!challengeName) {
    return (
      <View style={s.wrap}>
        <Text style={s.sectionTitle}>Today&apos;s goals</Text>
        <View style={s.empty}>
          <Text style={s.emptyText}>
            {isError ? "Couldn't load your goals right now." : "Your goals will appear here once you join a challenge."}
          </Text>
          <TouchableOpacity onPress={isError ? onRetry : onPressFindChallenge}>
            <Text style={s.emptyLink}>{isError ? "Try again" : "Find a challenge →"}</Text>
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
          <View style={s.iconBox}><Target size={16} color="#2E7D32" /></View>
          <View style={s.challengeMid}>
            <Text style={s.challengeName}>{challengeName}</Text>
            <View style={s.progressBg}><View style={[s.progressFill, { width: `${Math.max(2, progress)}%` }]} /></View>
          </View>
          <Text style={s.count}>{`${completed}/${total}`}</Text>
        </View>

        {rows.map((g) =>
          g.completed ? (
            <View key={g.id} style={s.doneRow}>
              <View style={s.doneCircle}><Check size={12} color="#fff" /></View>
              <Text style={s.doneText}>{g.title}</Text>
              <Text style={s.doneRight}>Done</Text>
            </View>
          ) : (
            <Pressable
              key={g.id}
              style={({ pressed }) => [s.todoRow, pressed && s.todoRowPressed]}
              onPress={() => onPressGoal(g.id)}
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
  wrap: { paddingHorizontal: 24, paddingTop: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  dayText: { fontSize: 11, fontWeight: "600", color: "#E8593C" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderLeftWidth: 3, borderLeftColor: "#4CAF50" },
  challengeRow: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "center" },
  iconBox: { width: 34, height: 34, backgroundColor: "#E8F5E9", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  challengeMid: { flex: 1 },
  challengeName: { fontSize: 14, fontWeight: "600", color: "#1A1A1A", marginBottom: 6 },
  progressBg: { height: 3, backgroundColor: "#F0EDE6", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, backgroundColor: "#4CAF50", borderRadius: 2 },
  count: { fontSize: 12, fontWeight: "700", color: "#E8593C" },
  doneRow: { backgroundColor: "#F0FAF2", borderWidth: 1, borderColor: "#C8E6C9", borderRadius: 10, padding: 10, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 8 },
  todoRow: { backgroundColor: "#F9F6F1", borderRadius: 10, padding: 10, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 8 },
  todoRowPressed: { backgroundColor: "#FFF3ED" },
  doneCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center" },
  todoCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#D9D5CC" },
  doneText: { flex: 1, fontSize: 13, color: "#2E7D32", textDecorationLine: "line-through", opacity: 0.6 },
  todoText: { flex: 1, fontSize: 13, color: "#444" },
  doneRight: { fontSize: 10, fontWeight: "600", color: "#4CAF50" },
  todoRight: { fontSize: 11, fontWeight: "600", color: "#E8593C" },
  empty: { backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#999", textAlign: "center" },
  emptyLink: { marginTop: 10, fontSize: 13, fontWeight: "600", color: "#E8593C" },
});
