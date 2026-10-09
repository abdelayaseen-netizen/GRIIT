import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { DS_V3 } from "@/lib/design-system";
import { dateRange, hourLabel } from "@/lib/v51-format";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  consistencyPct,
  usualHour,
  EMPTY_STATS_COPY,
  type DayState,
  type MeStatsResult,
  type StatsRange,
} from "@/backend/lib/me-stats";

function civilLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return key;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function streakRange(start: string, end: string): string {
  const a = keyDate(start);
  const b = keyDate(end);
  if (!a || !b) return `${civilLabel(start)} – ${civilLabel(end)}`;
  return dateRange(a, b);
}

function keyDate(key: string): Date | null {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

const RANGES: { id: StatsRange; label: string }[] = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "all", label: "All" },
];

export function YourDataTab() {
  const [range, setRange] = useState<StatsRange>("7d");
  const query = useQuery({
    queryKey: ["profiles", "meStats", range],
    queryFn: () => trpcQuery<MeStatsResult>(TRPC.profiles.meStats, { range }),
  });
  const stats = query.data;
  const pct = stats ? consistencyPct(stats.user_stats.secured_days, stats.user_stats.due_days) : null;
  const hour = stats ? usualHour(stats.user_stats.proof_hour_histogram) : null;
  const proofs = stats
    ? stats.user_stats.proofs_by_method.camera +
      stats.user_stats.proofs_by_method.self_reported +
      stats.user_stats.proofs_by_method.apple_health
    : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.seg}>
        {RANGES.map((item) => {
          const on = item.id === range;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={item.label}
              onPress={() => setRange(item.id)}
              style={[styles.segItem, on && styles.segOn]}
            >
              <Text style={[styles.segLabel, on && styles.segLabelOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {query.isPending ? <ActivityIndicator color={DS_V3.color.textSecondary} /> : null}
      {query.isError ? <Text style={styles.body}>Couldn’t load your data.</Text> : null}
      {stats ? (
        <>
          <Card title="Consistency">
            {pct == null ? (
              <Text style={styles.body}>
                {stats.user_stats.due_days === 0
                  ? EMPTY_STATS_COPY.due
                  : `${stats.user_stats.secured_days} of ${stats.user_stats.due_days} due days. Your percentage shows after 7 due days.`}
              </Text>
            ) : (
              <Text style={styles.pct}>{pct}%</Text>
            )}
          </Card>
          <Card title="Days">
            <Heat days={stats.day_secures} />
            <Text style={styles.secondary}>Secured, Missed, Held, Today, Not due</Text>
          </Card>
          <Card title="Streaks">
            <Text style={styles.body}>{stats.user_stats.current_streak}-day streak</Text>
            <Text style={styles.secondary}>
              Best {stats.user_stats.best_streak}
              {stats.user_stats.best_streak_start && stats.user_stats.best_streak_end
                ? ` · ${streakRange(stats.user_stats.best_streak_start, stats.user_stats.best_streak_end)}`
                : ""}
            </Text>
          </Card>
          <Card title="How you prove it">
            {proofs === 0 ? (
              <Text style={styles.body}>{EMPTY_STATS_COPY.proofs}</Text>
            ) : (
              <Text style={styles.body}>
                {`${stats.user_stats.proofs_by_method.camera} camera · ${stats.user_stats.proofs_by_method.self_reported} self-reported · ${stats.user_stats.proofs_by_method.apple_health} Apple Health`}
              </Text>
            )}
          </Card>
          <Card title="When you post">
            {hour == null ? (
              <Text style={styles.body}>{EMPTY_STATS_COPY.histogram}</Text>
            ) : (
              <>
                <Text style={styles.body}>{`Most often around ${hourLabel(hour).trim()}.`}</Text>
                <Histogram counts={stats.user_stats.proof_hour_histogram} />
              </>
            )}
          </Card>
          {stats.enrollments.map((row) => (
            <Card key={row.id} title={row.title}>
              <Bar secured={row.secured_days} due={row.due_days} />
              <Text style={styles.body}>{row.line}</Text>
            </Card>
          ))}
        </>
      ) : null}
    </View>
  );
}

function Heat({ days }: { days: { date: string; state: DayState }[] }) {
  const today = days[days.length - 1]?.date;
  return (
    <View style={styles.heat}>
      {days.map((day) => (
        <View
          key={day.date}
          accessibilityLabel={`${day.date} ${day.state}`}
          style={[styles.cell, heatStyle(day.state, day.date === today)]}
        />
      ))}
    </View>
  );
}

function heatStyle(state: DayState, today: boolean): object {
  if (state === "secured") {
    return {
      backgroundColor: DS_V3.color.textPrimary,
      borderWidth: today ? 2 : 0,
      borderColor: DS_V3.color.textTertiary,
    };
  }
  if (state === "held") {
    return { backgroundColor: DS_V3.color.raised, borderWidth: 1, borderColor: DS_V3.color.textTertiary };
  }
  if (state === "missed") {
    return { backgroundColor: "transparent", borderWidth: 1, borderColor: DS_V3.color.textSecondary };
  }
  return {
    backgroundColor: DS_V3.color.hairline,
    borderWidth: today ? 1 : 0,
    borderStyle: today ? ("dashed" as const) : ("solid" as const),
    borderColor: DS_V3.color.textTertiary,
  };
}

function Bar({ secured, due }: { secured: number; due: number }) {
  const pct = due > 0 ? Math.round((secured / due) * 100) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

function Histogram({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  return (
    <View style={styles.hist}>
      {counts.map((n, i) => (
        <View
          key={i}
          style={[styles.bar, { height: Math.max(2, Math.round((n / max) * 48)) }]}
        />
      ))}
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.lg, gap: DS_V3.space.md },
  seg: {
    flexDirection: "row",
    backgroundColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.pill,
    padding: 2,
  },
  segItem: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: DS_V3.radius.pill },
  segOn: { backgroundColor: DS_V3.color.selectedBg },
  segLabel: { color: DS_V3.color.textSecondary, fontSize: 15, fontWeight: "500" },
  segLabelOn: { color: DS_V3.color.selectedText },
  heat: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  cell: { width: 14, height: 14, borderRadius: 3 },
  track: { height: 6, borderRadius: 3, backgroundColor: DS_V3.color.hairline, overflow: "hidden" },
  fill: { height: 6, backgroundColor: DS_V3.color.textPrimary },
  hist: { flexDirection: "row", alignItems: "flex-end", height: 48, gap: 2 },
  bar: { flex: 1, backgroundColor: DS_V3.color.textPrimary, borderRadius: 1 },
  card: {
    paddingVertical: DS_V3.space.md,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_V3.color.hairline,
  },
  cardTitle: { color: DS_V3.color.textSecondary, fontSize: 13, fontWeight: "600" },
  pct: { color: DS_V3.color.textPrimary, fontSize: 40, fontWeight: "600" },
  body: { color: DS_V3.color.textPrimary, fontSize: 15, lineHeight: 20 },
  secondary: { color: DS_V3.color.textSecondary, fontSize: 15, lineHeight: 20 },
});
