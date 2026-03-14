import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type TwoColOptionCardProps = {
  icon: string;
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
};

export function TwoColOptionCard({
  icon,
  label,
  sub,
  selected,
  onPress,
}: TwoColOptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: selected ? 1.02 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected, scaleAnim]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
      >
        {selected ? (
          <View style={styles.checkWrap}>
            <Check size={12} color={DS_COLORS.white} strokeWidth={2.5} />
          </View>
        ) : null}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
        <Text style={styles.sub} numberOfLines={2}>{sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 16,
    padding: 16,
    position: "relative",
    minHeight: 100,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.cardSelectedBg,
  },
  checkWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    lineHeight: 18,
  },
});
