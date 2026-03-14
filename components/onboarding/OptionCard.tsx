import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type OptionCardProps = {
  icon: string;
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
};

export function OptionCard({ icon, label, sub, selected, onPress, badge }: OptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: selected ? 1.02 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
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
  card: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: "relative",
    overflow: "visible",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.cardSelectedBg,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: DS_COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "visible",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  checkWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    lineHeight: 18,
  },
});
