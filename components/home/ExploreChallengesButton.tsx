import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

export default function ExploreChallengesButton() {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.TABS_DISCOVER as never);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.85}
      testID="explore-challenges-button"
    >
      <Sparkles size={18} color={DS_COLORS.accent} />
      <Text style={styles.label}>Explore challenges</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.lg,
    backgroundColor: DS_COLORS.accentSoft,
    borderRadius: DS_RADIUS.buttonPill,
    width: "100%",
  },
  label: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600",
    color: DS_COLORS.accent,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "600",
    color: DS_COLORS.accent,
  },
});
