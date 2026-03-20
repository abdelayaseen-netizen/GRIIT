import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Shield, X } from "lucide-react-native";

const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function mondayFirstDayIndex(date: Date): number {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

export default function WeekStrip({
  securedDateKeys,
  currentStreak,
  freezeCount,
}: {
  securedDateKeys: string[];
  currentStreak: number;
  freezeCount: number;
}) {
  const now = new Date();
  const todayIndex = mondayFirstDayIndex(now);
  const dateKeys = useMemo(() => {
    const d = new Date(now);
    const idx = mondayFirstDayIndex(d);
    d.setDate(d.getDate() - idx);
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      out.push(x.toISOString().slice(0, 10));
    }
    return out;
  }, [now]);
  const set = useMemo(() => new Set(securedDateKeys), [securedDateKeys]);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>This week</Text>
        {freezeCount > 0 ? (
          <View style={s.freezeRow}>
            <Shield size={10} color="#2E7D32" />
            <Text style={s.freezeText}>1 freeze</Text>
          </View>
        ) : (
          <View style={s.getFreezePill}>
            <Shield size={10} color="#E8593C" />
            <Text style={s.getFreeze}>Get a freeze</Text>
          </View>
        )}
      </View>
      <View style={s.daysRow}>
        {LABELS.map((label, i) => {
          const key = dateKeys[i] ?? "";
          const completed = set.has(key);
          const isToday = i === todayIndex;
          return (
            <View key={label} style={s.dayCol}>
              <View style={[s.circle, completed ? (isToday ? s.todayDone : s.done) : isToday ? s.todayOpen : s.missed]}>
                {completed ? (
                  <Check size={10} color="#fff" strokeWidth={3} />
                ) : isToday ? (
                  <View style={s.todayDot} />
                ) : i < todayIndex ? (
                  <X size={8} color="#E24B4A" />
                ) : null}
              </View>
              <Text style={[s.dayLabel, isToday && s.todayLabel]}>{label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={s.streak}>{`${currentStreak} day streak`}</Text>
      <Text style={[s.note, { color: currentStreak > 0 ? "#4CAF50" : "#E8593C" }]}>
        {currentStreak > 0 ? "Keep it going!" : "Complete today's goals to light your first flame"}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 12, marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  freezeRow: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#E8F5E9", borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  freezeText: { fontSize: 11, color: "#2E7D32", fontWeight: "600" },
  getFreezePill: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#FFF3ED", borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  getFreeze: { fontSize: 11, color: "#E8593C", fontWeight: "600" },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center" },
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  done: { backgroundColor: "#4CAF50" },
  todayDone: { backgroundColor: "#E8593C" },
  missed: { backgroundColor: "#FCEBEB" },
  todayOpen: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#E8593C" },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E8593C" },
  dayLabel: { marginTop: 5, fontSize: 9, color: "#BBB" },
  todayLabel: { color: "#E8593C", fontWeight: "600" },
  streak: { textAlign: "center", marginTop: 10, fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
  note: { marginTop: 2, textAlign: "center", fontSize: 11, fontWeight: "600" },
});
