import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WifiOff, Clock, Zap, Droplets, VolumeX, Smartphone, Heart, BookOpen, Check } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

const DAILY_COPY: Record<string, string> = {
  "No Social Media": "Can you go 24 hours?",
  "5AM Wake Up": "Set the alarm. No snooze.",
  "10K Steps": "Just walk. That's it.",
  "Cold Shower Only": "Embrace the cold.",
  "No Complaining": "Not one complaint. All day.",
  "Digital Detox": "Screens off after 8PM.",
  "Gratitude Blitz": "10 things. Right now.",
  "Reading Marathon": "2 hours. No phone.",
};

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  "No Social Media": WifiOff,
  "5AM Wake Up": Clock,
  "10K Steps": Zap,
  "Cold Shower Only": Droplets,
  "No Complaining": VolumeX,
  "Digital Detox": Smartphone,
  "Gratitude Blitz": Heart,
  "Reading Marathon": BookOpen,
};

const DIFFICULTY_THEMES: Record<string, { accent: string; tint: string; label: string }> = {
  easy: { accent: DS_COLORS.DISCOVER_GREEN, tint: DS_COLORS.DISCOVER_DIFF_TINT_EASY, label: "EASY" },
  medium: { accent: DS_COLORS.DISCOVER_BLUE, tint: DS_COLORS.DISCOVER_DIFF_TINT_MED, label: "MED" },
  hard: { accent: DS_COLORS.DISCOVER_CORAL, tint: DS_COLORS.DISCOVER_DIFF_TINT_HARD, label: "HARD" },
  extreme: { accent: DS_COLORS.DISCOVER_CORAL, tint: DS_COLORS.DISCOVER_DIFF_TINT_HARD, label: "HARD" },
};
const DEFAULT_THEME = { accent: DS_COLORS.DISCOVER_BLUE, tint: DS_COLORS.DISCOVER_DIFF_TINT_MED, label: "MED" };

export type DailyChallengeCardData = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  participants_count?: number;
};

export type DailyParticipationState = "available" | "active" | "completed";

export const DailyCard = React.memo(function DailyCard({
  challenge,
  onPress,
  onPressIn,
  participationState = "available",
}: {
  challenge: DailyChallengeCardData;
  onPress: (id: string) => void;
  onPressIn?: () => void;
  participationState?: DailyParticipationState;
}) {
  const d = (challenge.difficulty ?? "medium").toLowerCase();
  const theme = DIFFICULTY_THEMES[d] ?? DEFAULT_THEME;
  const IconComp = ICONS[challenge.title] ?? Zap;
  const subtitle = DAILY_COPY[challenge.title] ?? (challenge.description ?? "").slice(0, 30);
  const count = challenge.participants_count ?? 0;
  const dimmed = participationState === "completed";
  const stateLabel =
    participationState === "completed" ? "completed" : participationState === "active" ? "in progress" : "available";
  return (
    <TouchableOpacity
      style={[s.card, dimmed && s.cardDimmed]}
      activeOpacity={0.85}
      onPressIn={onPressIn}
      onPress={() => onPress(challenge.id)}
      accessibilityRole="button"
      accessibilityLabel={`${challenge.title}, ${count} participants, ${stateLabel}. Tap to view challenge.`}
    >
      <View style={[s.stripe, { backgroundColor: theme.accent }]} />
      {participationState === "active" ? (
        <View style={[s.stateBadge, { backgroundColor: DS_COLORS.ACCENT_TINT }]}>
          <Text style={[s.stateBadgeText, { color: DS_COLORS.ACCENT_PRIMARY }]}>In progress</Text>
        </View>
      ) : participationState === "completed" ? (
        <View style={[s.stateBadge, { backgroundColor: DS_COLORS.GREEN_BG }]}>
          <Check size={11} color={DS_COLORS.GREEN} />
          <Text style={[s.stateBadgeText, { color: DS_COLORS.GREEN, marginLeft: 4 }]}>Done</Text>
        </View>
      ) : null}
      <View style={s.cardInner}>
        <View style={s.mainBlock}>
          <View style={s.topRow}>
            <View style={[s.iconBox, { backgroundColor: theme.accent }]}>
              <IconComp size={12} color={DS_COLORS.WHITE} />
            </View>
            <Text style={[s.diff, { color: theme.accent, backgroundColor: theme.tint }]}>{theme.label}</Text>
          </View>
          <Text style={s.title} numberOfLines={2}>
            {challenge.title}
          </Text>
          <Text style={s.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <View style={s.bottom}>
          <Text style={s.meta}>{count > 0 ? `${count} doing it` : "New"}</Text>
          {participationState === "available" ? (
            <Text style={[s.go, { color: theme.accent }]}>Go ›</Text>
          ) : participationState === "active" ? (
            <Text style={[s.go, { color: DS_COLORS.ACCENT_PRIMARY }]}>Continue ›</Text>
          ) : (
            <Text style={[s.go, { color: DS_COLORS.TEXT_MUTED }]}>View ›</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const CARD_HEIGHT = 156;

const s = StyleSheet.create({
  card: {
    width: 154,
    height: CARD_HEIGHT,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: DS_COLORS.WHITE,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    marginLeft: 5,
    justifyContent: "space-between",
  },
  mainBlock: {
    flexShrink: 1,
  },
  cardDimmed: { opacity: 0.88 },
  stripe: { position: "absolute", top: 0, left: 0, bottom: 0, width: 3 },
  stateBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  stateBadgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.2 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  iconBox: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  diff: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7 },
  title: { fontSize: 15, lineHeight: 18, fontWeight: "700", color: DS_COLORS.DISCOVER_INK },
  subtitle: { marginTop: 4, fontSize: 11, lineHeight: 15, color: DS_COLORS.TEXT_MUTED },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 0,
  },
  meta: { fontSize: 10, color: DS_COLORS.DISCOVER_META_SILVER },
  go: { fontSize: 12, fontWeight: "700" },
});
