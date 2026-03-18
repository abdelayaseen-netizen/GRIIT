import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_SHADOWS } from "@/lib/design-system";

const TOP_BAR_COLORS = [DS_COLORS.ACCENT_PRIMARY, DS_COLORS.PURPLE_STRIPE, DS_COLORS.BLUE_STRIPE, DS_COLORS.ACCENT_GREEN] as const;

const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: DS_COLORS.DIFFICULTY_EASY_BG, text: DS_COLORS.DIFFICULTY_EASY_TEXT },
  Medium: { bg: DS_COLORS.DIFFICULTY_MEDIUM_BG, text: DS_COLORS.DIFFICULTY_MEDIUM_TEXT },
  Hard: { bg: DS_COLORS.DIFFICULTY_HARD_BG, text: DS_COLORS.DIFFICULTY_HARD_TEXT },
  Extreme: { bg: DS_COLORS.DIFFICULTY_EXTREME_BG, text: DS_COLORS.DIFFICULTY_EXTREME_TEXT },
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
  const topBarColor = p.stripeColor || TOP_BAR_COLORS[(p.index ?? 0) % 4];
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
      <View style={[s.diffPillAbsolute, { backgroundColor: diff.bg }]}>
        <Text style={[s.diffText, { color: diff.text }]}>{p.difficulty.toUpperCase()}</Text>
      </View>
      <View style={s.body}>
        <View style={s.topRow}>
          <View style={s.countdownPill}>
            <Clock size={10} color={DS_COLORS.TIMER_TEXT} />
            <Text style={s.countdownText}>{countdown}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">{p.title}</Text>
        <Text style={s.desc} numberOfLines={1} ellipsizeMode="tail">{p.description}</Text>
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
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER_CARD,
    ...DS_SHADOWS.card,
  },
  topBar: {
    height: 3,
    width: "100%",
  },
  body: {
    padding: DS_SPACING.BASE,
    minWidth: 0,
  },
  diffPillAbsolute: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    paddingHorizontal: DS_SPACING.SM,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DS_SPACING.SM,
  },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: DS_SPACING.SM,
    paddingVertical: DS_SPACING.XS,
    borderRadius: 10,
    backgroundColor: DS_COLORS.TIMER_BG,
  },
  countdownText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.TIMER_TEXT },
  diffPill: { paddingHorizontal: DS_SPACING.SM, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 6 },
  desc: { fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 20, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    paddingHorizontal: 12,
    paddingVertical: DS_SPACING.SM,
    borderRadius: DS_RADIUS.PILL,
  },
  taskChipText: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY, maxWidth: 90 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  participants: { flexDirection: "row", alignItems: "center", gap: 4 },
  participantsEmoji: { fontSize: 12 },
  participantsText: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  chevron: { fontSize: 16, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },
});
