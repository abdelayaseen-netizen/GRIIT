import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BookOpen, Zap, Bell, Flame, Target } from "lucide-react-native";

const ICONS = [BookOpen, Zap, Bell, Flame, Target];
const BG = ["#3A1A10", "#1A2940", "#1B3A1B", "#2A1A3A", "#3A2A10"];
const FG = ["#E8593C", "#5B7FD4", "#4CAF50", "#9C27B0", "#FF9800"];

function difficultyTheme(d?: string) {
  const key = (d ?? "medium").toLowerCase();
  if (key === "easy") return { accent: "#4CAF50", tint: "#F0FAF2", label: "Easy" };
  if (key === "hard" || key === "extreme") return { accent: "#E8593C", tint: "#FFF5F0", label: "Hard" };
  return { accent: "#5B7FD4", tint: "#F0F4FF", label: "Med" };
}

export type PopularChallengeData = {
  id: string;
  title: string;
  difficulty?: string;
  duration_days?: number;
  participants_count?: number;
};

export function PopularChallengeRow({
  challenge,
  index,
  isLast,
  onPress,
}: {
  challenge: PopularChallengeData;
  index: number;
  isLast: boolean;
  onPress: (id: string) => void;
}) {
  const IconComp = ICONS[index % ICONS.length] ?? Target;
  const bg = BG[index % BG.length] ?? BG[0];
  const fg = FG[index % FG.length] ?? FG[0];
  const theme = difficultyTheme(challenge.difficulty);
  const days = challenge.duration_days ?? 14;
  const members = challenge.participants_count ?? 0;
  return (
    <View style={[s.row, !isLast && s.divider]}>
      <View style={[s.iconBox, { backgroundColor: bg }]}><IconComp size={16} color={fg} /></View>
      <View style={s.mid}>
        <Text style={s.title}>{challenge.title}</Text>
        <View style={s.metaRow}>
          <Text style={[s.diff, { color: theme.accent, backgroundColor: theme.tint }]}>{theme.label}</Text>
          <Text style={s.meta}>{days} days</Text>
          <Text style={s.meta}>{members} in</Text>
        </View>
      </View>
      <TouchableOpacity style={s.join} onPress={() => onPress(challenge.id)} activeOpacity={0.86}>
        <Text style={s.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 14, paddingHorizontal: 16, gap: 12, flexDirection: "row", alignItems: "center" },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#F5F2EB" },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  diff: { fontSize: 10, fontWeight: "600", borderRadius: 6, paddingVertical: 1, paddingHorizontal: 6 },
  meta: { fontSize: 11, color: "#BBB" },
  join: { borderRadius: 20, backgroundColor: "#E8593C", paddingVertical: 6, paddingHorizontal: 14 },
  joinText: { fontSize: 11, fontWeight: "700", color: "#fff" },
});
