import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, ChevronRight, Clock } from "lucide-react-native";
import * as t from "@/src/theme/tokens";

function useCountdown(endsAt: string | null): string {
  const [text, setText] = useState(() => formatCountdown(endsAt));
  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => setText(formatCountdown(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  return text;
}
function formatCountdown(endsAt: string | null): string {
  if (!endsAt) return "--:--:--";
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: t.colors.badgeGreenBg, text: t.colors.badgeGreenText },
  Medium: { bg: t.colors.badgeOrangeBg, text: t.colors.badgeOrangeText },
  Hard: { bg: t.colors.badgeRedBg, text: t.colors.badgeRedText },
  Extreme: { bg: t.colors.badgeRedBg, text: t.colors.badgeRedText },
};

export function ChallengeCard24h(p: {
  title: string;
  description: string;
  countdownText?: string;
  endsAt?: string | null;
  difficulty: string;
  stripeColor: string;
  tasksPreview: { icon: string; label: string }[];
  participantsCount: number;
  onPress: () => void;
}) {
  const countdown = p.endsAt != null ? useCountdown(p.endsAt) : (p.countdownText ?? "--:--:--");
  const diff = DIFF_STYLES[p.difficulty] ?? DIFF_STYLES.Medium;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return (
    <TouchableOpacity style={s.card} onPress={p.onPress} activeOpacity={0.85}>
      <View style={[s.stripe, { backgroundColor: p.stripeColor }]} />
      <View style={s.body}>
        <View style={s.topRow}>
          <View style={s.countdownPill}>
            <Clock size={10} color={t.colors.badgeRedText} />
            <Text style={s.countdownText}>{countdown}</Text>
          </View>
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{p.difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1}>{p.title}</Text>
        <Text style={s.desc} numberOfLines={2}>{p.description}</Text>
        <View style={s.chipsRow}>
          {p.tasksPreview.slice(0, 2).map((task, i) => (
            <View key={i} style={s.taskChip}>
              <Text style={s.taskChipText} numberOfLines={1}>{task.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.footer}>
          <View style={s.participants}>
            <Users size={12} color={t.colors.textSecondary} />
            <Text style={s.participantsText}>{fmt(p.participantsCount)}</Text>
          </View>
          <View style={s.arrowWrap}>
            <ChevronRight size={t.iconSizes.arrowButton} color={t.colors.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: t.measures.dailyCardWidth,
    flexDirection: "row",
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.card,
    overflow: "hidden",
    ...t.borders.card,
    ...t.shadows.card,
  },
  stripe: { width: t.measures.stripeWidth, alignSelf: "stretch" },
  body: { flex: 1, padding: t.spacing.cardPadding, minWidth: 0 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing.sm },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: t.colors.badgeRedBg,
  },
  countdownText: { fontSize: 11, fontWeight: "700", color: t.colors.badgeRedText },
  diffPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: t.typography.badgeLabel.fontSize, fontWeight: t.typography.badgeLabel.fontWeight },
  title: { fontSize: t.typography.cardTitle.fontSize, fontWeight: t.typography.cardTitle.fontWeight, color: t.colors.textPrimary, marginBottom: 6 },
  desc: { fontSize: t.typography.cardDescription.fontSize, color: t.colors.textSecondary, lineHeight: 22, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: t.colors.chipFill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  taskChipText: { fontSize: 12, fontWeight: "500", color: t.colors.textSecondary, maxWidth: 100 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  participants: { flexDirection: "row", alignItems: "center", gap: 4 },
  participantsText: { fontSize: 12, fontWeight: "500", color: t.colors.textSecondary },
  arrowWrap: {
    width: t.radius.iconButton * 2,
    height: t.radius.iconButton * 2,
    borderRadius: t.radius.iconButton,
    backgroundColor: t.colors.chipFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
