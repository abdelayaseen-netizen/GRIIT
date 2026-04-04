import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gift } from "lucide-react-native";
import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

function noonProgressAndLabel(now: Date): { pct: number; label: string; expired: boolean } {
  const noon = new Date(now);
  noon.setHours(12, 0, 0, 0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (now.getTime() >= noon.getTime()) {
    return { pct: 0, label: "Expired", expired: true };
  }
  const total = noon.getTime() - start.getTime();
  const left = noon.getTime() - now.getTime();
  const pct = Math.max(0, Math.min(100, (left / total) * 100));
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  return { pct, label: `${h}h ${m}m to noon`, expired: false };
}

export default React.memo(function DailyBonus() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { pct, label, expired } = useMemo(() => noonProgressAndLabel(new Date()), [tick]);

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <View style={s.iconBox}>
          <Gift size={16} color={DS_COLORS.amberDarkText} />
        </View>
        <View style={s.mid}>
          <Text style={s.title}>Complete all tasks before noon</Text>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: expired ? "0%" : `${pct}%` }]} />
          </View>
          <View style={s.metaRow}>
            <Text style={s.timerText}>{label}</Text>
            <Text style={s.points}>+14</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
    backgroundColor: DS_COLORS.WARNING_BG,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    borderColor: DS_COLORS.DAILY_BONUS_BORDER,
    padding: DS_SPACING.md,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: DS_SPACING.sm },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.rankGoldBg,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.amberDarkText,
  },
  barBg: {
    marginTop: DS_SPACING.sm,
    height: DS_MEASURES.PROGRESS_BAR_HEIGHT,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.DAILY_BONUS_TIMER_TRACK,
    overflow: "hidden",
  },
  barFill: {
    height: DS_MEASURES.PROGRESS_BAR_HEIGHT,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.WARNING,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerText: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },
  points: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.amberDarkText,
  },
});
