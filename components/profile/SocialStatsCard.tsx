import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Users, Target, Award } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface SocialStatsCardProps {
  friendRank?: number | null;
  friendsCount: number;
  sharedChallenges?: number;
}

export default function SocialStatsCard({
  friendRank,
  friendsCount,
  sharedChallenges = 0,
}: SocialStatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Users size={18} color={Colors.text.primary} />
        <Text style={styles.title}>Social</Text>
      </View>
      <View style={styles.row}>
        {friendRank != null && friendRank > 0 && (
          <View style={styles.stat}>
            <Target size={20} color={Colors.accent} />
            <Text style={styles.statValue}>#{friendRank}</Text>
            <Text style={styles.statLabel}>Weekly rank</Text>
          </View>
        )}
        <View style={styles.stat}>
          <Users size={20} color={Colors.text.secondary} />
          <Text style={styles.statValue}>{friendsCount}</Text>
          <Text style={styles.statLabel}>Accountability partners</Text>
        </View>
        <View style={styles.stat}>
          <Award size={20} color={Colors.text.secondary} />
          <Text style={styles.statValue}>{sharedChallenges}</Text>
          <Text style={styles.statLabel}>Shared challenges</Text>
        </View>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  stat: {
    alignItems: "flex-start",
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
