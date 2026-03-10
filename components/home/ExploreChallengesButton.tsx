import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { ChevronRight, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import Colors from "@/constants/colors";
import { designTokens } from "@/lib/design-tokens";

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
      <Sparkles size={18} color={Colors.accent} />
      <Text style={styles.label}>Explore challenges</Text>
      <ChevronRight size={18} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.accentLight,
    borderRadius: designTokens.cardRadius,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.accent,
  },
});
