import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Trophy, Lock } from "lucide-react-native";
import Colors from "@/constants/colors";

export type AchievementCategory = "consistency" | "challenge" | "discipline";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlocked: boolean;
  unlockDate?: string | null;
}

export interface AchievementsSectionProps {
  achievements: AchievementItem[];
  loading?: boolean;
}

export default function AchievementsSection({ achievements, loading }: AchievementsSectionProps) {
  const byCategory = achievements.reduce(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    },
    {} as Record<AchievementCategory, AchievementItem[]>
  );
  const order: AchievementCategory[] = ["consistency", "challenge", "discipline"];

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trophy size={18} color={Colors.text.primary} />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Trophy size={18} color={Colors.text.primary} />
        <Text style={styles.sectionTitle}>Achievements</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {order.flatMap((cat) =>
          (byCategory[cat] ?? []).map((a) => (
            <View
              key={a.id}
              style={[styles.badge, a.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}
            >
              <View
                style={[
                  styles.badgeIcon,
                  { backgroundColor: a.unlocked ? Colors.accent + "18" : "#F0EEEB" },
                ]}
              >
                {a.unlocked ? (
                  <Trophy size={16} color={Colors.accent} />
                ) : (
                  <Lock size={16} color={Colors.text.muted} />
                )}
              </View>
              <Text
                style={[styles.badgeTitle, !a.unlocked && styles.badgeTitleLocked]}
                numberOfLines={2}
              >
                {a.title}
              </Text>
              {a.description ? (
                <Text style={styles.badgeDesc} numberOfLines={1}>
                  {a.description}
                </Text>
              ) : null}
              {a.unlocked && a.unlockDate ? (
                <Text style={styles.badgeDate}>
                  {new Date(a.unlockDate).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: "row",
    paddingBottom: 8,
  },
  badge: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: Colors.card,
    borderColor: Colors.accent + "40",
  },
  badgeLocked: {
    backgroundColor: Colors.pill,
    borderColor: Colors.border,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  badgeTitleLocked: {
    color: Colors.text.tertiary,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  badgeDate: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
});
