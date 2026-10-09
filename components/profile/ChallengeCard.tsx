import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import { stripSegments, type Seg } from "@/lib/challenge-card";
import { formatOfDays } from "@/lib/format-days";

export function ProgressStrip({
  days,
  secured,
  due,
}: {
  days: Seg[];
  secured?: number;
  due?: number;
}) {
  const shown = stripSegments(days);
  const label = secured != null && due ? formatOfDays(secured, due) : null;
  return (
    <View style={styles.strip} accessibilityLabel={label ? `${label} secured` : undefined}>
      <View style={styles.bars}>
        {shown.map((d, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              {
                backgroundColor:
                  d === "secured"
                    ? DS_V3.color.textPrimary
                    : d === "held"
                      ? DS_V3.color.textSecondary
                      : d === "future"
                        ? DS_V3.color.border
                        : "transparent",
                borderWidth: d === "missed" ? 1 : d === "today" ? 1.5 : 0,
                borderColor: d === "today" ? DS_V3.color.textPrimary : DS_V3.color.textSecondary,
              },
            ]}
          />
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

export type ChallengeCardProps = {
  title: string;
  status: "active" | "completed" | "abandoned" | "failed";
  line: string;
  todayChip?: string;
  days: Seg[];
  secured?: number;
  due?: number;
  members?: { userId: string; displayName: string; avatarUrl?: string | null }[];
  memberCount?: number;
  onPress: () => void;
};

export function ChallengeCard(p: ChallengeCardProps) {
  return (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${p.title} challenge`}
      style={styles.card}
    >
      <View style={styles.head}>
        <Text style={styles.title} numberOfLines={1}>
          {p.title}
        </Text>
        {p.todayChip ? (
          <View style={styles.chip}>
            <Text style={styles.chipTxt}>{p.todayChip}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.line}>{p.line}</Text>
        {p.members?.length ? (
          <>
            <View style={styles.faces}>
              {p.members.slice(0, 3).map((m, i) => (
                <View key={m.userId} style={[styles.face, i ? { marginLeft: -8 } : null]}>
                  <Avatar userId={m.userId} uri={m.avatarUrl} displayName={m.displayName} size={24} />
                </View>
              ))}
            </View>
            <Text style={styles.count}>{p.memberCount} of 10</Text>
          </>
        ) : null}
      </View>
      <ProgressStrip
        days={p.days}
        secured={p.status === "active" ? p.secured : undefined}
        due={p.status === "active" ? p.due : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
    padding: 14,
    gap: 8,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  chip: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: DS_V3.color.raised,
    justifyContent: "center",
  },
  chipTxt: { ...DS_V3.type.caption, fontWeight: "500", color: DS_V3.color.textPrimary },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  line: { flex: 1, ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  faces: { flexDirection: "row" },
  face: { borderWidth: 2, borderColor: DS_V3.color.surface, borderRadius: 999 },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  strip: { flexDirection: "row", alignItems: "center", gap: 10 },
  bars: { flex: 1, flexDirection: "row", gap: 3, height: 8 },
  seg: { flex: 1, borderRadius: 2 },
  label: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
