import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share } from "react-native";
import { Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export interface ShareDisciplineCardProps {
  name: string;
  disciplineScore: number;
  currentStreak: number;
  tier: string;
  onShare?: () => void;
}

export default function ShareDisciplineCard({
  name,
  disciplineScore,
  currentStreak,
  tier,
  onShare,
}: ShareDisciplineCardProps) {
  const handleShare = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = `${name} on GRIIT — ${tier} Tier • ${disciplineScore} days secured • ${currentStreak} day streak. Join me!`;
    try {
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({ title: "My discipline stats", text: message });
        } else {
          await navigator.clipboard.writeText(message);
        }
      } else {
        await Share.share({ message, title: "My discipline stats" });
      }
      onShare?.();
    } catch {
      // User cancelled or failed
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.preview}>
        <Text style={styles.previewName}>{name}</Text>
        <Text style={styles.previewTier}>{tier} Tier</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Days secured</Text>
          <Text style={styles.previewValue}>{disciplineScore}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Current streak</Text>
          <Text style={styles.previewValue}>{currentStreak} days</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
        <Share2 size={18} color="#fff" />
        <Text style={styles.shareButtonText}>Share profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: {
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  previewTier: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
