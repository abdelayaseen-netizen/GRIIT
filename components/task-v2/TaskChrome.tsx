import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";

export function TaskChrome({
  title,
  dark,
  onBack,
}: {
  title: string;
  dark?: boolean;
  onBack: () => void;
}) {
  const color = dark ? "rgba(255,255,255,0.6)" : DS_COLORS_V2.text.mutedWarm;
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.back,
          pressed && { backgroundColor: dark ? "rgba(255,255,255,0.1)" : DS_COLORS_V2.surface.warm },
        ]}
      >
        <View style={[styles.chevron, { borderColor: dark ? "#FFFFFF" : DS_COLORS_V2.text.primary }]} />
      </Pressable>
      <Text style={[styles.title, { color, marginRight: 44 }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    width: 11,
    height: 11,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
});
