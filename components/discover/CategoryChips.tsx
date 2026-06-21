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
import { DS_DAYLIGHT } from "@/lib/design-system";

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
          ? DS_DAYLIGHT.color.accent
          : DS_DAYLIGHT.color.inkSecondary;
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
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingVertical: DS_DAYLIGHT.space.rowGapV,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: DS_DAYLIGHT.radius.pill,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  chipSelected: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    borderColor: DS_DAYLIGHT.color.accentTint,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 14,
  },
  labelSelected: {
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },
  labelUnselected: {
    fontWeight: DS_DAYLIGHT.weight.regular,
  },
});
