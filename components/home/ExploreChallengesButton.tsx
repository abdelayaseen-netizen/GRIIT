import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import Colors from "@/constants/colors";

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
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF0E8",
    borderRadius: 28,
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E8733A",
  },
  chevron: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E8733A",
  },
});
