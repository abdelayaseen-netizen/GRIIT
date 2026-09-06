/**
 * SegmentedControl — 01_components.md "SegmentedControl"
 * Laws: 23 (one selection language per screen; max one segmented control),
 * 20 (44 per item). Never stacked. Never with chips immediately beneath it.
 * Never a surface pill (spec Never; reference Primitives.tsx:81 uses surface).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export type SegmentedControlProps = {
  items: string[];
  value: string;
  onChange: (v: string) => void;
};

export default function SegmentedControl({
  items,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.track}>
      {items.map((item) => {
        const on = item === value;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={item}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(item)}
            style={({ pressed }) => [
              styles.item,
              on ? styles.itemOn : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: on ? DS_V3.color.textPrimary : DS_V3.color.textSecondary,
                  fontWeight: on ? DS_V3.type.bodyStrong.fontWeight : DS_V3.type.secondary.fontWeight,
                },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.pill,
    padding: DS_V3.space.xs / 2,
  },
  item: {
    flex: 1,
    height: DS_V3.size.tap,
    minHeight: DS_V3.size.tap,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  itemOn: {
    backgroundColor: DS_V3.color.border,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
  },
});
