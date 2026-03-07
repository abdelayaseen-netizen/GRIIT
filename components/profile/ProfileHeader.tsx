import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import { Pencil, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

export interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName: string;
  username: string;
  disciplineTitle?: string;
  currentTier: string;
  joinDate?: string;
  onShare?: () => void;
}

const DISCIPLINE_LABELS: Record<string, string> = {
  Starter: "Discipline Athlete",
  Builder: "Discipline Athlete",
  Relentless: "Discipline Athlete",
  Elite: "Discipline Elite",
};

export default function ProfileHeader({
  avatarUrl,
  fullName,
  username,
  disciplineTitle,
  currentTier,
  joinDate,
  onShare,
}: ProfileHeaderProps) {
  const router = useRouter();
  const label = disciplineTitle ?? DISCIPLINE_LABELS[currentTier] ?? "Discipline Athlete";
  const identityLine = `${currentTier} Tier • ${label}`;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.fullName}>{fullName}</Text>
      <Text style={styles.username}>@{username}</Text>
      <View style={styles.tierBadge}>
        <Text style={styles.tierBadgeText}>{identityLine}</Text>
      </View>
      {joinDate ? (
        <Text style={styles.joinDate}>Joined {joinDate}</Text>
      ) : null}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/edit-profile" as any);
          }}
          activeOpacity={0.7}
        >
          <Pencil size={14} color={Colors.text.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.7}>
          <Share2 size={14} color={Colors.text.primary} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.accent,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  username: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  tierBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.pill,
    borderRadius: 20,
  },
  tierBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  joinDate: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});
