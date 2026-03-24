import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BookOpen, Zap, Bell, Flame, Target } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

const ICONS = [BookOpen, Zap, Bell, Flame, Target];
const BG = [
  DS_COLORS.DISCOVER_STRIPE_WARM,
  DS_COLORS.DISCOVER_STRIPE_COOL,
  DS_COLORS.DISCOVER_STRIPE_GREEN,
  DS_COLORS.DISCOVER_STRIPE_PURPLE,
  DS_COLORS.DISCOVER_STRIPE_AMBER,
];
const FG = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.DISCOVER_BLUE,
  DS_COLORS.DISCOVER_GREEN,
  DS_COLORS.DISCOVER_ACCENT_PURPLE,
  DS_COLORS.DISCOVER_ACCENT_ORANGE,
];

function difficultyTheme(d?: string) {
  const key = (d ?? "medium").toLowerCase();
  if (key === "easy")
    return { accent: DS_COLORS.DISCOVER_GREEN, tint: DS_COLORS.DISCOVER_DIFF_TINT_EASY, label: "Easy" };
  if (key === "hard" || key === "extreme")
    return { accent: DS_COLORS.DISCOVER_CORAL, tint: DS_COLORS.DISCOVER_DIFF_TINT_HARD, label: "Hard" };
  return { accent: DS_COLORS.DISCOVER_BLUE, tint: DS_COLORS.DISCOVER_DIFF_TINT_MED, label: "Med" };
}

export type PopularChallengeData = {
  id: string;
  title: string;
  difficulty?: string;
  duration_days?: number;
  participants_count?: number;
};

export const PopularChallengeRow = React.memo(function PopularChallengeRow({
  challenge,
  index,
  isLast,
  onPress,
  onPressIn,
}: {
  challenge: PopularChallengeData;
  index: number;
  isLast: boolean;
  onPress: (id: string) => void;
  onPressIn?: () => void;
}) {
  const IconComp = ICONS[index % ICONS.length] ?? Target;
  const bg = BG[index % BG.length] ?? BG[0];
  const fg = FG[index % FG.length] ?? FG[0];
  const theme = difficultyTheme(challenge.difficulty);
  const days = challenge.duration_days ?? 14;
  const members = challenge.participants_count ?? 0;
  return (
    <View style={[s.row, !isLast && s.divider]}>
      <View style={[s.iconBox, { backgroundColor: bg }]}>
        <IconComp size={16} color={fg} />
      </View>
      <View style={s.mid}>
        <Text style={s.title}>{challenge.title}</Text>
        <View style={s.metaRow}>
          <Text style={[s.diff, { color: theme.accent, backgroundColor: theme.tint }]}>{theme.label}</Text>
          <Text style={s.meta}>{days} days</Text>
          <Text style={s.meta}>{members} in</Text>
        </View>
      </View>
      <TouchableOpacity
        style={s.join}
        onPressIn={onPressIn}
        onPress={() => onPress(challenge.id)}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel={`Join ${challenge.title}`}
      >
        <Text style={s.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  row: { paddingVertical: 14, paddingHorizontal: 16, gap: 12, flexDirection: "row", alignItems: "center" },
  divider: { borderBottomWidth: 0.5, borderBottomColor: DS_COLORS.DISCOVER_DIVIDER },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: DS_COLORS.DISCOVER_INK },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  diff: { fontSize: 10, fontWeight: "600", borderRadius: 6, paddingVertical: 1, paddingHorizontal: 6 },
  meta: { fontSize: 11, color: DS_COLORS.DISCOVER_META_SILVER },
  join: { borderRadius: 20, backgroundColor: DS_COLORS.DISCOVER_CORAL, paddingVertical: 6, paddingHorizontal: 14 },
  joinText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.WHITE },
});
