import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface CompletedChallengeItem {
  id: string;
  challengeId: string;
  challengeName: string;
  completedAt: string;
}

export interface CompletedChallengesSectionProps {
  challenges: CompletedChallengeItem[];
  loading?: boolean;
}

export default function CompletedChallengesSection({
  challenges,
  loading,
}: CompletedChallengesSectionProps) {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Award size={18} color={Colors.text.primary} />
          <Text style={styles.title}>Challenge History</Text>
        </View>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Award size={18} color={Colors.text.primary} />
          <Text style={styles.title}>Challenge History</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completed challenges yet.</Text>
          <Text style={styles.emptySub}>Complete your first challenge to see your history here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Award size={18} color={Colors.text.primary} />
        <Text style={styles.title}>Challenge History</Text>
      </View>
      <View style={styles.list}>
        {challenges.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.challengeName} numberOfLines={1}>
                {c.challengeName}
              </Text>
              <Text style={styles.completedAt}>
                Completed {new Date(c.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.text.muted} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  loading: {
    fontSize: 14,
    color: Colors.text.tertiary,
    paddingHorizontal: 20,
  },
  empty: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  list: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  completedAt: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
