import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Users } from "lucide-react-native";

const TEAM_COPY: Record<string, string> = {
  "Accountability Duo": "You pick one person. You both check in every single day. Miss a day? You both restart.",
  "Gym Buddy Challenge": "No solo gym sessions. Your partner keeps you honest.",
  "Run Club": "1 mile minimum. Every day. Your squad sees if you skip. You won't want to.",
  "Morning Crew": "6AM alarm. Together. The group chat holds you accountable.",
  "Study Group Sprint": "2 hours of focus. Your squad reports in. No hiding.",
  "No Junk Food Pact": "Clean eating. Meal photos required. Your crew judges.",
  "Prayer Group": "Daily prayer. Daily reflection. Shared with your circle.",
  "Fitness Squad": "Full workout. Every day. 30 days. No mercy.",
};

export type TeamChallengeCardData = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  duration_days?: number;
  team_size?: number;
  participants_count?: number;
};

function difficultyTheme(d?: string) {
  const key = (d ?? "medium").toLowerCase();
  if (key === "easy") return { accent: "#4CAF50", tint: "#F0FAF2", label: "EASY" };
  if (key === "hard" || key === "extreme") return { accent: "#E8593C", tint: "#FFF5F0", label: "HARD" };
  return { accent: "#5B7FD4", tint: "#F0F4FF", label: "MED" };
}

export function TeamChallengeCard({
  challenge,
  onPress,
  onPressIn,
}: {
  challenge: TeamChallengeCardData;
  onPress: (id: string) => void;
  onPressIn?: () => void;
}) {
  const size = challenge.team_size ?? 2;
  const isDuo = size <= 2;
  const iconBg = isDuo ? "#E8F5E9" : "#FFF3ED";
  const iconColor = isDuo ? "#2E7D32" : "#D4532A";
  const subtitleColor = isDuo ? "#4CAF50" : "#E8593C";
  const sizeLabel = isDuo ? "2 people" : size <= 4 ? "3-4 people" : "4+ people";
  const duration = challenge.duration_days ?? 14;
  const theme = difficultyTheme(challenge.difficulty);
  const teamsActive = Math.max(1, Math.floor((challenge.participants_count ?? 0) / Math.max(size, 1)));
  const cta = isDuo ? "Find a partner ›" : "Build a squad ›";
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.86} onPressIn={onPressIn} onPress={() => onPress(challenge.id)}>
      <View style={s.topRow}>
        <View style={s.leftRow}>
          <View style={[s.iconBox, { backgroundColor: iconBg }]}><Users size={18} color={iconColor} /></View>
          <View>
            <Text style={s.title}>{challenge.title}</Text>
            <Text style={[s.subtitle, { color: subtitleColor }]}>{sizeLabel} · {duration} days</Text>
          </View>
        </View>
        <Text style={[s.diff, { color: theme.accent, backgroundColor: theme.tint }]}>{theme.label}</Text>
      </View>
      <Text style={s.desc}>{TEAM_COPY[challenge.title] ?? challenge.description ?? "Build momentum together. Show up daily and hold each other accountable."}</Text>
      <View style={s.bottom}>
        <View style={s.activeWrap}>
          <View style={[s.mini, { backgroundColor: "#E8593C" }]} />
          <View style={[s.mini, s.ov, { backgroundColor: "#5B7FD4" }]} />
          <View style={[s.mini, s.ov, { backgroundColor: "#4CAF50" }]} />
          <Text style={s.activeText}>{teamsActive} {isDuo ? "duos" : "squads"} active</Text>
        </View>
        <Text style={s.cta}>{cta}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  subtitle: { marginTop: 2, fontSize: 11, fontWeight: "600" },
  diff: { fontSize: 10, fontWeight: "700", borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7, letterSpacing: 0.3 },
  desc: { marginTop: 10, marginLeft: 48, fontSize: 12, color: "#777", lineHeight: 17 },
  bottom: { marginTop: 12, marginLeft: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activeWrap: { flexDirection: "row", alignItems: "center" },
  mini: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: "#fff" },
  ov: { marginLeft: -5 },
  activeText: { marginLeft: 6, fontSize: 10, color: "#BBB" },
  cta: { fontSize: 13, fontWeight: "700", color: "#E8593C" },
});
