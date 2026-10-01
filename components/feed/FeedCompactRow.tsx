import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, MessageCircle, Users } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";

export function FeedCompactRow(p: {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  ago: string;
  task: string;
  dayN: number;
  dayOf: number;
  challenge: string;
  gateLine: string;
  respects: number;
  respected: boolean;
  comments: number;
  onProfile: () => void;
  onChallenge: () => void;
  onRespect: () => void;
  onComments: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={p.onProfile} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${p.displayName} profile`}>
        <Avatar userId={p.userId} uri={p.avatarUrl} displayName={p.displayName} username={p.username} size={32} />
      </Pressable>
      <View style={styles.body}>
        <View style={styles.head}>
          <Text onPress={p.onProfile} style={styles.name}>
            {p.displayName}
          </Text>
          <Text style={styles.ago}>{p.ago}</Text>
        </View>
        <Text style={styles.line}>
          completed {p.task} · Day {p.dayN} of {p.dayOf}
        </Text>
        <Text onPress={p.onChallenge} style={styles.meta}>
          {p.challenge} · {p.gateLine}
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={p.onRespect} hitSlop={8} style={styles.act} accessibilityRole="button" accessibilityLabel="Respect">
            <Heart
              size={18}
              color={p.respected ? DS_V3.color.brand : DS_V3.color.textSecondary}
              fill={p.respected ? DS_V3.color.brand : "transparent"}
            />
            <Text style={[styles.count, p.respected ? styles.countOn : null]}>{p.respects}</Text>
          </Pressable>
          <Pressable onPress={p.onComments} hitSlop={8} style={styles.act} accessibilityRole="button" accessibilityLabel="Comment">
            <MessageCircle size={18} color={DS_V3.color.textSecondary} />
            <Text style={styles.count}>{p.comments}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function FeedJoinLine({ text, ago }: { text: string; ago: string }) {
  return (
    <View style={styles.join}>
      <Users size={18} color={DS_V3.color.textSecondary} />
      <Text numberOfLines={2} style={styles.joinText}>
        {text}
      </Text>
      <Text style={styles.ago}>{ago}</Text>
    </View>
  );
}

export function FeedSystemLine(p: {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  text: string;
  ago: string;
  onProfile: () => void;
}) {
  return (
    <View style={styles.system}>
      <Pressable onPress={p.onProfile} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${p.displayName} profile`}>
        <Avatar userId={p.userId} uri={p.avatarUrl} displayName={p.displayName} username={p.username} size={32} />
      </Pressable>
      <Text numberOfLines={2} style={styles.joinText}>
        {p.text}
      </Text>
      <Text style={styles.ago}>{p.ago}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.md,
  },
  body: { flex: 1, gap: 2 },
  head: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  name: { fontSize: 14, lineHeight: 18, fontWeight: "500", color: DS_V3.color.textPrimary },
  ago: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  line: { fontSize: 14, lineHeight: 19, color: DS_V3.color.textPrimary },
  meta: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  actions: { flexDirection: "row", gap: 18, marginTop: 4 },
  act: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 32 },
  count: { ...DS_V3.type.caption, fontWeight: "500", color: DS_V3.color.textSecondary },
  countOn: { color: DS_V3.color.brandText },
  join: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: DS_V3.space.gutter,
  },
  joinText: { flex: 1, ...DS_V3.type.secondary, color: DS_V3.color.textPrimary },
  system: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: 6,
  },
});
