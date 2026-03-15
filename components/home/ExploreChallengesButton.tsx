import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_MEASURES } from "@/lib/design-system";

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
      <Text style={styles.label}>Explore Challenges</Text>
      <ChevronRight size={18} color={DS_COLORS.white} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    minHeight: DS_MEASURES.ctaHeight,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.lg,
    backgroundColor: DS_COLORS.exploreButtonBg,
    borderRadius: DS_RADIUS.ctaButton,
    width: "100%",
  },
  label: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: DS_TYPOGRAPHY.button.fontWeight,
    color: DS_COLORS.white,
  },
});
