// Build 92 chunk 07.2 · Profile header, Option A (P2-01, P2-07, P2-08).
// 3 numbers (Streak · Best · Days secured with "{n} verified"), one followers · following line, no Friends,
// own buttons Edit profile · Find friends, visitor buttons Follow/Following · Invite to a challenge, and the
// record row "Challenges, badges and stats · n running · n finished · n badges" under the buttons.
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import { compact, followLine, INVITE_TO_CHALLENGE, recordRowLine, verifiedLine } from "@/lib/profile-header";
import { EDIT_PROFILE, FIND_FRIENDS, FOLLOW } from "@/lib/g3-profile";

export type ProfileRecordCounts = { running: number; finished: number; badges: number };

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
  verifiedDays?: number;
  followers?: number;
  following?: number;
  isOwner: boolean;
  isFollowing?: boolean;
  followLabel?: string;
  locked?: boolean;
  /** Option A record row. Hidden when absent (locked visitor view). */
  record?: ProfileRecordCounts | null;
  onEdit: () => void;
  onFollow: () => void;
  onShare: () => void;
  onFindFriends?: () => void;
  onInvite?: () => void;
  onEditBio: () => void;
  onFollowers?: () => void;
  onFollowing?: () => void;
  onRecord?: () => void;
}) {
  const handle = p.username.replace(/^@/, "");
  const followers = p.followers ?? 0;
  const following = p.following ?? 0;
  const line = followLine(followers, following);
  const [followersPart, followingPart] = line.split(" · ");
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
        <Text style={styles.name} numberOfLines={2}>{p.displayName}</Text>
        <Text style={styles.handle}>@{handle}</Text>
        {p.bio ? (
          <Text style={styles.bio}>{p.bio}</Text>
        ) : p.isOwner ? (
          <Text style={styles.addBio}>{p.bioPlaceholder ?? "Add a bio"}</Text>
        ) : null}
        <View style={styles.followRow} accessibilityRole="text" accessibilityLabel={line} testID="profile-follow-line">
          <Pressable onPress={p.onFollowers} accessibilityRole="button" accessibilityLabel={followersPart} hitSlop={6}>
            <Text style={styles.followTxt}>{followersPart}</Text>
          </Pressable>
          <Text style={styles.followTxt}> · </Text>
          <Pressable onPress={p.onFollowing} accessibilityRole="button" accessibilityLabel={followingPart} hitSlop={6}>
            <Text style={styles.followTxt}>{followingPart}</Text>
          </Pressable>
        </View>
      </View>
      {p.isOwner ? (
        <View style={styles.btns}>
          <Btn label={EDIT_PROFILE} onPress={p.onEdit} />
          <Btn label={FIND_FRIENDS} onPress={p.onFindFriends ?? p.onShare} />
        </View>
      ) : (
        <View style={styles.btns}>
          <Btn
            label={p.followLabel ?? (p.isFollowing ? "Following" : FOLLOW)}
            onPress={p.onFollow}
            primary={!(p.followLabel === "Following" || p.isFollowing)}
          />
          <Btn label={INVITE_TO_CHALLENGE} onPress={p.onInvite ?? p.onShare} />
        </View>
      )}
      {p.locked ? null : (
        <View style={styles.stats}>
          <Stat n={p.streakDays} l="Streak" flame />
          <Stat n={p.bestDays} l="Best" hair />
          <Stat n={p.securedDays} l="Days secured" hair sub={verifiedLine(p.verifiedDays ?? 0)} />
        </View>
      )}
      {p.record && !p.locked ? (
        <Pressable
          onPress={p.onRecord}
          accessibilityRole="button"
          accessibilityLabel={recordRowLine(p.record)}
          testID="profile-record-row"
          style={styles.recordRow}
        >
          <Text style={styles.recordTxt} numberOfLines={2}>{recordRowLine(p.record)}</Text>
          <ChevronRight size={18} color={DS_V3.color.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** 07.6: header shape while nothing is cached yet; never a blank screen. */
export function ProfileHeaderSkeleton() {
  return (
    <View style={styles.wrap} testID="profile-header-skeleton">
      <View style={[styles.skel, { width: 80, height: 80, borderRadius: 40 }]} />
      <View style={styles.who}>
        <View style={[styles.skel, { width: 160, height: 22 }]} />
        <View style={[styles.skel, { width: 100, height: 16 }]} />
        <View style={[styles.skel, { width: 180, height: 14, marginTop: 6 }]} />
      </View>
      <View style={styles.btns}>
        <View style={[styles.btn, styles.skel]} />
        <View style={[styles.btn, styles.skel]} />
      </View>
    </View>
  );
}

function Stat({ n, l, flame, hair, sub }: { n: number; l: string; flame?: boolean; hair?: boolean; sub?: string }) {
  // The number keeps its own label ("1 Days secured", chunk 06); the verified line is its own element.
  return (
    <View style={[styles.stat, hair ? styles.statHair : null]}>
      <View
        style={styles.statMain}
        accessible
        accessibilityLabel={`${n.toLocaleString("en-US")} ${l}`}
        testID={`profile-stat-${l.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <View style={styles.statNum}>
          {flame ? <Flame size={16} color={DS_V3.color.brand} /> : null}
          <Text style={[styles.num, { fontFamily: DS_V3.displayFace, fontWeight: DS_V3.displayWeight }]}>
            {compact(n)}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.cap}>
          {l}
        </Text>
      </View>
      {sub ? (
        <Text numberOfLines={1} style={styles.sub} accessibilityLabel={sub} testID="profile-stat-verified">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function Btn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.btn, primary ? styles.btnPrimary : styles.btnGhost]}
    >
      <Text style={[styles.btnTxt, primary ? styles.btnTxtPrimary : null]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: 10 },
  stats: { flexDirection: "row", marginTop: 16, alignItems: "flex-start" },
  stat: { flex: 1, alignItems: "center", gap: 1 },
  statMain: { alignItems: "center", gap: 1 },
  statNum: { flexDirection: "row", alignItems: "center", gap: 3 },
  num: {
    fontSize: 18,
    lineHeight: 22,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  cap: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  sub: { fontSize: 11, lineHeight: 14, color: DS_V3.color.textSecondary, fontVariant: ["tabular-nums"] },
  who: { paddingTop: 12, gap: 6 },
  name: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  handle: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  statHair: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: DS_V3.color.hairline },
  bio: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textPrimary, marginTop: 8 },
  addBio: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textSecondary, marginTop: 8 },
  followRow: { flexDirection: "row", alignItems: "center", marginTop: 6, minHeight: 24 },
  followTxt: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textSecondary, fontVariant: ["tabular-nums"] },
  btns: { flexDirection: "row", gap: 8, marginTop: 16 },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: DS_V3.radius.input,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  btnGhost: { backgroundColor: DS_V3.color.surface, borderWidth: 1, borderColor: DS_V3.color.border },
  btnPrimary: { backgroundColor: DS_V3.color.brand },
  btnTxt: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
  btnTxtPrimary: { color: "#FFFFFF" },
  recordRow: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: DS_V3.radius.input,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  recordTxt: { flex: 1, fontSize: 13, lineHeight: 18, color: DS_V3.color.textPrimary },
  skel: { backgroundColor: DS_V3.color.surface, borderRadius: 6 },
});
