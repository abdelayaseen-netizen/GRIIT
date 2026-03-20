import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Share2 } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";

export interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName: string;
  username: string;
  currentTier: string;
  joinDate?: string;
  onShare?: () => void;
  bio?: string;
  showEditButton?: boolean;
}

const RANK_DOT: Record<string, string> = {
  Starter: "#E8593C",
  Builder: "#FF9800",
  Disciplined: "#5B7FD4",
  Elite: "#9C27B0",
  Legend: "#FFD700",
};

export default function ProfileHeader({
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
  const rankDot = RANK_DOT[currentTier] ?? "#E8593C";

  return (
    <View style={styles.container}>
      <Pressable style={styles.avatarWrap}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
      </Pressable>
      <Text style={styles.fullName}>{displayName}</Text>
      <Text style={styles.username}>@{username || "user"}</Text>
      <Text style={[styles.bio, !bio?.trim() && styles.bioPlaceholder]}>{bio?.trim() ? bio : "Tap edit to add a bio"}</Text>
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
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push(ROUTES.EDIT_PROFILE as never)} activeOpacity={0.7}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.7}>
          <Share2 size={14} color="#888" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.socialRow}>
        <Text style={styles.socialText}>0 followers</Text>
        <Text style={styles.socialText}> · </Text>
        <Text style={styles.socialText}>0 following</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 24 },
  avatarWrap: { marginBottom: 8 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 28, fontWeight: "700", color: "#fff" },
  fullName: { marginTop: 12, fontSize: 18, fontWeight: "700", color: "#1A1A1A", textAlign: "center" },
  username: { fontSize: 12, color: "#999", marginTop: 4, textAlign: "center" },
  bio: { marginTop: 6, paddingHorizontal: 40, fontSize: 13, color: "#666", textAlign: "center" },
  bioPlaceholder: { color: "#BBB", fontStyle: "italic" },
  pills: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 10 },
  pill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  rankDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontSize: 11, fontWeight: "600", color: "#1A1A1A" },
  joinedText: { fontSize: 11, color: "#999" },
  actions: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 },
  editBtn: { borderWidth: 1, borderColor: "#E8593C", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  editBtnText: { fontSize: 12, fontWeight: "600", color: "#E8593C" },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#D9D5CC", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  shareBtnText: { fontSize: 12, fontWeight: "600", color: "#888" },
  socialRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  socialText: { fontSize: 12, color: "#999" },
});
