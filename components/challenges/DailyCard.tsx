import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WifiOff, Clock, Zap, Droplets, VolumeX, Smartphone, Heart, BookOpen } from "lucide-react-native";

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
  easy: { accent: "#4CAF50", tint: "#F0FAF2", label: "EASY" },
  medium: { accent: "#5B7FD4", tint: "#F0F4FF", label: "MED" },
  hard: { accent: "#E8593C", tint: "#FFF5F0", label: "HARD" },
  extreme: { accent: "#E8593C", tint: "#FFF5F0", label: "HARD" },
};
const DEFAULT_THEME = { accent: "#5B7FD4", tint: "#F0F4FF", label: "MED" };

export type DailyChallengeCardData = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  participants_count?: number;
};

export function DailyCard({
  challenge,
  onPress,
  onPressIn,
}: {
  challenge: DailyChallengeCardData;
  onPress: (id: string) => void;
  onPressIn?: () => void;
}) {
  const d = (challenge.difficulty ?? "medium").toLowerCase();
  const theme = DIFFICULTY_THEMES[d] ?? DEFAULT_THEME;
  const IconComp = ICONS[challenge.title] ?? Zap;
  const subtitle = DAILY_COPY[challenge.title] ?? (challenge.description ?? "").slice(0, 30);
  const count = challenge.participants_count ?? 0;
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPressIn={onPressIn} onPress={() => onPress(challenge.id)}>
      <View style={[s.stripe, { backgroundColor: theme.accent }]} />
      <View style={[s.tintBg, { backgroundColor: theme.tint }]} />
      <View style={s.topRow}>
        <View style={[s.iconBox, { backgroundColor: theme.accent }]}><IconComp size={12} color="#fff" /></View>
        <Text style={[s.diff, { color: theme.accent, backgroundColor: theme.tint }]}>{theme.label}</Text>
      </View>
      <Text style={s.title}>{challenge.title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
      <View style={s.bottom}>
        <Text style={s.meta}>{count > 0 ? `${count} doing it` : "New"}</Text>
        <Text style={[s.go, { color: theme.accent }]}>Go ›</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { width: 154, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 14, backgroundColor: "#fff", overflow: "hidden" },
  stripe: { position: "absolute", top: 0, left: 0, bottom: 0, width: 3 },
  tintBg: { position: "absolute", right: 0, bottom: 0, width: 100, height: 80, borderRadius: 16, opacity: 0.5 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  diff: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7 },
  title: { fontSize: 15, lineHeight: 18, fontWeight: "700", color: "#1A1A1A" },
  subtitle: { marginTop: 6, fontSize: 11, lineHeight: 15, color: "#999" },
  bottom: { marginTop: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 10, color: "#BBB" },
  go: { fontSize: 12, fontWeight: "700" },
});
