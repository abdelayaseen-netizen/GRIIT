import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Share2, Camera } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/utils";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
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
}: ProfileHeaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const displayName = fullName || username || "User";
  const cleanUsername = username?.trim() ?? "";
  const rankDot = RANK_DOT[currentTier] ?? DS_COLORS.DISCOVER_CORAL;
  const isOwnProfile = Boolean(userId) && showEditButton;

  const handlePickPhoto = useCallback(async () => {
    if (!userId) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const imageUri = result.assets[0].uri;
      setUploading(true);
      const uploadResult = await uploadAvatarFromUri(imageUri);
      if ("error" in uploadResult) {
        captureError(new Error(uploadResult.error), "ProfilePhotoUpload");
        return;
      }
      await trpcMutate(TRPC.profiles.update, { avatar_url: uploadResult.url });
      onAvatarUpdated?.();
    } catch (error) {
      captureError(error, "ProfilePhotoUpload");
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarUpdated]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={isOwnProfile ? () => void handlePickPhoto() : undefined}
        disabled={!isOwnProfile || uploading}
        accessibilityLabel={isOwnProfile ? "Change profile photo" : `Profile avatar for ${displayName}`}
        accessibilityRole={isOwnProfile ? "button" : "image"}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(cleanUsername || displayName || "G") }]}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
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
      </View>
      <View
        style={styles.socialRow}
        accessibilityRole="none"
        accessibilityLabel="0 followers, 0 following"
      >
        <Text style={styles.socialText}>0 followers</Text>
        <Text style={styles.socialText}> · </Text>
        <Text style={styles.socialText}>0 following</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: DS_SPACING.xl, paddingHorizontal: DS_SPACING.xl },
  avatarWrapper: { position: "relative", marginBottom: DS_SPACING.sm },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GRIIT_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: DS_COLORS.WHITE,
  },
  avatarLetter: { fontSize: DS_TYPOGRAPHY.SIZE_2XL, fontWeight: "700", color: DS_COLORS.white },
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
