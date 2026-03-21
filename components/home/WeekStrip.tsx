import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Shield, X } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

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
            <Shield size={10} color={DS_COLORS.GREEN} />
            <Text style={s.freezeText}>1 freeze</Text>
          </View>
        ) : (
          <View style={s.getFreezePill}>
            <Shield size={10} color={DS_COLORS.DISCOVER_CORAL} />
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
                  <Check size={10} color={DS_COLORS.TEXT_ON_DARK} strokeWidth={3} />
                ) : isToday ? (
                  <View style={s.todayDot} />
                ) : i < todayIndex ? (
                  <X size={8} color={DS_COLORS.dangerMid} />
                ) : null}
              </View>
              <Text style={[s.dayLabel, isToday && s.todayLabel]}>{label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={s.streak}>{`${currentStreak} day streak`}</Text>
      <Text style={[s.note, { color: currentStreak > 0 ? DS_COLORS.DISCOVER_GREEN : DS_COLORS.DISCOVER_CORAL }]}>
        {currentStreak > 0 ? "Keep it going!" : "Complete today's goals to light your first flame"}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.lg,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  freezeRow: {
    flexDirection: "row",
    gap: DS_SPACING.xs,
    alignItems: "center",
    backgroundColor: DS_COLORS.GREEN_BG,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: DS_SPACING.sm,
  },
  freezeText: { fontSize: 11, color: DS_COLORS.GREEN, fontWeight: "600" },
  getFreezePill: {
    flexDirection: "row",
    gap: DS_SPACING.xs,
    alignItems: "center",
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: DS_SPACING.sm,
  },
  getFreeze: { fontSize: 11, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600" },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center" },
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  done: { backgroundColor: DS_COLORS.DISCOVER_GREEN },
  todayDone: { backgroundColor: DS_COLORS.DISCOVER_CORAL },
  missed: { backgroundColor: DS_COLORS.dangerLightBg },
  todayOpen: { backgroundColor: DS_COLORS.WHITE, borderWidth: 2, borderColor: DS_COLORS.DISCOVER_CORAL },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DS_COLORS.DISCOVER_CORAL },
  dayLabel: { marginTop: 5, fontSize: 9, color: DS_COLORS.grayMuted },
  todayLabel: { color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600" },
  streak: {
    textAlign: "center",
    marginTop: 10,
    fontSize: DS_TYPOGRAPHY.SIZE_2XL,
    fontWeight: "800",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  note: { marginTop: 2, textAlign: "center", fontSize: 11, fontWeight: "600" },
});
