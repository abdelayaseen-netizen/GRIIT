import React, { useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Camera, Heart, MessageCircle, MoreHorizontal, Share } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";

const W = Dimensions.get("window").width;
const H = Math.round(W * 1.25);

export function CameraSeal() {
  return (
    <View style={styles.seal} accessibilityLabel="Camera">
      <Camera size={14} color={DS_V3.color.textPrimary} />
    </View>
  );
}

export type PhotoPostProps = {
  userId: string;
  name: string;
  sub: string;
  time: string;
  photos: { uri: string; caption?: string }[];
  respects: number;
  comments: number;
  onRespect: () => void;
  onComments: () => void;
  onShare: () => void;
  onMore: () => void;
};

/** Full-bleed 4:5 photo. Multi-photo days are a carousel. Camera seal, never "Verified". */
export function PhotoPost(p: PhotoPostProps) {
  const [i, setI] = useState(0);
  const cap = p.photos[i]?.caption;
  return (
    <View>
      <View style={styles.head}>
        <Avatar userId={p.userId} displayName={p.name} size={32} />
        <View style={styles.who}>
          <Text numberOfLines={1} style={styles.name}>{p.name}</Text>
          <Text style={styles.sub}>{p.sub}</Text>
        </View>
        <Text style={styles.time}>{p.time}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={p.onMore} hitSlop={4} style={styles.more}>
          <MoreHorizontal size={20} color={DS_V3.color.textSecondary} />
        </Pressable>
      </View>
      <View style={{ width: W, height: H }}>
        <FlatList
          horizontal
          pagingEnabled
          data={p.photos}
          keyExtractor={(_, k) => String(k)}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={{ width: W, height: H }} contentFit="cover" />
          )}
        />
        <View style={styles.sealPos}><CameraSeal /></View>
        {p.photos.length > 1 ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{i + 1} of {p.photos.length}</Text>
          </View>
        ) : null}
        {cap ? (
          <View style={styles.caption}>
            <Text style={styles.captionText}>{cap}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Act onPress={p.onRespect} label="Respect" icon={<Heart size={24} color={DS_V3.color.textPrimary} />} n={p.respects} />
        <Act onPress={p.onComments} label="Comments" icon={<MessageCircle size={24} color={DS_V3.color.textPrimary} />} n={p.comments} />
        <View style={styles.flex} />
        <Act onPress={p.onShare} label="Share" icon={<Share size={24} color={DS_V3.color.textPrimary} />} n={0} />
      </View>
    </View>
  );
}

function Act({ onPress, icon, n, label }: { onPress: () => void; icon: React.ReactNode; n: number; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={n > 0 ? `${label}, ${n}` : label} onPress={onPress} style={styles.act}>
      {icon}
      {n > 0 ? <Text style={styles.count}>{n}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 16, paddingRight: 6, paddingVertical: 10 },
  who: { flex: 1 },
  name: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  sub: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  time: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  more: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  seal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(15,15,15,0.45)",
    borderWidth: 1,
    borderColor: "rgba(242,240,235,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
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
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "rgba(15,15,15,0.8)",
  },
  captionText: { ...DS_V3.type.body, color: DS_V3.color.textPrimary },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  flex: { flex: 1 },
  act: { minWidth: 44, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 5 },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
});
