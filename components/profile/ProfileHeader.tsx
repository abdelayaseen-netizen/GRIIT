import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Share2, Camera } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { pickAndUploadAvatar } from "@/lib/avatar";
import { Avatar } from "@/components/Avatar";
import { captureError } from "@/lib/sentry";

export interface ProfileHeaderProps {
  userId?: string;
  avatarUrl?: string | null;
  fullName: string;
  username?: string;
  currentTier: string;
  joinDate?: string;
  onShare?: () => void;
  onAvatarUpdated?: () => void;
  bio?: string;
  showEditButton?: boolean;
  /** When set (including zeros), shows follower/following row from `user_follows`. Omit to hide the row. */
  followerCount?: number;
  followingCount?: number;
}

const RANK_DOT: Record<string, string> = {
  Starter: DS_COLORS.DISCOVER_CORAL,
  Builder: DS_COLORS.WARNING,
  Disciplined: DS_COLORS.DISCOVER_BLUE,
  Elite: DS_COLORS.CATEGORY_MIND,
  Legend: DS_COLORS.milestoneGold,
};

export default React.memo(function ProfileHeader({
  userId,
  avatarUrl,
  fullName,
  username,
  currentTier,
  joinDate,
  onShare,
  onAvatarUpdated,
  bio,
  showEditButton = true,
  followerCount,
  followingCount,
}: ProfileHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const displayName = fullName || username || "User";
  const cleanUsername = username?.trim() ?? "";
  const rankDot = RANK_DOT[currentTier] ?? DS_COLORS.DISCOVER_CORAL;
  const isOwnProfile = Boolean(userId) && showEditButton;

  const resolvedAvatarUrl = avatarOverride ?? avatarUrl ?? null;

  const handlePickPhoto = useCallback(async () => {
    if (!userId) return;
    setUploading(true);
    try {
      const outcome = await pickAndUploadAvatar(userId);
      if (outcome.status === "ok") {
        setAvatarOverride(outcome.url);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        onAvatarUpdated?.();
      }
    } catch (error) {
      captureError(error, "ProfilePhotoUpload");
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarUpdated, queryClient]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={isOwnProfile ? () => void handlePickPhoto() : undefined}
        disabled={!isOwnProfile || uploading}
        accessibilityLabel={isOwnProfile ? "Change profile photo" : `Profile avatar for ${displayName}`}
        accessibilityRole={isOwnProfile ? "button" : "image"}
      >
        <Avatar url={resolvedAvatarUrl} name={displayName} userId={userId} size={80} />
        {isOwnProfile ? (
          <View style={styles.cameraOverlay}>
            {uploading ? (
              <ActivityIndicator size="small" color={DS_COLORS.TEXT_ON_DARK} />
            ) : (
              <Camera size={14} color={DS_COLORS.TEXT_ON_DARK} />
            )}
          </View>
        ) : null}
      </TouchableOpacity>
      <Text style={styles.fullName}>{displayName}</Text>
      {cleanUsername ? <Text style={styles.username}>@{cleanUsername}</Text> : null}
      <Text style={[styles.bio, !bio?.trim() && styles.bioPlaceholder]}>
        {bio?.trim() ? bio : "Add a bio to let people know who you are"}
      </Text>
      <View style={styles.pills}>
        <View style={styles.pill}>
          <View style={[styles.rankDot, { backgroundColor: rankDot }]} />
          <Text style={styles.pillText}>{currentTier}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.joinedText}>{`Joined ${joinDate ?? ""}`.trim()}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {showEditButton ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Edit your profile"
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : null}
        {onShare ? (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={onShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share your GRIIT profile"
          >
            <Share2 size={14} color={DS_COLORS.buttonDisabledText} />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {followerCount !== undefined && followingCount !== undefined ? (
        <View
          style={styles.socialRow}
          accessibilityRole="text"
          accessibilityLabel={`${followerCount} followers, ${followingCount} following`}
        >
          <Text style={styles.socialText}>{followerCount} followers</Text>
          <Text style={styles.socialText}> · </Text>
          <Text style={styles.socialText}>{followingCount} following</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: DS_SPACING.xl, paddingHorizontal: DS_SPACING.xl },
  avatarWrapper: { position: "relative", marginBottom: DS_SPACING.sm },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: DS_COLORS.FEED_USERNAME,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: DS_COLORS.BG_PAGE,
  },
  fullName: {
    marginTop: DS_SPACING.md,
    fontSize: 18,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    textAlign: "center",
  },
  username: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: DS_SPACING.xs,
    textAlign: "center",
  },
  bio: {
    marginTop: 6,
    paddingHorizontal: 40,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  bioPlaceholder: { color: DS_COLORS.grayMuted, fontStyle: "normal" },
  pills: { flexDirection: "row", justifyContent: "center", gap: DS_SPACING.sm, marginTop: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.WHITE,
    paddingVertical: DS_SPACING.xs,
    paddingHorizontal: DS_SPACING.md,
    borderRadius: DS_SPACING.md,
  },
  rankDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  joinedText: { fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_MUTED },
  actions: { flexDirection: "row", justifyContent: "center", gap: DS_SPACING.sm, marginTop: DS_SPACING.md },
  editBtn: {
    borderWidth: 1,
    borderColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 20,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.xl,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: DS_COLORS.DISCOVER_CORAL },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    borderRadius: 20,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.xl,
  },
  shareBtnText: { fontSize: 12, fontWeight: "600", color: DS_COLORS.buttonDisabledText },
  socialRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  socialText: { fontSize: 12, color: DS_COLORS.TEXT_MUTED },
});
