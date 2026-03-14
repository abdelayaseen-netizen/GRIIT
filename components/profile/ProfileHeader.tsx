import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

export interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName: string;
  username: string;
  disciplineTitle?: string;
  currentTier: string;
  joinDate?: string;
  onShare?: () => void;
  bio?: string;
  /** Only show Edit button on own profile. Default true. */
  showEditButton?: boolean;
}

const AVATAR_SIZE = 80;

const AVATAR_COLORS = [
  DS_COLORS.avatarColor1,
  DS_COLORS.avatarColor2,
  DS_COLORS.avatarColor3,
  DS_COLORS.avatarColor4,
  DS_COLORS.avatarColor5,
  DS_COLORS.avatarColor6,
  DS_COLORS.avatarColor7,
  DS_COLORS.avatarColor8,
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProfileHeader({
  avatarUrl,
  fullName,
  username,
  disciplineTitle: _disciplineTitle,
  currentTier,
  joinDate,
  onShare,
  bio,
  showEditButton = true,
}: ProfileHeaderProps) {
  const router = useRouter();
  const displayName = fullName || username || "User";
  const avatarBg = getAvatarColor(username || fullName || "U");

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.fullName}>{displayName}</Text>
      <Text style={styles.username}>@{username || "user"}</Text>
      {bio ? (
        <View style={styles.bioPill}>
          <Text style={styles.bioPillText}>{bio}</Text>
        </View>
      ) : null}
      <View style={styles.tierBadge}>
        <View style={[styles.tierDot, { backgroundColor: DS_COLORS.accent }]} />
        <Text style={styles.tierBadgeText}>{currentTier}</Text>
      </View>
      {joinDate ? (
        <Text style={styles.joinDate}>Joined {joinDate}</Text>
      ) : null}
      <View style={styles.actions}>
        {showEditButton && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(ROUTES.EDIT_PROFILE as never);
            }}
            activeOpacity={0.7}
            accessibilityLabel="Edit your profile"
            accessibilityRole="button"
          >
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.7} accessibilityLabel="Share your profile" accessibilityRole="button">
          <Text style={styles.shareBtnText}>🔗 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: DS_SPACING.xxl,
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
  },
  avatarWrap: {
    marginBottom: DS_SPACING.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
  },
  username: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.xs,
    textAlign: "center",
  },
  bioPill: {
    marginTop: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: 6,
    borderRadius: DS_RADIUS.input,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.borderAlt,
  },
  bioPillText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: 6,
    borderRadius: DS_RADIUS.input,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  joinDate: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: DS_SPACING.md,
    marginTop: DS_SPACING.lg,
  },
  editBtn: {
    paddingVertical: 10,
    paddingHorizontal: DS_SPACING.xxl,
    height: 40,
    justifyContent: "center",
    borderRadius: DS_RADIUS.button,
    borderWidth: 1.5,
    borderColor: DS_COLORS.borderAlt,
    backgroundColor: DS_COLORS.surface,
  },
  editBtnText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  shareBtn: {
    paddingVertical: 10,
    paddingHorizontal: DS_SPACING.xxl,
    height: 40,
    justifyContent: "center",
    borderRadius: DS_RADIUS.button,
    borderWidth: 1.5,
    borderColor: DS_COLORS.borderAlt,
    backgroundColor: DS_COLORS.surface,
  },
  shareBtnText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
});
