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
          {
            borderColor: selected ? DS_COLORS.accent : DS_COLORS.borderDark,
            borderWidth: selected ? 2 : 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
      >
        {selected ? (
          <View style={styles.checkWrap}>
            <Check size={16} color={DS_COLORS.onboardingBg} strokeWidth={2.5} />
          </View>
        ) : null}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
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
    backgroundColor: DS_COLORS.textPrimaryAlt,
    borderRadius: 16,
    padding: 16,
    position: "relative",
    minHeight: 120,
  },
  checkWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
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
    color: DS_COLORS.white,
    lineHeight: 20,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: DS_COLORS.textSecondary,
    lineHeight: 16,
  },
});
