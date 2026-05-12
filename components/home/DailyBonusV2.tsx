import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2 } from "@/lib/design-system";

const GRAY_50 = DS_COLORS_V2.surface.cardChipNeutral;

function noonProgressAndLabel(now: Date): {
  pct: number;
  label: string;
  expired: boolean;
} {
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
  return { pct, label: `${h}h ${m}m`, expired: false };
}

export default React.memo(function DailyBonusV2() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  void tick;
  const { pct, label, expired } = noonProgressAndLabel(new Date());

  const metaText = expired
    ? "Expired"
    : `${label} left · all tasks done before noon`;

  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <View style={s.iconBox}>
            <Clock size={14} color={DS_COLORS_V2.text.secondary} />
          </View>
          <Text style={s.title}>Noon bonus</Text>
        </View>
        <Text style={s.points}>+14 pts</Text>
      </View>

      <View style={s.barTrack}>
        <View
          style={[s.barFill, { width: expired ? "0%" : `${pct}%` }]}
        />
      </View>

      <Text style={s.meta}>{metaText}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: DS_SPACING_V2.md,
    marginTop: DS_SPACING_V2.sm,
    marginBottom: DS_SPACING_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING_V2.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.xs,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: GRAY_50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  points: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  barTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: GRAY_50,
    overflow: "hidden",
    marginBottom: 6,
  },
  barFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.text.primary,
  },
  meta: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
});
