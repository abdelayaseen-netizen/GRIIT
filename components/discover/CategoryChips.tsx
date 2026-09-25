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
import { DS_V3 } from "@/lib/design-system";

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
        const textColor = isSelected
          ? DS_V3.color.brand
          : DS_V3.color.textSecondary;
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
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelUnselected,
                { color: textColor },
              ]}
              numberOfLines={1}
            >
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
    gap: 9,
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
  },
  chipSelected: {
    backgroundColor: DS_V3.color.brandTint,
    borderColor: DS_V3.color.brandTint,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: undefined,
    fontSize: 14,
  },
  labelSelected: {
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
  },
  labelUnselected: {
    fontWeight: DS_V3.type.body.fontWeight,
  },
});
