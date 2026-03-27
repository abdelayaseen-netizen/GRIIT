import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

const RING_SIZE = 64;
const R = 28;
const CX = 32;
const CY = 32;
const STROKE = 3;
const C = 2 * Math.PI * R;

function midnightCountdownText(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const ms = Math.max(0, end.getTime() - now.getTime());
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m left`;
}

type Props = {
  streak: number;
  ringProgress: number;
  onStartFirstTask: () => void;
};

export default React.memo(function StreakHero({ streak, ringProgress, onStartFirstTask }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const timerLabel = useMemo(() => midnightCountdownText(), [tick]);

  const message = useMemo(() => {
    if (streak <= 1) return "Complete your first task to start the clock.";
    if (streak >= 2 && streak <= 6) return "Complete today's goals. Day 7 unlocks Builder rank.";
    return `${streak}-day streak. Keep the chain alive.`;
  }, [streak]);

  const dashOffset = C * (1 - Math.min(1, Math.max(0, ringProgress)));

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <View style={s.ringNumber}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={s.ringSvg}>
            <Circle cx={CX} cy={CY} r={R} stroke={DS_COLORS.BORDER} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              stroke={DS_COLORS.ACCENT}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          </Svg>
          <View style={s.ringCenter}>
            <Text style={s.streakNum}>{streak}</Text>
          </View>
        </View>
        <View style={s.info}>
          <Text style={s.dayLabel}>day streak</Text>
          <Text style={s.msg}>{message}</Text>
          <Text style={s.timer}>{timerLabel}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={s.cta}
        onPress={onStartFirstTask}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Start first task"
      >
        <Text style={s.ctaText}>Start first task →</Text>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    padding: DS_SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ringNumber: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringSvg: {
    position: "absolute",
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  streakNum: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  info: {
    flex: 1,
    marginLeft: DS_SPACING.md,
    minWidth: 0,
  },
  msg: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY },
  timer: {
    marginTop: 4,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: "600",
    color: DS_COLORS.DISCOVER_CORAL,
  },
  cta: {
    marginTop: DS_SPACING.sm,
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.TEXT_ON_DARK,
  },
});
