import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronRight, Target } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

export type ActiveChallengeItem = {
  id: string;
  challengeId?: string;
  title: string;
  currentDay: number;
  durationDays: number;
  progressPercent: number;
};

type Props = {
  items: ActiveChallengeItem[];
  isLoading?: boolean;
  onPressItem: (challengeId: string) => void;
  onPressBrowse: () => void;
};

export default function ActiveChallengeCard({ items, isLoading, onPressItem, onPressBrowse }: Props) {
  const hasMany = items.length > 1;
  return (
    <View style={s.wrap}>
      <Text style={s.header}>{hasMany ? "Active challenges" : "Active challenge"}</Text>
      {isLoading ? (
        <View style={s.empty}>
          <Text style={s.emptyBody}>Loading...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No active challenges yet.</Text>
          <Text style={s.emptyBody}>Find one that pushes you.</Text>
          <Pressable onPress={onPressBrowse}>
            <Text style={s.emptyLink}>Browse challenges →</Text>
          </Pressable>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={s.card}
            onPress={() => item.challengeId && onPressItem(item.challengeId)}
            disabled={!item.challengeId}
          >
            <View style={s.row}>
              <View style={s.iconBox}>
                <Target size={16} color={DS_COLORS.TEAM_CARD_ICON_GREEN} />
              </View>
              <View style={s.mid}>
                <Text style={s.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={s.sub}>{`Day ${item.currentDay} of ${item.durationDays} · ${item.progressPercent}% progress`}</Text>
              </View>
              <ChevronRight size={14} color={DS_COLORS.CHEVRON_MUTED} />
            </View>
            <View style={s.track}>
              <View style={[s.fill, { width: `${Math.max(2, Math.min(100, item.progressPercent))}%` }]} />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: { fontSize: 13, fontWeight: "700", color: DS_COLORS.DISCOVER_INK, paddingHorizontal: 24, marginBottom: 10 },
  card: {
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.DISCOVER_GREEN,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 36,
    height: 36,
    backgroundColor: DS_COLORS.TEAM_CARD_ICON_BG_DUO,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: DS_COLORS.DISCOVER_INK },
  sub: { marginTop: 2, fontSize: 11, color: DS_COLORS.TEXT_MUTED },
  track: {
    marginTop: 10,
    height: 4,
    backgroundColor: DS_COLORS.PROGRESS_TRACK_WARM,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: { height: 4, backgroundColor: DS_COLORS.DISCOVER_GREEN, borderRadius: 2 },
  empty: { marginHorizontal: 24, backgroundColor: DS_COLORS.WHITE, borderRadius: 14, padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 13, fontWeight: "600", color: DS_COLORS.DISCOVER_INK, textAlign: "center" },
  emptyBody: { marginTop: 6, fontSize: 12, color: DS_COLORS.TEXT_MUTED, textAlign: "center" },
  emptyLink: { marginTop: 10, fontSize: 13, fontWeight: "600", color: DS_COLORS.DISCOVER_CORAL },
});
