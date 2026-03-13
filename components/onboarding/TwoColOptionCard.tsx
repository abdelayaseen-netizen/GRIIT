import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Check } from "lucide-react-native";

const CARD_BG = "#141414";
const BORDER_UNSELECTED = "#333333";
const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

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
            borderColor: selected ? ACCENT : BORDER_UNSELECTED,
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
            <Check size={16} color="#0A0A0A" strokeWidth={2.5} />
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
    backgroundColor: CARD_BG,
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
    backgroundColor: ACCENT,
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
    color: TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
});
