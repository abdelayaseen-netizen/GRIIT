import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronRight, Target } from "lucide-react-native";

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
        <View style={s.empty}><Text style={s.emptyBody}>Loading...</Text></View>
      ) : items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No active challenges yet.</Text>
          <Text style={s.emptyBody}>Find one that pushes you.</Text>
          <Pressable onPress={onPressBrowse}><Text style={s.emptyLink}>Browse challenges →</Text></Pressable>
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
              <View style={s.iconBox}><Target size={16} color="#2E7D32" /></View>
              <View style={s.mid}>
                <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                <Text style={s.sub}>{`Day ${item.currentDay} of ${item.durationDays} · ${item.progressPercent}% progress`}</Text>
              </View>
              <ChevronRight size={14} color="#CCC" />
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
  header: { fontSize: 13, fontWeight: "700", color: "#1A1A1A", paddingHorizontal: 24, marginBottom: 10 },
  card: { marginHorizontal: 24, marginBottom: 10, backgroundColor: "#fff", borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: "#4CAF50" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { width: 36, height: 36, backgroundColor: "#E8F5E9", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  sub: { marginTop: 2, fontSize: 11, color: "#999" },
  track: { marginTop: 10, height: 4, backgroundColor: "#F0EDE6", borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, backgroundColor: "#4CAF50", borderRadius: 2 },
  empty: { marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 14, padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 13, fontWeight: "600", color: "#1A1A1A", textAlign: "center" },
  emptyBody: { marginTop: 6, fontSize: 12, color: "#999", textAlign: "center" },
  emptyLink: { marginTop: 10, fontSize: 13, fontWeight: "600", color: "#E8593C" },
});
