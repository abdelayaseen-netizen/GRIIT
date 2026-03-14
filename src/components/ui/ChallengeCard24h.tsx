import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, ChevronRight, Clock } from "lucide-react-native";
import * as t from "@/src/theme/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

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
  Easy: { bg: DS_COLORS.featuredLabelBg, text: DS_COLORS.featuredLabelText },
  Medium: { bg: DS_COLORS.difficultyMediumBg, text: DS_COLORS.difficultyMediumText },
  Hard: { bg: DS_COLORS.difficultyHardBg, text: DS_COLORS.difficultyHardText },
  Extreme: { bg: DS_COLORS.difficultyExtremeBg, text: DS_COLORS.difficultyExtremeText },
};

function ChallengeCard24hInner(p: {
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
  const countdownFromHook = useCountdown(p.endsAt ?? null);
  const countdown = p.endsAt != null ? countdownFromHook : (p.countdownText ?? "--:--:--");
  const diff = DIFF_STYLES[p.difficulty] ?? DIFF_STYLES.Medium;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const { colors: themeColors } = useTheme();
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: themeColors.card }]}
      onPress={p.onPress}
      activeOpacity={0.85}
      accessibilityLabel={`24 hour challenge: ${p.title}, ${p.participantsCount} participants`}
      accessibilityRole="button"
    >
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

export const ChallengeCard24h = React.memo(ChallengeCard24hInner);

const s = StyleSheet.create({
  card: {
    width: t.measures.dailyCardWidth,
    flexDirection: "row",
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stripe: { width: 4, alignSelf: "stretch" },
  body: { flex: 1, padding: 16, minWidth: 0 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: DS_COLORS.difficultyHardBg,
  },
  countdownText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.difficultyHardText },
  diffPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 6 },
  desc: { fontSize: 14, color: DS_COLORS.inputPlaceholder, lineHeight: 22, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: DS_COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  taskChipText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.inputPlaceholder, maxWidth: 100 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  participants: { flexDirection: "row", alignItems: "center", gap: 4 },
  participantsText: { fontSize: 12, fontWeight: "500", color: DS_COLORS.inputPlaceholder },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
