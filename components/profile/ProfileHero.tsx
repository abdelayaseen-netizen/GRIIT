import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Camera, Flame, Edit3, Share2 } from "lucide-react-native";
import { Image } from "expo-image";
import { DS_COLORS } from "@/lib/design-system";
import type { ProfileState } from "@/lib/profile-state";

/** Exported for tests — single source of visible copy. */
export const PROFILE_HERO_UI = {
  bioCta: "Tell people why you're here",
  lightFirstFlame: "Light your first flame →",
  editProfile: "Edit profile",
  shareLabel: " Share",
  follow: "Follow",
  following: "Following",
  nudge: "Nudge",
} as const;

export interface ProfileHeroProps {
  state: ProfileState;
  view: "self" | "visitor";
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  tier: string;
  tierBg: string;
  tierFg: string;
  streak: number;
  followerCount: number;
  followingCount: number;
  onBioCta?: () => void;
  onEditProfile?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onNudge?: () => void;
  onLightFirstFlame?: () => void;
  isFollowing?: boolean;
  /** Self-only: tap avatar to pick a new photo (matches legacy profile row). */
  onAvatarPress?: () => void;
  uploadingAvatar?: boolean;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

export function ProfileHero(props: ProfileHeroProps) {
  const ringStyle = props.streak >= 1 ? styles.ringLit : styles.ringCold;
  const streakColor = props.streak >= 1 ? DS_COLORS.PROFILE_STAT_CORAL_ICON : DS_COLORS.TEXT_MUTED;
  const streakFontSize = props.streak >= 100 ? 20 : props.streak >= 1 ? 16 : 14;
  const display = props.displayName.trim() || props.username.trim() || "?";
  const initials = display.slice(0, 2).toUpperCase();

  const avatarInner = (
    <>
      <View style={[styles.avatarRing, ringStyle]} />
      {props.avatarUrl ? (
        <Image source={{ uri: props.avatarUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
      )}
      {props.view === "self" && props.onAvatarPress ? (
        <View style={styles.cameraBadge}>
          {props.uploadingAvatar ? (
            <Text style={styles.cameraBadgeText}>…</Text>
          ) : (
            <Camera size={13} color={DS_COLORS.WHITE} strokeWidth={2} />
          )}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.identityBlock}>
        <View style={styles.avatarWrap}>
          {props.view === "self" && props.onAvatarPress ? (
            <Pressable
              onPress={props.onAvatarPress}
              disabled={props.uploadingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {avatarInner}
            </Pressable>
          ) : (
            avatarInner
          )}
        </View>
        <View style={styles.identityMeta}>
          <Text style={styles.displayName} numberOfLines={1}>
            {display}
          </Text>
          <Text style={styles.handle}>@{props.username}</Text>
          <View style={styles.tierRow}>
            <View style={[styles.tierPill, { backgroundColor: props.tierBg }]}>
              <Flame size={10} color={props.tierFg} strokeWidth={2.5} />
              <Text style={[styles.tierText, { color: props.tierFg }]}>{props.tier}</Text>
            </View>
          </View>
        </View>
      </View>

      {props.view === "self" && props.state === "new_user" ? (
        <Pressable
          style={styles.bioCta}
          onPress={props.onBioCta}
          accessibilityRole="button"
          accessibilityLabel="Add a bio"
        >
          <Text style={styles.bioCtaText}>{PROFILE_HERO_UI.bioCta}</Text>
          <Text style={styles.bioCtaPlus}>+</Text>
        </Pressable>
      ) : props.bio?.trim() ? (
        <Text style={styles.bioText} numberOfLines={2}>
          {props.bio}
        </Text>
      ) : null}

      <View style={styles.countsRow}>
        <Pressable
          style={styles.countItem}
          onPress={props.onFollowersPress}
          disabled={!props.onFollowersPress}
          accessibilityRole={props.onFollowersPress ? "button" : "text"}
          accessibilityLabel={props.onFollowersPress ? "View followers" : undefined}
        >
          <Text style={styles.countNum}>{props.followerCount}</Text>
          <Text style={styles.countLbl}>followers</Text>
        </Pressable>
        <Pressable
          style={styles.countItem}
          onPress={props.onFollowingPress}
          disabled={!props.onFollowingPress}
          accessibilityRole={props.onFollowingPress ? "button" : "text"}
          accessibilityLabel={props.onFollowingPress ? "View following" : undefined}
        >
          <Text style={styles.countNum}>{props.followingCount}</Text>
          <Text style={styles.countLbl}>following</Text>
        </Pressable>
        <View style={styles.countSpacer} />
        <View style={[styles.countItem, styles.countItemRight]}>
          <Text style={[styles.countNum, { color: streakColor, fontSize: streakFontSize }]}>
            {props.streak}
          </Text>
          <Text style={styles.countLbl}>day streak</Text>
        </View>
      </View>

      <View style={styles.ctaRow}>{renderCTAs(props)}</View>
    </View>
  );
}

function renderCTAs(props: ProfileHeroProps) {
  if (props.view === "self") {
    if (props.state === "new_user") {
      return (
        <>
          <Pressable
            style={styles.btnPrim}
            onPress={props.onLightFirstFlame}
            accessibilityRole="button"
            accessibilityLabel="Light your first flame"
          >
            <Text style={styles.btnPrimText}>{PROFILE_HERO_UI.lightFirstFlame}</Text>
          </Pressable>
          <Pressable
            style={styles.btnIcon}
            onPress={props.onEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Edit3 size={16} color={DS_COLORS.TEXT_PRIMARY} />
          </Pressable>
        </>
      );
    }
    return (
      <>
        <Pressable
          style={styles.btnOutGray}
          onPress={props.onEditProfile}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Text style={styles.btnOutGrayText}>{PROFILE_HERO_UI.editProfile}</Text>
        </Pressable>
        <Pressable
          style={styles.btnOutOrange}
          onPress={props.onShare}
          accessibilityRole="button"
          accessibilityLabel="Share profile"
        >
          <Share2 size={12} color={DS_COLORS.PROFILE_STAT_CORAL_ICON} />
          <Text style={styles.btnOutOrangeText}>{PROFILE_HERO_UI.shareLabel}</Text>
        </Pressable>
      </>
    );
  }
  if (props.isFollowing) {
    return (
      <>
        <Pressable
          style={styles.btnOutGray}
          onPress={props.onUnfollow}
          accessibilityRole="button"
          accessibilityLabel="Unfollow"
        >
          <Text style={styles.btnOutGrayText}>{PROFILE_HERO_UI.following}</Text>
        </Pressable>
        <Pressable
          style={styles.btnOutOrange}
          onPress={props.onNudge}
          accessibilityRole="button"
          accessibilityLabel="Nudge"
        >
          <Text style={styles.btnOutOrangeText}>{PROFILE_HERO_UI.nudge}</Text>
        </Pressable>
      </>
    );
  }
  return (
    <Pressable
      style={styles.btnPrim}
      onPress={props.onFollow}
      accessibilityRole="button"
      accessibilityLabel="Follow"
    >
      <Text style={styles.btnPrimText}>{PROFILE_HERO_UI.follow}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  identityBlock: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrap: { width: 72, height: 72, position: "relative" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DS_COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: DS_COLORS.BG_PAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadgeText: { color: DS_COLORS.WHITE, fontSize: 11 },
  avatarRing: { position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderRadius: 40 },
  ringLit: { borderWidth: 2, borderColor: DS_COLORS.PROFILE_STAT_CORAL_ICON },
  ringCold: { borderWidth: 2, borderColor: DS_COLORS.BORDER_DEFAULT, borderStyle: "dashed" },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarFallback: { backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_BG, alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 24, fontWeight: "500", color: DS_COLORS.PROFILE_STAT_CORAL_ICON },
  identityMeta: { flex: 1, paddingTop: 2 },
  displayName: { fontSize: 18, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  handle: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginTop: 2 },
  tierRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  tierPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tierText: { fontSize: 10, fontWeight: "500" },
  bioCta: { marginTop: 10, backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_BG, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bioCtaText: { color: DS_COLORS.PROFILE_STAT_CORAL_ICON, fontSize: 11 },
  bioCtaPlus: { color: DS_COLORS.PROFILE_STAT_CORAL_ICON, fontSize: 14 },
  bioText: { marginTop: 10, fontSize: 12, color: DS_COLORS.TEXT_PRIMARY, lineHeight: 17 },
  countsRow: { marginTop: 12, flexDirection: "row", alignItems: "flex-end", gap: 20 },
  countItem: { flexDirection: "column" },
  countItemRight: { alignItems: "flex-end" },
  countNum: { fontSize: 16, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY, lineHeight: 18 },
  countLbl: { fontSize: 10, color: DS_COLORS.TEXT_MUTED, marginTop: 2 },
  countSpacer: { flex: 1 },
  ctaRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  btnPrim: { flex: 1, backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_ICON, borderRadius: 999, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  btnPrimText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  btnIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: DS_COLORS.BORDER_DEFAULT, alignItems: "center", justifyContent: "center" },
  btnOutGray: { flex: 1, borderRadius: 999, paddingVertical: 9, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: DS_COLORS.BORDER_DEFAULT },
  btnOutGrayText: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 12, fontWeight: "500" },
  btnOutOrange: { flex: 1, borderRadius: 999, paddingVertical: 9, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: DS_COLORS.PROFILE_STAT_CORAL_ICON, flexDirection: "row" },
  btnOutOrangeText: { color: DS_COLORS.PROFILE_STAT_CORAL_ICON, fontSize: 12, fontWeight: "500" },
});
