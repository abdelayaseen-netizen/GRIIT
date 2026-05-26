import React, { useCallback } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import {
  Dumbbell,
  Brain,
  BookHeart,
  Target,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

/**
 * `all` is kept as an alias for legacy callers; new code should use `for_you`
 * which is the default landing chip on the redesigned Discover tab.
 */
export type DiscoverCategory =
  | "for_you"
  | "trending"
  | "all"
  | "body"
  | "mind"
  | "faith"
  | "focus";

export interface CategoryChipsProps {
  selected: DiscoverCategory;
  onSelect: (category: DiscoverCategory) => void;
}

interface ChipDef {
  id: DiscoverCategory;
  label: string;
  Icon: LucideIcon | null;
}

const CHIPS: ChipDef[] = [
  { id: "for_you", label: "For you", Icon: Sparkles },
  { id: "trending", label: "Trending", Icon: TrendingUp },
  { id: "body", label: "Body", Icon: Dumbbell },
  { id: "mind", label: "Mind", Icon: Brain },
  { id: "faith", label: "Faith", Icon: BookHeart },
  { id: "focus", label: "Focus", Icon: Target },
];

const ICON_SIZE = 13;

export const CategoryChips = React.memo(function CategoryChips({
  selected,
  onSelect,
}: CategoryChipsProps) {
  const handlePress = useCallback(
    (id: DiscoverCategory) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHIPS.map(({ id, label, Icon }) => {
        const isSelected = selected === id;
        const textColor = isSelected ? DS_COLORS.WHITE : DS_COLORS.TEXT_PRIMARY;
        return (
          <Pressable
            key={id}
            onPress={() => handlePress(id)}
            accessibilityRole="tab"
            accessibilityLabel={`Filter by ${label}`}
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            {Icon ? (
              <View style={styles.iconWrap}>
                <Icon size={ICON_SIZE} color={textColor} strokeWidth={2} />
              </View>
            ) : null}
            <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.WHITE,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  chipSelected: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderColor: DS_COLORS.TEXT_PRIMARY,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
});
