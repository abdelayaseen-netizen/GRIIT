import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export function TaskChrome({
  title,
  label,
  dark,
  onBack,
}: {
  title: string;
  label?: string;
  dark?: boolean;
  onBack: () => void;
}) {
  const color = dark ? "rgba(255,255,255,0.6)" : DS_V3.color.textSecondary;
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.back,
          pressed && { backgroundColor: dark ? "rgba(255,255,255,0.1)" : DS_V3.color.surface },
        ]}
      >
        <View style={[styles.chevron, { borderColor: dark ? DS_V3.color.textPrimary : DS_V3.color.textPrimary }]} />
      </Pressable>
      <View style={styles.center}>
        {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
        <Text style={[styles.title, { color }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
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
  center: {
    flex: 1,
    marginRight: 44,
    alignItems: "center",
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
  },
  title: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
});
