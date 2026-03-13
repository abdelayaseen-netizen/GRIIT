import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Check } from "lucide-react-native";

const CARD_BG = "#141414";
const BORDER_UNSELECTED = "#333333";
const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

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
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: selected ? 1.02 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: selected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected, scaleAnim, borderAnim]);

  const borderColor = selected ? ACCENT : BORDER_UNSELECTED;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor,
            borderWidth: selected ? 2 : 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
      >
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {selected ? (
          <View style={styles.checkWrap}>
            <Check size={20} color="#0A0A0A" strokeWidth={2.5} />
          </View>
        ) : null}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  checkWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
});
