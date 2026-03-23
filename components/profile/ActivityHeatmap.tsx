import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  securedDateKeys: string[];
};

function monthLabels() {
  const now = new Date();
  const out: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toLocaleString("en-US", { month: "short" }));
  }
  return out;
}

export default React.memo(function ActivityHeatmap({ securedDateKeys }: Props) {
  const securedSet = useMemo(() => new Set(securedDateKeys), [securedDateKeys]);
  const cells = useMemo(() => {
    const arr: number[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push(securedSet.has(key) ? 1 : 0);
    }
    return arr;
  }, [securedSet]);

  const hasAny = cells.some((c) => c > 0);

  if (!hasAny) {
    return (
      <View style={s.wrap}>
        <Text style={s.header}>Activity</Text>
        <View style={s.emptyCard}>
          <View style={s.emptyRow}>
            <Calendar size={22} color={DS_COLORS.DISCOVER_CORAL} />
            <View style={s.emptyTextCol}>
              <Text style={s.emptyTitle}>Your activity map</Text>
              <Text style={s.emptySub}>Complete your first goal and watch this grid come alive.</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const mostlyEmpty = cells.filter((c) => c > 0).length < 5;

  return (
    <View style={s.wrap}>
      <Text style={s.header}>Activity</Text>
      <View style={s.card}>
        <View style={s.months}>
          {monthLabels().map((m) => (
            <Text key={m} style={s.month}>
              {m}
            </Text>
          ))}
        </View>
        <View style={s.grid}>
          {cells.map((v, idx) => (
            <View
              key={idx}
              style={[
                s.cell,
                { backgroundColor: v === 0 ? DS_COLORS.skeletonBg : DS_COLORS.GREEN_BG },
              ]}
            />
          ))}
        </View>
        {mostlyEmpty ? <Text style={s.helper}>Complete goals to light up your grid</Text> : null}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: {
    fontSize: 13,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: 14,
  },
  emptyCard: {
    marginHorizontal: 24,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderRadius: 16,
    padding: 16,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING.md,
  },
  emptyTextCol: { flex: 1 },
  emptyTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  emptySub: {
    marginTop: 4,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  months: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  month: { fontSize: 11, color: DS_COLORS.TEXT_MUTED },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: 8, height: 8, borderRadius: 2, margin: 1 },
  helper: { marginTop: 8, fontSize: 10, color: DS_COLORS.TEXT_MUTED, textAlign: "center" },
});
