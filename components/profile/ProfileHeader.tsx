import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import { compact } from "@/lib/profile-header";
import {
  EDIT_PROFILE,
  FIND_FRIENDS,
  FOLLOW,
  MESSAGE,
  SHARE_PROFILE,
  ownerShareLabel,
} from "@/lib/g3-profile";

export function ProfileHeader(p: {
  userId: string;
  avatarUrl?: string | null;
  displayName: string;
  username: string;
  bio?: string | null;
  bioPlaceholder?: string | null;
  streakDays: number;
  bestDays: number;
  securedDays: number;
  friends: number;
  friendFaces?: { userId: string; username: string; displayName: string; avatarUrl: string | null }[];
  followers?: number;
  following?: number;
  isOwner: boolean;
  isFriend?: boolean;
  isFollowing?: boolean;
  followLabel?: string;
  locked?: boolean;
  onEdit: () => void;
  onFollow: () => void;
  onShare: () => void;
  onFindFriends?: () => void;
  onMessage?: () => void;
  onEditBio: () => void;
  onFollowers?: () => void;
  onFollowing?: () => void;
  onFriends?: () => void;
}) {
  const shareLabel = p.isOwner ? ownerShareLabel(p.friends) : SHARE_PROFILE;
  const onShareOrFind = p.isOwner && p.friends <= 0 ? (p.onFindFriends ?? p.onShare) : p.onShare;
  const handle = p.username.replace(/^@/, "");
  const friendLabel = p.friends === 0 ? FIND_FRIENDS : p.friends === 1 ? "1 friend" : `${p.friends} friends`;
  return (
    <View style={styles.wrap}>
      <Avatar
        userId={p.userId}
        uri={p.avatarUrl}
        displayName={p.displayName}
        username={p.username}
        size={80}
      />
      <View style={styles.who}>
        <Text style={styles.name}>{p.displayName}</Text>
        <Text style={styles.handle}>@{handle}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={friendLabel}
          onPress={p.friends === 0 ? onShareOrFind : p.onFriends}
          style={styles.friendsRow}
        >
          <Text style={styles.handle}>{friendLabel}</Text>
          {p.friends > 0 ? (
            <View style={styles.faces}>
              {(p.friendFaces ?? []).slice(0, 3).map((face) => (
                <Avatar
                  key={face.userId}
                  userId={face.userId}
                  uri={face.avatarUrl}
                  displayName={face.displayName}
                  username={face.username}
                  size={20}
                />
              ))}
            </View>
          ) : null}
        </Pressable>
        {p.bio ? (
          <Text style={styles.bio}>{p.bio}</Text>
        ) : p.isOwner ? (
          <Text style={styles.addBio}>{p.bioPlaceholder ?? "Add a bio"}</Text>
        ) : null}
      </View>
      {p.isOwner ? (
        <Btn label={EDIT_PROFILE} onPress={p.onEdit} />
      ) : (
        <View style={styles.btns}>
          <Btn
            label={p.followLabel ?? (p.isFollowing ? "Following" : FOLLOW)}
            onPress={p.onFollow}
          />
          {p.isFriend ? <Btn label={MESSAGE} onPress={p.onMessage ?? (() => undefined)} /> : null}
          <Btn label={shareLabel} onPress={onShareOrFind} />
        </View>
      )}
      {p.locked ? null : (
        <View style={styles.stats}>
          <Stat n={p.streakDays} l="Streak" earned flame />
          <Stat n={p.bestDays} l="Best" earned hair />
          <Stat n={p.securedDays} l="Days secured" earned hair />
        </View>
      )}
    </View>
  );
}

function Stat({ n, l, earned, flame, hair }: { n: number; l: string; earned?: boolean; flame?: boolean; hair?: boolean }) {
  return (
    <View style={[styles.stat, hair ? styles.statHair : null]}>
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

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.btn, styles.btnGhost]}
    >
      <Text style={styles.btnTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.lg },
  stats: { flex: 1, flexDirection: "row" },
  statFlex: { flex: 1 },
  stat: { flex: 1, alignItems: "center", gap: 1 },
  statNum: { flexDirection: "row", alignItems: "center", gap: 3 },
  num: {
    fontSize: 18,
    lineHeight: 22,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  cap: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  who: { paddingTop: 10, gap: 1 },
  name: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  handle: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  friendsRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  faces: { flexDirection: "row", gap: 4 },
  statHair: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: DS_V3.color.hairline },
  bio: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textPrimary, paddingTop: 4 },
  addBio: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textSecondary, paddingTop: 4 },
  btns: { flexDirection: "row", gap: 8, paddingTop: 12 },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: DS_V3.radius.input,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: DS_V3.color.surface, borderWidth: 1, borderColor: DS_V3.color.border },
  btnTxt: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
});
