import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

export type CommunityFilter = "global" | "friends" | "team";

const PILLS: Array<{ id: CommunityFilter; label: string }> = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
  { id: "team", label: "Team" },
];

export const CommunityHeader = React.memo(function CommunityHeader({
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
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_INK,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
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
    backgroundColor: DS_COLORS.DISCOVER_INK,
  },
  pillInactive: {
    backgroundColor: DS_COLORS.WHITE,
  },
  pillText: {
    fontSize: 12,
  },
  pillTextActive: {
    color: DS_COLORS.WHITE,
    fontWeight: "600",
  },
  pillTextInactive: {
    color: DS_COLORS.COMMUNITY_ACTION_GRAY,
    fontWeight: "500",
  },
});
