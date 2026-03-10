import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import Colors from "@/constants/colors";

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

export default function ProfileHeader({
  avatarUrl,
  fullName,
  username,
  disciplineTitle,
  currentTier,
  joinDate,
  onShare,
  bio,
  showEditButton = true,
}: ProfileHeaderProps) {
  const router = useRouter();
  const displayName = fullName || username || "User";

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
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
        <View style={[styles.tierDot, { backgroundColor: Colors.accent }]} />
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
          >
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.7}>
          <Text style={styles.shareBtnText}>🔗 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BORDER_PILL = "#E0DDD8";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    marginBottom: 12,
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
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  username: {
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: "center",
  },
  bioPill: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0EDE8",
  },
  bioPillText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  joinDate: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  editBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    height: 40,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_PILL,
    backgroundColor: Colors.card,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  shareBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    height: 40,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_PILL,
    backgroundColor: Colors.card,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});
