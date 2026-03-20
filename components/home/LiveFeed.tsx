import React from "react";
import { View, Text, StyleSheet } from "react-native";

type FeedItem = {
  id: string;
  username: string;
  challengeName: string;
  action: "joined" | "completed";
  age: string;
};

const AVATAR_COLORS = ["#E8593C", "#5B7FD4", "#4CAF50", "#FF9800", "#9C27B0"];

export default function LiveFeed({ items }: { items: FeedItem[] }) {
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.left}><View style={s.dot} /><Text style={s.title}>Live</Text></View>
        <Text style={s.right}>People are moving</Text>
      </View>
      {items.length === 0 ? (
        <Text style={s.empty}>No activity yet. Be the first!</Text>
      ) : (
        items.map((it, idx) => (
          <View key={it.id} style={[s.row, idx < items.length - 1 && s.divider]}>
            <View style={[s.avatar, { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] ?? AVATAR_COLORS[0] }]}>
              <Text style={s.avatarText}>{(it.username[0] ?? "U").toUpperCase()}</Text>
            </View>
            <View style={s.mid}>
              <Text style={s.text}>
                {it.username} {it.action === "completed" ? "completed" : "joined"} <Text style={s.bold}>{it.challengeName}</Text>
              </Text>
            </View>
            <View style={s.ageWrap}>
              <View style={[s.actionDot, { backgroundColor: it.action === "joined" ? "#4CAF50" : "#E8593C" }]} />
              <Text style={s.age}>{it.age}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 12, marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 16, padding: 14 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  title: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  right: { fontSize: 11, color: "#999" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#F5F2EB" },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  mid: { flex: 1 },
  text: { fontSize: 12, color: "#444" },
  bold: { fontWeight: "700" },
  ageWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionDot: { width: 6, height: 6, borderRadius: 3 },
  age: { fontSize: 10, color: "#BBB" },
  empty: { textAlign: "center", padding: 16, fontSize: 12, color: "#999" },
});
