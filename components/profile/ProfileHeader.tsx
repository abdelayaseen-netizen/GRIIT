import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Share2 } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/utils";

export interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName: string;
  username?: string;
  currentTier: string;
  joinDate?: string;
  onShare?: () => void;
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
  fullName,
  username,
  currentTier,
  joinDate,
  onShare,
  bio,
  showEditButton = true,
}: ProfileHeaderProps) {
  const router = useRouter();
  const displayName = fullName || username || "User";
  const cleanUsername = username?.trim() ?? "";
  const rankDot = RANK_DOT[currentTier] ?? DS_COLORS.DISCOVER_CORAL;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.avatarWrap}
        accessibilityRole="image"
        accessibilityLabel={`Profile avatar for ${displayName}`}
      >
        <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(cleanUsername || displayName || "G") }]}>
          <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
      </Pressable>
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
  avatarWrap: { marginBottom: DS_SPACING.sm },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
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
