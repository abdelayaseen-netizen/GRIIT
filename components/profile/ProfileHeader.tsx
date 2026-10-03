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
  FRIENDS,
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
  securedDays: number;
  friends: number;
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
          {p.locked ? null : (
            <>
              <Stat n={p.securedDays} l="secured" earned />
              <Pressable
                onPress={p.onFriends ?? p.onFollowers}
                style={styles.statFlex}
                accessibilityRole="button"
                accessibilityLabel={`${p.friends} friends`}
              >
                <Stat n={p.friends} l="friends" />
              </Pressable>
            </>
          )}
        </View>
      </View>
      <View style={styles.who}>
        <Text style={styles.name}>{p.displayName}</Text>
        {p.bio ? (
          <Text style={styles.bio}>{p.bio}</Text>
        ) : p.isOwner && p.bioPlaceholder ? (
          <Text style={styles.addBio}>{p.bioPlaceholder}</Text>
        ) : p.isOwner ? (
          <Text onPress={p.onEditBio} style={styles.addBio}>
            Add a bio
          </Text>
        ) : null}
      </View>
      <View style={styles.btns}>
        {p.isOwner ? (
          <Btn label={EDIT_PROFILE} onPress={p.onEdit} />
        ) : p.isFriend ? (
          <Btn label={FRIENDS} onPress={p.onFollow} />
        ) : (
          <Btn
            label={p.followLabel ?? (p.isFollowing ? "Following" : FOLLOW)}
            primary={!p.isFollowing && p.followLabel !== "Following" && p.followLabel !== "Requested"}
            onPress={p.onFollow}
          />
        )}
        {p.isFriend && !p.isOwner ? (
          <Btn label={MESSAGE} onPress={p.onMessage ?? (() => undefined)} />
        ) : (
          <Btn label={shareLabel === FIND_FRIENDS ? FIND_FRIENDS : SHARE_PROFILE} onPress={onShareOrFind} />
        )}
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
  name: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: DS_V3.color.textPrimary },
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
  btnPrimary: { backgroundColor: DS_V3.color.primary },
  btnGhost: { backgroundColor: DS_V3.color.surface, borderWidth: 1, borderColor: DS_V3.color.border },
  btnTxt: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
});
