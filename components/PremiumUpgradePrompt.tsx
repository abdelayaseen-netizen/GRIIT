import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Crown } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

export interface PremiumUpgradePromptProps {
  feature: string;
  benefit: string;
  onUpgrade?: () => void;
}

/**
 * Reusable upgrade prompt. Not wired anywhere yet — drop in when gating premium features.
 * Button: onUpgrade if provided, otherwise Alert "Coming Soon".
 * Uses useTheme() so it works in dark mode.
 */
export default function PremiumUpgradePrompt({
  feature,
  benefit,
  onUpgrade,
}: PremiumUpgradePromptProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onUpgrade) {
      onUpgrade();
    } else {
      Alert.alert("Coming Soon", "Premium is coming in a future update!");
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
        <Crown size={20} color={colors.accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.feature, { color: colors.text.primary }]}>{feature}</Text>
        <Text style={[styles.benefit, { color: colors.text.secondary }]}>{benefit}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  textWrap: {
    gap: 2,
  },
  feature: {
    fontSize: 15,
    fontWeight: "600",
  },
  benefit: {
    fontSize: 13,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
