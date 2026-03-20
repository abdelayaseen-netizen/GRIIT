import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type CommunityFilter = "global" | "friends" | "team";

const PILLS: Array<{ id: CommunityFilter; label: string }> = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
  { id: "team", label: "Team" },
];

export function CommunityHeader({
  selectedFilter,
  onSelectFilter,
}: {
  selectedFilter: CommunityFilter;
  onSelectFilter: (filter: CommunityFilter) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Proof of discipline.</Text>

      <View style={styles.pillRow}>
        {PILLS.map((pill) => {
          const isActive = selectedFilter === pill.id;
          return (
            <TouchableOpacity
              key={pill.id}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
              onPress={() => onSelectFilter(pill.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Show ${pill.label.toLowerCase()} community feed`}
            >
              <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  pillRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: "#1A1A1A",
  },
  pillInactive: {
    backgroundColor: "#fff",
  },
  pillText: {
    fontSize: 12,
  },
  pillTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  pillTextInactive: {
    color: "#555",
    fontWeight: "500",
  },
});
