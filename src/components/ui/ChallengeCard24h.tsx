import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, ChevronRight, Clock } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

const TOP_BAR_COLORS = ["#E85D4A", "#8B5CF6", "#3B82F6", "#14B8A6"] as const;

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#DCFCE7", text: "#16A34A" },
  Medium: { bg: "#FEF9C3", text: "#CA8A04" },
  Hard: { bg: "#FEE2E2", text: "#DC2626" },
  Extreme: { bg: "#FEE2E2", text: "#991B1B" },
};

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

function getTaskEmoji(icon: string): string {
  const map: Record<string, string> = {
    timer: "⏱",
    photo: "📸",
    journal: "📝",
    run: "🏃",
    checkin: "📍",
    manual: "✓",
  };
  return map[icon] ?? "•";
}

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
  cardWidth?: number;
  index?: number;
}) {
  const countdownFromHook = useCountdown(p.endsAt ?? null);
  const countdown = p.endsAt != null ? countdownFromHook : (p.countdownText ?? "--:--:--");
  const diff = DIFF_STYLES[p.difficulty] ?? DIFF_STYLES.Medium;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const { colors: themeColors } = useTheme();
  const topBarColor = TOP_BAR_COLORS[(p.index ?? 0) % 4];
  const cardWidth = p.cardWidth ?? 280;
  return (
    <TouchableOpacity
      style={[s.card, { width: cardWidth, backgroundColor: themeColors.card }]}
      onPress={p.onPress}
      activeOpacity={0.85}
      accessibilityLabel={`24 hour challenge: ${p.title}, ${p.participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={[s.topBar, { backgroundColor: topBarColor }]} />
      <View style={s.body}>
        <View style={s.topRow}>
          <View style={s.countdownPill}>
            <Clock size={10} color="#DC2626" />
            <Text style={s.countdownText}>{countdown}</Text>
          </View>
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{p.difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1}>{p.title}</Text>
        <Text style={s.desc} numberOfLines={1}>{p.description}</Text>
        <View style={s.chipsRow}>
          {p.tasksPreview.slice(0, 2).map((task, i) => (
            <View key={i} style={s.taskChip}>
              <Text style={s.taskChipText} numberOfLines={1}>{getTaskEmoji(task.icon)} {task.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.footer}>
          <View style={s.participants}>
            <Text style={s.participantsEmoji}>👥</Text>
            <Text style={s.participantsText}>{fmt(p.participantsCount)}</Text>
          </View>
          <Text style={s.chevron}>&gt;</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ChallengeCard24h = React.memo(ChallengeCard24hInner);

const s = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topBar: {
    height: 5,
    width: "100%",
  },
  body: {
    padding: 16,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  countdownText: { fontSize: 11, fontWeight: "700", color: "#DC2626" },
  diffPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: "#2D3A2E", marginBottom: 6 },
  desc: { fontSize: 14, color: "#7A7A6D", lineHeight: 20, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  taskChipText: { fontSize: 12, fontWeight: "500", color: "#7A7A6D", maxWidth: 100 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  participants: { flexDirection: "row", alignItems: "center", gap: 4 },
  participantsEmoji: { fontSize: 12 },
  participantsText: { fontSize: 12, fontWeight: "500", color: "#7A7A6D" },
  chevron: { fontSize: 16, fontWeight: "600", color: "#7A7A6D" },
});
