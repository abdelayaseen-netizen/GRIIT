import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type FeedItem = {
  id: string;
  username: string;
  challengeName: string;
  action: "joined" | "completed";
  age: string;
};

const AVATAR_COLORS = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.DISCOVER_BLUE,
  DS_COLORS.DISCOVER_GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CATEGORY_MIND,
];

export default function LiveFeed({ items }: { items: FeedItem[] }) {
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.left}>
          <View style={s.dot} />
          <Text style={s.title}>Live</Text>
        </View>
        <Text style={s.right}>People are moving</Text>
      </View>
      {items.length === 0 ? (
        <Text style={s.empty}>You&apos;re early — the first movers get remembered.</Text>
      ) : (
        items.map((it, idx) => (
          <View key={it.id} style={[s.row, idx < items.length - 1 && s.divider]}>
            <View style={[s.avatar, { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] ?? DS_COLORS.DISCOVER_CORAL }]}>
              <Text style={s.avatarText}>{(it.username[0] ?? "U").toUpperCase()}</Text>
            </View>
            <View style={s.mid}>
              <Text style={s.text}>
                {it.username} {it.action === "completed" ? "completed" : "joined"}{" "}
                <Text style={s.bold}>{it.challengeName}</Text>
              </Text>
            </View>
            <View style={s.ageWrap}>
              <View style={[s.actionDot, { backgroundColor: it.action === "joined" ? DS_COLORS.DISCOVER_GREEN : DS_COLORS.DISCOVER_CORAL }]} />
              <Text style={s.age}>{it.age}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginHorizontal: DS_SPACING.screenHorizontal,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: 14,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS_COLORS.DISCOVER_GREEN },
  title: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  right: { fontSize: 11, color: DS_COLORS.TEXT_MUTED },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: DS_COLORS.chipFill },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { color: DS_COLORS.TEXT_ON_DARK, fontSize: 11, fontWeight: "700" },
  mid: { flex: 1 },
  text: { fontSize: 12, color: DS_COLORS.grayDarker },
  bold: { fontWeight: "700" },
  ageWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionDot: { width: 6, height: 6, borderRadius: 3 },
  age: { fontSize: 10, color: DS_COLORS.TEXT_MUTED },
  empty: {
    textAlign: "center",
    padding: 16,
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
  },
});
