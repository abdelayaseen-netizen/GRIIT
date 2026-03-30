import React, { useState } from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";

export type DiscoverFilterId = "All" | "Easy" | "7 days" | "Physical" | "Mental" | "Spiritual";

interface FilterChipsProps {
  onFilterChange: (filter: DiscoverFilterId) => void;
}

const FILTERS: DiscoverFilterId[] = ["All", "Easy", "7 days", "Physical", "Mental", "Spiritual"];

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [active, setActive] = useState<DiscoverFilterId>("All");

  const handlePress = (filter: DiscoverFilterId) => {
    setActive(filter);
    onFilterChange(filter);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => (
        <Pressable
          key={filter}
          onPress={() => handlePress(filter)}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${filter}`}
          accessibilityState={{ selected: active === filter }}
          style={[styles.chip, active === filter && styles.chipActive]}
        >
          <Text style={[styles.chipText, active === filter && styles.chipTextActive]}>{filter}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.SURFACE,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
  },
  chipActive: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderColor: DS_COLORS.TEXT_PRIMARY,
  },
  chipText: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  chipTextActive: {
    color: DS_COLORS.WHITE,
    fontWeight: "500",
  },
});
