import React, { useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Copy, Lock, Plus, Users } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { CameraSeal } from "@/components/ds/FeedPost";

const W = Dimensions.get("window").width;
const H = Math.round(W * 1.25);

export type ProofDayItem = {
  id: string;
  photoUri?: string;
  task: string;
  challenge: string;
  dayLine: string;
  gate: "Camera" | "Self-reported" | "Location";
  time: string;
  shared: boolean;
  uploadFailed?: boolean;
};

export type ProofDay = { dateKey: string; label: string; proofs: ProofDayItem[] };

export function ProofTile({ day, onPress }: { day: ProofDay | "today"; onPress: () => void }) {
  if (day === "today") {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel="Today" onPress={onPress} style={styles.today}>
        <Plus size={18} color={DS_V3.color.textSecondary} />
        <Text style={styles.todayLabel}>Today</Text>
      </Pressable>
    );
  }
  const p = day.proofs[0];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={day.label} onPress={onPress} style={[styles.tile, { backgroundColor: p?.photoUri ? DS_V3.color.raised : DS_V3.color.surface }]}>
      {p?.photoUri ? (
        <Image source={{ uri: p.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.self}>
          <Text style={styles.task}>{p?.task}</Text>
          <Text style={styles.selfLabel}>Self-reported</Text>
        </View>
      )}
      <Text style={styles.dayLabel}>{day.label}</Text>
      {day.proofs.length > 1 ? (
        <View style={styles.badge}><Copy size={14} color={DS_V3.color.textPrimary} /></View>
      ) : !p?.shared ? (
        <View style={styles.lock}><Lock size={11} color={DS_V3.color.textPrimary} /></View>
      ) : null}
    </Pressable>
  );
}

export function ProofDayBlock({
  day,
  owner,
  onShare,
}: {
  day: ProofDay;
  owner: boolean;
  onShare: (p: ProofDayItem) => void;
}) {
  const [i, setI] = useState(0);
  const p = day.proofs[i];
  if (!p) return null;
  return (
    <View>
      <View style={styles.dayHead}>
        <Text style={styles.dayTitle}>{day.label}</Text>
        <Text style={styles.count}>{day.proofs.length === 1 ? "1 proof" : `${day.proofs.length} proofs`}</Text>
      </View>
      <View style={{ width: W, height: H }}>
        <FlatList
          horizontal
          pagingEnabled
          data={day.proofs}
          keyExtractor={(x) => x.id}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
          renderItem={({ item }) =>
            item.photoUri && !item.uploadFailed ? (
              <Image source={{ uri: item.photoUri }} style={{ width: W, height: H }} contentFit="cover" />
            ) : (
              <View style={styles.miss}>
                <Text style={styles.missTask}>{item.task}</Text>
                <Text style={styles.missSub}>
                  {item.uploadFailed ? "The photo didn’t upload. The task still counts." : "Self-reported"}
                </Text>
              </View>
            )
          }
        />
        {p.photoUri && !p.uploadFailed ? <View style={styles.sealPos}><CameraSeal /></View> : null}
        {day.proofs.length > 1 ? (
          <View style={styles.pill}><Text style={styles.pillText}>{i + 1} of {day.proofs.length}</Text></View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.taskTitle}>{p.task}</Text>
        <Text style={styles.line}>{p.challenge} · {p.dayLine} · {p.gate} · {p.time}</Text>
        {owner ? (
          <View style={styles.owner}>
            <View style={styles.shareState}>
              {p.shared ? <Users size={14} color={DS_V3.color.textSecondary} /> : <Lock size={14} color={DS_V3.color.textSecondary} />}
              <Text style={styles.line}>{p.shared ? "Shared to the feed" : "Private"}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => onShare(p)} style={styles.shareBtn}>
              <Text style={styles.shareLabel}>{p.shared ? "Share" : "Share this proof"}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  today: {
    flex: 1,
    aspectRatio: 0.8,
    borderWidth: 1.5,
    borderColor: DS_V3.color.textTertiary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  todayLabel: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  tile: { flex: 1, aspectRatio: 0.8, overflow: "hidden" },
  self: { flex: 1, justifyContent: "center", padding: 8, gap: 2 },
  task: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  selfLabel: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  dayLabel: { position: "absolute", left: 6, bottom: 5, ...DS_V3.type.label, color: DS_V3.color.textPrimary, textTransform: "none", letterSpacing: 0 },
  badge: { position: "absolute", right: 6, top: 6 },
  lock: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(15,15,15,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayHead: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  dayTitle: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  count: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  miss: { width: W, height: H, backgroundColor: DS_V3.color.surface, alignItems: "center", justifyContent: "center", gap: 6 },
  missTask: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  missSub: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  sealPos: { position: "absolute", left: 12, top: 12 },
  pill: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "rgba(15,15,15,0.62)",
    justifyContent: "center",
  },
  pillText: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  meta: { paddingHorizontal: 16, paddingTop: 10, gap: 2 },
  taskTitle: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  line: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  owner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  shareState: { flexDirection: "row", alignItems: "center", gap: 6 },
  shareBtn: { minHeight: 44, justifyContent: "center" },
  shareLabel: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
});
