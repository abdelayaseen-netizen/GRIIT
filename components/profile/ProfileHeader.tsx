import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import { compact } from "@/lib/profile-header";

export function ProfileHeader(p: {
  userId: string;
  avatarUrl?: string | null;
  displayName: string;
  username: string;
  bio?: string | null;
  streakDays: number;
  securedDays: number;
  followers: number;
  following: number;
  isOwner: boolean;
  isFollowing?: boolean;
  followLabel?: string;
  onEdit: () => void;
  onFollow: () => void;
  onShare: () => void;
  onEditBio: () => void;
  onFollowers?: () => void;
  onFollowing?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Avatar
          userId={p.userId}
          uri={p.avatarUrl}
          displayName={p.displayName}
          username={p.username}
          size={80}
        />
        <View style={styles.stats}>
          <Stat n={p.streakDays} l="streak" earned flame />
          <Stat n={p.securedDays} l="secured" earned />
          <Pressable onPress={p.onFollowers} style={styles.statFlex} accessibilityRole="button" accessibilityLabel={`${p.followers} followers`}>
            <Stat n={p.followers} l="followers" />
          </Pressable>
          <Pressable onPress={p.onFollowing} style={styles.statFlex} accessibilityRole="button" accessibilityLabel={`${p.following} following`}>
            <Stat n={p.following} l="following" />
          </Pressable>
        </View>
      </View>
      <View style={styles.who}>
        <Text style={styles.name}>{p.displayName}</Text>
        <Text style={styles.handle}>@{p.username}</Text>
        {p.bio ? (
          <Text style={styles.bio}>{p.bio}</Text>
        ) : p.isOwner ? (
          <Text onPress={p.onEditBio} style={styles.addBio}>
            Add a bio
          </Text>
        ) : null}
      </View>
      <View style={styles.btns}>
        {p.isOwner ? (
          <Btn label="Edit profile" onPress={p.onEdit} />
        ) : (
          <Btn
            label={p.followLabel ?? (p.isFollowing ? "Following" : "Follow")}
            primary={!p.isFollowing && p.followLabel !== "Following"}
            onPress={p.onFollow}
          />
        )}
        <Btn label="Share profile" onPress={p.onShare} />
      </View>
    </View>
  );
}

function Stat({ n, l, earned, flame }: { n: number; l: string; earned?: boolean; flame?: boolean }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statNum}>
        {flame ? <Flame size={16} color={DS_V3.color.brand} /> : null}
        <Text
          style={[
            styles.num,
            earned
              ? { fontFamily: DS_V3.displayFace, fontWeight: DS_V3.displayWeight }
              : { fontWeight: "500" },
          ]}
        >
          {compact(n)}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.cap}>
        {l}
      </Text>
    </View>
  );
}

function Btn({ label, primary, onPress }: { label: string; primary?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.btn, primary ? styles.btnPrimary : styles.btnGhost]}
    >
      <Text style={styles.btnTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.lg, paddingTop: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.lg },
  stats: { flex: 1, flexDirection: "row" },
  statFlex: { flex: 1 },
  stat: { flex: 1, alignItems: "center", gap: 1 },
  statNum: { flexDirection: "row", alignItems: "center", gap: 3 },
  num: {
    fontSize: 17,
    lineHeight: 22,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  cap: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  who: { paddingTop: 10, gap: 1 },
  name: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  handle: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  bio: { ...DS_V3.type.secondary, color: DS_V3.color.textPrimary, paddingTop: 4 },
  addBio: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, paddingTop: 4 },
  btns: { flexDirection: "row", gap: 8, paddingTop: 12 },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: DS_V3.radius.input,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: DS_V3.color.primary },
  btnGhost: { backgroundColor: DS_V3.color.surface, borderWidth: 1, borderColor: DS_V3.color.border },
  btnTxt: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
});
